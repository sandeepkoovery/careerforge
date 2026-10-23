<?php

namespace App\Services;

use App\Support\Lexicon;

class LinkedInOptimizer
{
    public function __construct(private Llm $llm) {}

    public function optimize(array $resume, array $o): array
    {
        $b = $resume['basics'] ?? [];
        $latest = $resume['experience'][0] ?? [];
        $title = $o['target_role'] ?: ($b['title'] ?: ($latest['role'] ?? 'Professional'));
        $skills = array_values(array_filter($resume['skills'] ?? []));
        $years = ResumeText::yearsOfExperience($resume);
        $wins = ResumeText::achievements($resume);
        $company = $latest['company'] ?? '';

        $top = array_slice($skills, 0, 3);
        $headlines = [
            trim($title.($top ? ' | '.implode(' • ', $top) : '').($years ? " | {$years}+ years of experience" : '')),
            $title.($company ? " at {$company}" : '').($top ? ' — '.implode(', ', array_slice($top, 0, 2)) : ''),
            $title.' who turns '.($top[0] ?? 'ideas').' into measurable results'.($wins && mb_strlen($wins[0]) <= 60 ? ' | '.rtrim($wins[0], '.') : ''),
        ];

        $about = $this->about($b, $title, $skills, $wins, $years);
        $source = 'smart-template';

        $ai = $this->llm->json(
            'You are a LinkedIn profile writer. Return {"headlines":[3 strings under 220 chars],"about":"first-person About section 900-1500 chars with a hook, proof points and a call to action"}. Use only facts from the data.',
            json_encode(['title' => $title, 'skills' => array_slice($skills, 0, 15), 'years' => $years, 'achievements' => array_slice($wins, 0, 5), 'summary' => $b['summary'] ?? '', 'experience' => array_slice($resume['experience'] ?? [], 0, 3)])
        );
        if ($ai && ! empty($ai['headlines']) && ! empty($ai['about'])) {
            $headlines = array_slice($ai['headlines'], 0, 3);
            $about = $ai['about'];
            $source = 'ai';
        }

        $suggested = array_values(array_unique(array_merge($skills, Lexicon::roleSkills($title))));
        $currentAbout = (string) ($o['current_about'] ?? '');
        $currentHeadline = (string) ($o['current_headline'] ?? '');

        [$score, $tips] = $this->audit($currentHeadline, $currentAbout, $skills, $title, $resume);

        return [
            'headline_options' => $headlines,
            'about' => $about,
            'suggested_skills' => array_slice($suggested, 0, 20),
            'tips' => $tips,
            'score' => $score,
            'audited_current_profile' => $currentHeadline !== '' || $currentAbout !== '',
            'source' => $source,
        ];
    }

    private function about(array $b, string $title, array $skills, array $wins, ?int $years): string
    {
        $p = [];
        $p[] = $years
            ? "I'm a {$title} with {$years}+ years of experience helping teams ship work that matters."
            : "I'm a {$title} who loves solving real problems and shipping work that matters.";
        if (! empty($b['summary'])) {
            $p[] = trim($b['summary']);
        }
        if ($wins) {
            $p[] = "Highlights:\n".implode("\n", array_map(fn ($w) => '▸ '.rtrim($w, '.'), array_slice($wins, 0, 3)));
        }
        if ($skills) {
            $p[] = 'Core strengths: '.implode(' • ', array_slice($skills, 0, 8)).'.';
        }
        $p[] = "I'm always open to meaningful conversations about new opportunities and collaborations — feel free to message me or reach out at ".($b['email'] ?: 'my email on this profile').'.';

        return implode("\n\n", $p);
    }

    private function audit(string $headline, string $about, array $skills, string $title, array $resume): array
    {
        $tips = [];
        $score = 0;
        $add = function (bool $ok, int $pts, string $label, string $tip) use (&$tips, &$score) {
            $score += $ok ? $pts : 0;
            $tips[] = ['done' => $ok, 'label' => $label, 'tip' => $tip, 'points' => $pts];
        };

        $audit = $headline !== '' || $about !== '';
        $hl = mb_strlen($headline);
        $ab = mb_strlen($about);
        $add($audit ? $hl >= 60 : true, 15, 'Keyword-rich headline', 'Use 60–220 characters: role, specialisation and value instead of just your job title.');
        $add($audit ? $ab >= 800 : true, 15, 'Detailed About section', 'Aim for 800–2,000 characters with a hook, proof points and a call to action.');
        $add($audit ? (bool) preg_match('/contact|reach|message|connect|email|open to/i', $about) : true, 10, 'Call to action in About', 'End with how people can work with or contact you.');
        $add(count($skills) >= 8, 15, '8+ skills listed', 'Add at least 8 relevant skills and pin your top 3.');
        $add(! empty($resume['experience']), 10, 'Detailed experience', 'Add achievements with numbers to every role.');
        $add(! empty($resume['education']), 5, 'Education added', 'Include education and relevant certifications.');
        $add(false, 10, 'Professional photo & banner', 'Profiles with a clear photo get far more views. Add a banner that reflects your brand.');
        $add(false, 10, 'Custom URL & Featured section', 'Claim linkedin.com/in/your-name and feature your best work.');
        $add(false, 10, 'Recommendations', 'Request 2–3 recommendations from managers or colleagues.');

        return [min(100, $score), $tips];
    }
}
