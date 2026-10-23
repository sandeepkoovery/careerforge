<?php

namespace App\Services;

use App\Support\Lexicon;

/**
 * In-editor writing assistant: rewrites bullets, drafts summaries, proposes skills.
 */
class Suggester
{
    public function __construct(private Llm $llm) {}

    public function run(string $type, array $in): array
    {
        return match ($type) {
            'bullet' => $this->bullet((string) ($in['text'] ?? ''), (string) ($in['role'] ?? '')),
            'summary' => $this->summary($in),
            default => $this->skills($in),
        };
    }

    private function bullet(string $text, string $role): array
    {
        $text = trim(SectionParser::stripBullet($text));

        $ai = $this->llm->json(
            'You are a resume coach. Rewrite the bullet into 3 stronger variants: start with an action verb, show impact, keep under 28 words, and do not invent numbers — use [X] placeholders for metrics the user must fill. Return {"suggestions":[3 strings]}.',
            json_encode(['role' => $role, 'bullet' => $text])
        );
        if ($ai && ! empty($ai['suggestions'])) {
            return ['suggestions' => array_slice($ai['suggestions'], 0, 3), 'source' => 'ai'];
        }

        $lower = mb_strtolower($text);
        $base = $text;
        foreach (Lexicon::WEAK_REWRITES as $weak => $replacement) {
            if (str_starts_with($lower, $weak)) {
                $rest = trim(mb_substr($text, mb_strlen($weak)));
                $rest = preg_replace('/^(?:the|a|an)\s+/i', '', $rest);
                $base = $replacement !== '' ? trim($replacement.' '.$rest) : $this->verbify($rest);
                break;
            }
        }
        if ($base === $text) {
            $base = $this->verbify($text);
        }
        $base = rtrim(ucfirst($base), '.');

        return ['suggestions' => [
            $base.'.',
            $base.', resulting in a [X]% improvement in [key metric].',
            $base.' for [N] stakeholders, reducing [cost/time] by [X]%.',
        ], 'source' => 'smart-template'];
    }

    private function verbify(string $text): string
    {
        $first = strtok($text, ' ');
        $rest = trim(mb_substr($text, mb_strlen((string) $first)));
        $f = mb_strtolower((string) $first);
        if (str_ends_with($f, 'ing') && mb_strlen($f) > 5) {
            $stem = mb_substr($f, 0, -3);
            foreach (Lexicon::ACTION_VERBS as $v) {
                if (str_starts_with($v, $stem) || str_starts_with($v, mb_substr($stem, 0, -1))) {
                    return ucfirst($v).($rest ? ' '.$rest : '');
                }
            }
        }
        if (in_array($f, Lexicon::ACTION_VERBS, true)) {
            return $text;
        }

        return 'Delivered '.lcfirst($text);
    }

    private function summary(array $in): array
    {
        $role = trim((string) ($in['role'] ?? '')) ?: 'Professional';
        $skills = array_values(array_filter((array) ($in['skills'] ?? [])));
        $years = isset($in['years']) && $in['years'] ? (int) $in['years'] : null;

        $ai = $this->llm->json(
            'You write resume professional summaries. Return {"suggestions":[3 distinct 2-3 sentence summaries in implied first person, no clichés]}. Use only given facts.',
            json_encode(['role' => $role, 'years' => $years, 'skills' => array_slice($skills, 0, 10), 'experience' => array_slice($in['experience'] ?? [], 0, 2)])
        );
        if ($ai && ! empty($ai['suggestions'])) {
            return ['suggestions' => array_slice($ai['suggestions'], 0, 3), 'source' => 'ai'];
        }

        $yr = $years ? "{$years}+ years of experience" : 'a passion for impact';
        $s = implode(', ', array_slice($skills, 0, 4)) ?: 'collaboration and problem solving';

        return ['suggestions' => [
            "{$role} with {$yr} specialising in {$s}. Known for turning complex problems into clear, measurable results and collaborating across teams to ship on time.",
            "Results-focused {$role} bringing {$yr}. Strong in {$s}, with a track record of improving processes, mentoring peers and delivering work that moves key metrics.",
            "Versatile {$role} who combines hands-on expertise in {$s} with a strategic mindset. Seeking to drive growth and quality in a fast-moving team.",
        ], 'source' => 'smart-template'];
    }

    private function skills(array $in): array
    {
        $have = array_map('mb_strtolower', (array) ($in['skills'] ?? []));
        $list = array_values(array_filter(Lexicon::roleSkills($in['role'] ?? ''), fn ($s) => ! in_array(mb_strtolower($s), $have, true)));

        return ['suggestions' => array_slice($list, 0, 10), 'source' => 'smart-template'];
    }
}
