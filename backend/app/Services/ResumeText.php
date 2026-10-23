<?php

namespace App\Services;

/**
 * Converts structured resume JSON to plain text and back (best-effort import).
 */
class ResumeText
{
    public static function blank(string $name = ''): array
    {
        return [
            'basics' => ['name' => $name, 'title' => '', 'email' => '', 'phone' => '', 'location' => '', 'website' => '', 'linkedin' => '', 'summary' => ''],
            'experience' => [],
            'education' => [],
            'skills' => [],
            'projects' => [],
            'certifications' => [],
        ];
    }

    public static function fromData(array $d): string
    {
        $b = $d['basics'] ?? [];
        $out = [];
        $out[] = $b['name'] ?? '';
        if (! empty($b['title'])) {
            $out[] = $b['title'];
        }
        $out[] = implode(' | ', array_filter([$b['email'] ?? '', $b['phone'] ?? '', $b['location'] ?? '', $b['website'] ?? '', $b['linkedin'] ?? '']));

        if (! empty($b['summary'])) {
            $out[] = "\nPROFESSIONAL SUMMARY\n".$b['summary'];
        }
        if (! empty($d['experience'])) {
            $out[] = "\nWORK EXPERIENCE";
            foreach ($d['experience'] as $e) {
                $dates = trim(($e['start'] ?? '').' - '.(! empty($e['current']) ? 'Present' : ($e['end'] ?? '')), ' -');
                $out[] = trim(($e['role'] ?? '').', '.($e['company'] ?? ''), ', ').($dates ? " ($dates)" : '');
                foreach ($e['bullets'] ?? [] as $bl) {
                    if (trim($bl) !== '') {
                        $out[] = '• '.trim($bl);
                    }
                }
            }
        }
        if (! empty($d['projects'])) {
            $out[] = "\nPROJECTS";
            foreach ($d['projects'] as $p) {
                $out[] = trim(($p['name'] ?? '').': '.($p['description'] ?? ''), ': ');
            }
        }
        if (! empty($d['education'])) {
            $out[] = "\nEDUCATION";
            foreach ($d['education'] as $e) {
                $out[] = trim(($e['degree'] ?? '').' '.($e['field'] ?? '').', '.($e['school'] ?? '').' '.($e['end'] ?? ''), ' ,');
            }
        }
        if (! empty($d['skills'])) {
            $out[] = "\nSKILLS\n".implode(', ', $d['skills']);
        }
        if (! empty($d['certifications'])) {
            $out[] = "\nCERTIFICATIONS";
            foreach ($d['certifications'] as $c) {
                $out[] = trim(($c['name'] ?? '').' '.($c['issuer'] ?? '').' '.($c['year'] ?? ''));
            }
        }

        return trim(implode("\n", $out));
    }

    /** Return all experience bullets that contain a number, best first. */
    public static function achievements(array $d): array
    {
        $found = [];
        foreach ($d['experience'] ?? [] as $e) {
            foreach ($e['bullets'] ?? [] as $b) {
                if (preg_match('/\d/', $b)) {
                    $found[] = trim($b);
                }
            }
        }

        return $found;
    }

    public static function yearsOfExperience(array $d): ?int
    {
        $years = [];
        foreach ($d['experience'] ?? [] as $e) {
            if (preg_match('/(19|20)\d{2}/', (string) ($e['start'] ?? ''), $m)) {
                $years[] = (int) $m[0];
            }
        }

        return $years ? max(0, (int) date('Y') - min($years)) : null;
    }
}
