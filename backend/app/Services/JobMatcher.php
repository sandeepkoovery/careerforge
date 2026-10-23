<?php

namespace App\Services;

use App\Support\Lexicon;

/**
 * Compares a resume to a job description and reports keyword coverage.
 */
class JobMatcher
{
    public function match(string $resume, string $jobDescription): array
    {
        $rl = mb_strtolower($resume);
        $jl = mb_strtolower($jobDescription);

        $terms = [];
        $skillWords = [];

        foreach (Lexicon::SKILLS as $skill) {
            $c = Lexicon::count($jl, $skill);
            if ($c > 0) {
                $terms[$skill] = ['term' => $skill, 'type' => 'skill', 'count' => $c, 'weight' => 3 + min(2, $c - 1)];
                foreach (preg_split('/[^\p{L}\p{N}\+\#\.]+/u', $skill) as $w) {
                    $skillWords[Lexicon::stem($w)] = true;
                }
            }
        }

        // Generic keywords: repeated non-stopword tokens.
        $stops = array_flip(Lexicon::STOPWORDS);
        $freq = [];
        $display = [];
        foreach (preg_split('/[^\p{L}\p{N}\+\#]+/u', $jl, -1, PREG_SPLIT_NO_EMPTY) as $tok) {
            if (mb_strlen($tok) < 4 || isset($stops[$tok]) || is_numeric($tok)) {
                continue;
            }
            $stem = Lexicon::stem($tok);
            if (isset($skillWords[$stem])) {
                continue;
            }
            $freq[$stem] = ($freq[$stem] ?? 0) + 1;
            $display[$stem] ??= $tok;
        }
        arsort($freq);
        foreach (array_slice($freq, 0, 40, true) as $stem => $c) {
            if ($c < 2) {
                continue;
            }
            $terms['kw:'.$stem] = ['term' => $display[$stem], 'type' => 'keyword', 'count' => $c, 'weight' => $c >= 3 ? 2 : 1, 'stem' => $stem];
        }

        $resumeStems = [];
        foreach (preg_split('/[^\p{L}\p{N}\+\#]+/u', $rl, -1, PREG_SPLIT_NO_EMPTY) as $tok) {
            $resumeStems[Lexicon::stem($tok)] = true;
        }

        $matched = [];
        $missing = [];
        $total = 0;
        $got = 0;
        $bucket = ['skill' => [0, 0], 'keyword' => [0, 0]];

        foreach ($terms as $t) {
            $hit = $t['type'] === 'skill' ? Lexicon::has($rl, $t['term']) : isset($resumeStems[$t['stem']]);
            $total += $t['weight'];
            $bucket[$t['type']][1]++;
            $row = ['term' => $t['term'], 'type' => $t['type'], 'importance' => $t['weight'] >= 4 ? 'high' : ($t['weight'] >= 3 ? 'medium' : 'low')];
            if ($hit) {
                $got += $t['weight'];
                $bucket[$t['type']][0]++;
                $matched[] = $row;
            } else {
                $missing[] = $row;
            }
        }

        $weight = ['high' => 0, 'medium' => 1, 'low' => 2];
        usort($missing, fn ($a, $b) => [$a['type'] === 'skill' ? 0 : 1, $weight[$a['importance']]] <=> [$b['type'] === 'skill' ? 0 : 1, $weight[$b['importance']]]);

        $score = $total ? (int) round(100 * $got / $total) : 0;
        $pct = fn ($b) => $b[1] ? (int) round(100 * $b[0] / $b[1]) : null;

        $suggestions = [];
        foreach (array_slice($missing, 0, 6) as $m) {
            $suggestions[] = $m['type'] === 'skill'
                ? "Add \"{$m['term']}\" to your Skills section and reference it in a bullet where you used it."
                : "Mirror the job's language — work \"{$m['term']}\" naturally into your summary or experience.";
        }
        if ($score < 60) {
            $suggestions[] = 'Tailor your professional summary to echo the role title and top requirements.';
        }
        if (! $suggestions) {
            $suggestions[] = 'Your resume covers the key requirements. Focus on quantifying results to stand out.';
        }

        return [
            'score' => $score,
            'verdict' => match (true) {
                $score >= 80 => 'Strong match',
                $score >= 60 => 'Good match',
                $score >= 40 => 'Partial match',
                default => 'Weak match',
            },
            'matched' => $matched,
            'missing' => $missing,
            'coverage' => ['skills' => $pct($bucket['skill']), 'keywords' => $pct($bucket['keyword'])],
            'suggestions' => $suggestions,
        ];
    }
}
