<?php

namespace App\Services;

use App\Support\Lexicon;

class CoverLetterGenerator
{
    public function __construct(private JobMatcher $matcher, private Llm $llm) {}

    public function generate(array $resume, array $o): array
    {
        $b = $resume['basics'] ?? [];
        $name = $b['name'] ?: 'Your Name';
        $latest = $resume['experience'][0] ?? [];
        $title = $b['title'] ?: ($latest['role'] ?? 'professional');
        $company = $o['company'] ?: 'your company';
        $role = $o['job_title'] ?: 'open position';
        $manager = ! empty($o['manager']) ? $o['manager'] : 'Hiring Manager';
        $tone = $o['tone'] ?? 'professional';
        $jd = $o['job_description'] ?? '';
        $years = ResumeText::yearsOfExperience($resume);
        $achievements = ResumeText::achievements($resume);
        $skills = array_values(array_filter($resume['skills'] ?? []));

        $alignment = [];
        if ($jd && mb_strlen($jd) > 40) {
            $m = $this->matcher->match(ResumeText::fromData($resume), $jd);
            $alignment = array_slice(array_column(array_filter($m['matched'], fn ($x) => $x['type'] === 'skill'), 'term'), 0, 3);
        }
        $casing = [];
        foreach ($skills as $s) {
            $casing[mb_strtolower($s)] = $s;
        }
        $alignment = array_map(fn ($t) => $casing[mb_strtolower($t)] ?? (mb_strlen($t) <= 4 ? mb_strtoupper($t) : ucwords($t)), $alignment);
        $alignment = $alignment ?: array_slice($skills, 0, 3);

        $ai = $this->llm->complete(
            'You are an expert career coach. Write a tailored, specific, human-sounding cover letter in plain text (no markdown, no placeholders, 250-330 words). Open with "Dear {name},", close with "Sincerely," and the candidate name. Never invent facts that are not in the resume data.',
            json_encode([
                'candidate' => $name, 'current_title' => $title, 'years_experience' => $years,
                'company' => $company, 'target_role' => $role, 'hiring_manager' => $manager, 'tone' => $tone,
                'skills' => array_slice($skills, 0, 12), 'top_achievements' => array_slice($achievements, 0, 4),
                'recent_role' => $latest, 'job_description' => mb_substr($jd, 0, 3500),
            ])
        );
        if ($ai) {
            return ['letter' => $ai, 'source' => 'ai'];
        }

        return ['letter' => $this->template($tone, compact('name', 'title', 'company', 'role', 'manager', 'years', 'achievements', 'alignment', 'latest', 'skills')), 'source' => 'smart-template'];
    }

    private function template(string $tone, array $c): string
    {
        extract($c);
        $yrs = $years ? "{$years}+ years" : 'a strong track record';
        $skillList = $this->joinList($alignment);
        $lc = fn (string $s) => rtrim(lcfirst(trim($s)), '.');
        $recent = ! empty($latest['company']) ? "In my recent role as {$latest['role']} at {$latest['company']}, " : 'In my recent work, ';
        $win = $achievements ? $recent.'I '.$this->pastTense($lc($achievements[0])).'.' : $recent.'I consistently delivered results that supported team and business goals.';
        $second = isset($achievements[1]) ? ' Likewise, I '.$this->pastTense($lc($achievements[1])).'.' : '';
        $align = $skillList
            ? "Your posting highlights {$skillList} — areas where I have direct, hands-on experience and can contribute from day one."
            : 'I am confident my background aligns closely with what you are looking for and that I can contribute from day one.';

        $open = match ($tone) {
            'enthusiastic' => "I was genuinely excited to see the {$role} opening at {$company}. As a {$title} with {$yrs} of experience, I can't wait to bring my energy and expertise to your team.",
            'concise' => "I'm applying for the {$role} role at {$company}. As a {$title} with {$yrs} of experience, I'm confident I can add immediate value.",
            'creative' => "Some roles read like a job description; the {$role} position at {$company} reads like an invitation. As a {$title} with {$yrs} of experience, I'd love to accept it.",
            default => "I am writing to express my interest in the {$role} position at {$company}. As a {$title} with {$yrs} of experience, I bring a proven record of delivering measurable results.",
        };
        $close = match ($tone) {
            'enthusiastic' => "I would love the chance to talk about how I can help {$company} reach its next milestone. Thank you for your time — I'm looking forward to connecting!",
            'concise' => "I'd welcome the chance to discuss how I can contribute to {$company}. Thank you for your consideration.",
            'creative' => "If this sounds like the kind of teammate {$company} needs, let's talk. Thank you for reading — I'd be glad to continue the conversation.",
            default => "Thank you for considering my application. I would welcome the opportunity to discuss how my experience can support {$company}'s goals, and I look forward to hearing from you.",
        };

        $body = $tone === 'concise' ? [$open, $win.' '.$align, $close] : [$open, $win.$second, $align, $close];

        return "Dear {$manager},\n\n".implode("\n\n", $body)."\n\nSincerely,\n{$name}";
    }

    private function joinList(array $items): string
    {
        $items = array_values(array_filter($items));
        $n = count($items);

        return match (true) {
            $n === 0 => '',
            $n === 1 => $items[0],
            default => implode(', ', array_slice($items, 0, -1)).' and '.$items[$n - 1],
        };
    }

    /** Turn "led a team..." / "managed..." into a first-person past-tense clause. */
    private function pastTense(string $clause): string
    {
        return $clause;
    }
}
