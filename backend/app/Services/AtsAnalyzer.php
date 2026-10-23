<?php

namespace App\Services;

use App\Support\Lexicon;

/**
 * Deterministic ATS compatibility scorer. Works on plain text so it can score
 * uploaded files as well as resumes built inside the app.
 */
class AtsAnalyzer
{
    public function __construct(private JobMatcher $matcher) {}

    public function analyze(string $text, ?string $jobDescription = null): array
    {
        $text = trim($text);
        $lower = mb_strtolower($text);
        $sections = SectionParser::parse($text);
        $wordCount = preg_match_all('/[\p{L}\p{N}][\p{L}\p{N}\+\#\.\-\']*/u', $text);

        // Bullet candidates: explicit bullets, or sentences inside experience/project sections.
        $bullets = [];
        foreach (['experience', 'projects'] as $key) {
            foreach ($sections[$key] ?? [] as $line) {
                $clean = SectionParser::stripBullet($line);
                $isDateLine = (bool) preg_match('/\b(19|20)\d{2}\b.*(present|current|\b(19|20)\d{2}\b)/i', $clean) && mb_strlen($clean) < 70;
                if (! $isDateLine && str_word_count($clean) >= 5) {
                    $bullets[] = $clean;
                }
            }
        }

        $checks = [];
        $recs = [];
        $strengths = [];

        // 1. Contact information (15)
        $hasEmail = (bool) preg_match('/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i', $text);
        $hasPhone = (bool) preg_match('/(\+?\d[\d\s().-]{7,}\d)/', $text);
        $hasLink = (bool) preg_match('/(linkedin\.com|github\.com|behance\.net|dribbble\.com|https?:\/\/|www\.)/i', $text);
        $contact = ($hasEmail ? 5 : 0) + ($hasPhone ? 5 : 0) + ($hasLink ? 5 : 0);
        $checks[] = $this->check('contact', 'Contact information', $contact, 15,
            $contact === 15 ? 'Email, phone and a profile link were detected.' : 'Some contact details could not be detected.');
        if (! $hasEmail) {
            $recs[] = $this->rec('high', 'Add a professional email address', 'ATS and recruiters need a clear way to reach you. Put your email in the header as plain text.');
        }
        if (! $hasPhone) {
            $recs[] = $this->rec('medium', 'Add a phone number', 'Include a phone number in the header so recruiters can contact you quickly.');
        }
        if (! $hasLink) {
            $recs[] = $this->rec('low', 'Add a LinkedIn or portfolio link', 'A profile link gives recruiters more context and is parsed well by most ATS.');
        }
        if ($contact === 15) {
            $strengths[] = 'Complete contact details';
        }

        // 2. Standard sections (20)
        $has = fn ($k) => ! empty($sections[$k]);
        $sectionScore = ($has('experience') ? 6 : 0) + ($has('education') ? 5 : 0) + ($has('skills') ? 5 : 0)
            + ($has('summary') ? 2 : 0) + (($has('projects') || $has('certifications')) ? 2 : 0);
        $checks[] = $this->check('sections', 'Standard sections', $sectionScore, 20,
            $sectionScore >= 16 ? 'Clear, ATS-recognisable section headings found.' : 'Some expected section headings are missing or unclear.');
        foreach ([
            'experience' => ['high', 'Add a "Work Experience" section', 'ATS parsers look for a clearly labelled experience section. Use a standard heading.'],
            'education' => ['medium', 'Add an "Education" section', 'Include your degree, institution and graduation year under a standard "Education" heading.'],
            'skills' => ['high', 'Add a dedicated "Skills" section', 'A keyword-rich skills section is the easiest way to improve keyword matching.'],
            'summary' => ['low', 'Add a short professional summary', 'Two to three lines at the top help recruiters and ATS understand your focus quickly.'],
        ] as $key => [$sev, $title, $detail]) {
            if (! $has($key)) {
                $recs[] = $this->rec($sev, $title, $detail);
            }
        }
        if ($sectionScore >= 16) {
            $strengths[] = 'Well-structured, standard section headings';
        }

        // 3. Action verbs & language (20)
        $verbSet = array_flip(Lexicon::ACTION_VERBS);
        $strongCount = 0;
        foreach ($bullets as $b) {
            $first = mb_strtolower(preg_replace('/[^\p{L}]/u', '', strtok($b, ' ') ?: ''));
            if (isset($verbSet[$first])) {
                $strongCount++;
            }
        }
        $weakHits = 0;
        foreach (Lexicon::WEAK_PHRASES as $p) {
            $weakHits += Lexicon::count($lower, $p);
        }
        $ratio = count($bullets) ? $strongCount / count($bullets) : 0;
        $verbScore = (int) max(0, round(20 * min(1, $ratio / 0.7)) - min(6, $weakHits * 2));
        $checks[] = $this->check('verbs', 'Action verbs & language', $verbScore, 20,
            count($bullets) ? sprintf('%d of %d achievement lines start with a strong action verb.', $strongCount, count($bullets)) : 'No achievement bullets were detected.');
        if ($ratio < 0.6) {
            $recs[] = $this->rec('high', 'Start bullets with strong action verbs', 'Lead each bullet with verbs like "Led", "Built", "Optimized" or "Delivered" instead of passive phrasing.');
        } else {
            $strengths[] = 'Strong action-verb language';
        }
        if ($weakHits > 0) {
            $recs[] = $this->rec('medium', 'Replace weak phrases', sprintf('Found %d weak phrase(s) such as "responsible for" or "worked on". Rewrite them to show ownership and outcome.', $weakHits));
        }

        // 4. Quantified achievements (15)
        $quant = 0;
        foreach ($bullets as $b) {
            $stripped = preg_replace('/\b(19|20)\d{2}\b/', '', $b);
            if (preg_match('/\d+\s?%|[$€£₹]\s?\d|\b\d+(?:[.,]\d+)?\s?(?:k|m|x|million|billion|users|clients|customers|projects|people|members|hours|days)\b|\b\d{2,}\b/i', $stripped)) {
                $quant++;
            }
        }
        $qRatio = count($bullets) ? $quant / count($bullets) : 0;
        $quantScore = (int) round(15 * min(1, $qRatio / 0.4));
        $checks[] = $this->check('metrics', 'Quantified achievements', $quantScore, 15,
            count($bullets) ? sprintf('%d of %d bullets include measurable results.', $quant, count($bullets)) : 'No measurable results detected.');
        if ($qRatio < 0.3) {
            $recs[] = $this->rec('high', 'Quantify your impact', 'Add numbers to at least a third of your bullets — percentages, revenue, team size, users, time saved.');
        } else {
            $strengths[] = 'Achievements backed by numbers';
        }

        // 5. Length (10)
        $lengthScore = match (true) {
            $wordCount >= 350 && $wordCount <= 900 => 10,
            $wordCount >= 200 && $wordCount <= 1100 => 6,
            $wordCount >= 120 => 3,
            default => 0,
        };
        $checks[] = $this->check('length', 'Resume length', $lengthScore, 10, sprintf('%d words detected (ideal: 350–900).', $wordCount));
        if ($wordCount < 350) {
            $recs[] = $this->rec('medium', 'Add more detail', 'Your resume looks short. Expand on responsibilities, projects and results to reach roughly one full page.');
        } elseif ($wordCount > 900) {
            $recs[] = $this->rec('medium', 'Tighten your content', 'Your resume is long. Trim older or less relevant roles and keep it to one or two pages.');
        } else {
            $strengths[] = 'Ideal resume length';
        }

        // 6. Formatting & parsing safety (10)
        $fmt = 10;
        if (preg_match('/[│┃■□★☆◆◇►✔✓☎✉●]/u', $text)) {
            $fmt -= 3;
            $recs[] = $this->rec('medium', 'Remove decorative symbols', 'Icons and special glyphs are often misread by ATS. Use plain text labels instead.');
        }
        if (preg_match_all('/\b(I|my|me)\b/', $text) > 4) {
            $fmt -= 2;
            $recs[] = $this->rec('low', 'Avoid first-person pronouns', 'Write in implied first person: "Led a team of 5" rather than "I led my team of 5".');
        }
        $lines = array_filter(array_map('trim', preg_split('/\r?\n/', $text)));
        $longLines = count(array_filter($lines, fn ($l) => mb_strlen($l) > 220));
        if ($lines && $longLines / count($lines) > 0.2) {
            $fmt -= 2;
            $recs[] = $this->rec('low', 'Break up long paragraphs', 'Dense blocks of text are hard to scan. Use short bullet points of one or two lines.');
        }
        $caps = preg_match_all('/\b\p{Lu}{4,}\b/u', $text);
        if ($wordCount && $caps / $wordCount > 0.12) {
            $fmt -= 2;
            $recs[] = $this->rec('low', 'Reduce ALL-CAPS text', 'Reserve capitals for section headings only.');
        }
        $fmt = max(0, $fmt);
        $checks[] = $this->check('format', 'Formatting & parsing', $fmt, 10,
            $fmt >= 9 ? 'Text parsed cleanly with no layout red flags.' : 'Some formatting could confuse ATS parsers.');
        if ($fmt >= 9) {
            $strengths[] = 'Clean, parser-friendly formatting';
        }

        // 7. Keywords (10)
        $keywordResult = null;
        if ($jobDescription && mb_strlen(trim($jobDescription)) > 40) {
            $keywordResult = $this->matcher->match($text, $jobDescription);
            $kScore = (int) round($keywordResult['score'] / 10);
            $kDetail = sprintf('%d%% match with the supplied job description.', $keywordResult['score']);
            if ($keywordResult['missing']) {
                $top = implode(', ', array_slice(array_column($keywordResult['missing'], 'term'), 0, 5));
                $recs[] = $this->rec('high', 'Add missing job keywords', "The job description mentions: {$top}. Work in the ones you genuinely have.");
            }
        } else {
            $found = array_filter(Lexicon::SKILLS, fn ($s) => Lexicon::has($lower, $s));
            $kScore = (int) round(10 * min(1, count($found) / 12));
            $kDetail = sprintf('%d recognised industry skills found.', count($found));
            if (count($found) < 8) {
                $recs[] = $this->rec('medium', 'Include more relevant skills & keywords', 'Add tools, technologies and domain terms from the roles you are targeting. Tip: paste a job description for a tailored check.');
            }
        }
        $checks[] = $this->check('keywords', 'Keyword relevance', $kScore, 10, $kDetail);

        $score = array_sum(array_column($checks, 'score'));
        $order = ['high' => 0, 'medium' => 1, 'low' => 2];
        usort($recs, fn ($a, $b) => $order[$a['severity']] <=> $order[$b['severity']]);

        return [
            'score' => $score,
            'grade' => match (true) {
                $score >= 85 => 'Excellent',
                $score >= 70 => 'Good',
                $score >= 50 => 'Needs work',
                default => 'Poor',
            },
            'breakdown' => $checks,
            'recommendations' => $recs,
            'strengths' => array_values(array_unique($strengths)),
            'keywords' => $keywordResult,
            'stats' => [
                'words' => $wordCount,
                'bullets' => count($bullets),
                'strong_verbs' => $strongCount,
                'quantified' => $quant,
                'sections' => array_values(array_filter(array_keys($sections), fn ($k) => $k !== 'header' && ! empty($sections[$k]))),
            ],
            'text_preview' => mb_substr($text, 0, 1800),
        ];
    }

    private function check(string $key, string $label, int $score, int $max, string $detail): array
    {
        $pct = $max ? $score / $max : 0;

        return [
            'key' => $key,
            'label' => $label,
            'score' => $score,
            'max' => $max,
            'status' => $pct >= 0.8 ? 'good' : ($pct >= 0.5 ? 'warn' : 'bad'),
            'detail' => $detail,
        ];
    }

    private function rec(string $severity, string $title, string $detail): array
    {
        return compact('severity', 'title', 'detail');
    }
}
