<?php

namespace App\Services;

use App\Support\Lexicon;

/**
 * Splits plain resume text into named sections (header, summary, experience...).
 */
class SectionParser
{
    private const KEYWORDS = [
        'summary' => 'summary', 'profile' => 'summary', 'objective' => 'summary', 'about' => 'summary',
        'experience' => 'experience', 'employment' => 'experience', 'history' => 'experience',
        'education' => 'education', 'academic' => 'education', 'qualifications' => 'education',
        'skills' => 'skills', 'competencies' => 'skills', 'expertise' => 'skills', 'technologies' => 'skills',
        'projects' => 'projects',
        'certifications' => 'certifications', 'certificates' => 'certifications', 'licenses' => 'certifications',
        'achievements' => 'certifications', 'awards' => 'certifications',
        'languages' => 'languages', 'interests' => 'other', 'references' => 'other', 'hobbies' => 'other',
    ];

    public static function bullet(string $line): bool
    {
        return (bool) preg_match('/^\s*[\-\*•▪●◦‣·–■►]\s*/u', $line);
    }

    public static function stripBullet(string $line): string
    {
        return trim(preg_replace('/^\s*[\-\*•▪●◦‣·–■►]\s*/u', '', $line));
    }

    public static function headingOf(string $line): ?string
    {
        $raw = trim($line);
        if ($raw === '' || self::bullet($raw) || mb_strlen($raw) > 40 || preg_match('/\d|@/', $raw)) {
            return null;
        }
        $clean = trim(preg_replace('/[^\p{L}& ]+/u', ' ', $raw));
        $words = preg_split('/\s+/', mb_strtolower($clean), -1, PREG_SPLIT_NO_EMPTY);
        if (! $words || count($words) > 4) {
            return null;
        }
        if (in_array($words[0], Lexicon::ACTION_VERBS, true)) {
            return null;
        }
        if (! preg_match('/^\p{Lu}/u', $raw)) {
            return null;
        }
        foreach ($words as $w) {
            if (isset(self::KEYWORDS[$w])) {
                return self::KEYWORDS[$w];
            }
        }

        return null;
    }

    /** @return array<string, string[]> */
    public static function parse(string $text): array
    {
        $sections = ['header' => []];
        $current = 'header';
        foreach (preg_split('/\r?\n/', $text) as $line) {
            $line = rtrim($line);
            if (trim($line) === '') {
                continue;
            }
            $heading = self::headingOf($line);
            if ($heading) {
                $current = $heading;
                $sections[$current] ??= [];

                continue;
            }
            $sections[$current][] = trim($line);
        }

        return $sections;
    }
}
