<?php

namespace App\Services;

/**
 * Best-effort conversion of resume plain text into the app's structured format.
 */
class ResumeImporter
{
    private const MONTH = '(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?';

    public function import(string $text): array
    {
        $sections = SectionParser::parse($text);
        $data = ResumeText::blank();

        $this->basics($data, $sections['header'] ?? [], $text);
        $data['basics']['summary'] = trim(implode(' ', array_map([SectionParser::class, 'stripBullet'], $sections['summary'] ?? [])));
        $data['experience'] = $this->experience($sections['experience'] ?? []);
        $data['education'] = $this->education($sections['education'] ?? []);
        $data['skills'] = $this->skills($sections['skills'] ?? []);

        foreach ($sections['projects'] ?? [] as $line) {
            $line = SectionParser::stripBullet($line);
            if (str_contains($line, ':') && mb_strlen($line) > 20) {
                [$n, $desc] = array_map('trim', explode(':', $line, 2));
                $data['projects'][] = ['id' => uniqid('p'), 'name' => $n, 'link' => '', 'description' => $desc];
            } elseif ($data['projects'] && mb_strlen($line) > 20) {
                $last = array_key_last($data['projects']);
                $data['projects'][$last]['description'] .= ' '.$line;
            } else {
                $data['projects'][] = ['id' => uniqid('p'), 'name' => $line, 'link' => '', 'description' => ''];
            }
        }
        foreach ($sections['certifications'] ?? [] as $line) {
            $line = SectionParser::stripBullet($line);
            if ($line !== '') {
                $year = preg_match('/(19|20)\d{2}/', $line, $m) ? $m[0] : '';
                $data['certifications'][] = ['id' => uniqid('c'), 'name' => trim(str_replace($year, '', $line), ' ,-–'), 'issuer' => '', 'year' => $year];
            }
        }

        return $data;
    }

    private function basics(array &$data, array $header, string $fullText): void
    {
        $b = &$data['basics'];
        $headText = implode("\n", $header) ?: mb_substr($fullText, 0, 500);

        if (preg_match('/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i', $headText, $m)) {
            $b['email'] = $m[0];
        }
        if (preg_match('/(\+?\d[\d\s().-]{7,}\d)/', $headText, $m)) {
            $b['phone'] = trim($m[1]);
        }
        if (preg_match('/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/[^\s|,]+/i', $headText, $m)) {
            $b['linkedin'] = $m[0];
        }
        $noContact = preg_replace(['/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i', '/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/[^\s|,]+/i'], '', $headText);
        if (preg_match('/(?:https?:\/\/)?(?:www\.)?[a-z0-9-]+\.(?:com|io|dev|me|net|org)\/?[^\s|,]*/i', $noContact, $m)) {
            $b['website'] = $m[0];
        }
        if (preg_match('/\b[A-Z][a-zA-Z .]+,\s*(?:[A-Z]{2}|[A-Z][a-zA-Z ]+)\b/', preg_replace('/[|•]/', "\n", $headText), $m)) {
            $b['location'] = trim($m[0]);
        }

        foreach ($header as $i => $line) {
            if (preg_match('/@|\d{4}|https?:|www\./i', $line) || str_word_count($line) > 5) {
                continue;
            }
            if ($b['name'] === '') {
                $b['name'] = $line;
            } elseif ($b['title'] === '') {
                $b['title'] = $line;
                break;
            }
        }
    }

    private function dateRange(string $line): ?array
    {
        $m = self::MONTH;
        $pattern = "/(?:$m\\s+)?(?:19|20)\\d{2}\\s*(?:-|–|—|to)\\s*(?:(?:$m\\s+)?(?:19|20)\\d{2}|present|current|now)/i";
        if (! preg_match($pattern, $line, $r)) {
            return null;
        }
        $parts = preg_split('/\s*(?:-|–|—|\bto\b)\s*/i', $r[0], 2);
        $end = trim($parts[1] ?? '');

        return [
            'raw' => $r[0],
            'start' => trim($parts[0]),
            'end' => preg_match('/present|current|now/i', $end) ? '' : $end,
            'current' => (bool) preg_match('/present|current|now/i', $end),
        ];
    }

    private function splitHeading(string $h): array
    {
        $h = trim($h, " |,-–—•·()");
        foreach ([' at ', ' | ', ' — ', ' – ', ' - ', ', ', ' @ '] as $sep) {
            if (str_contains($h, $sep)) {
                [$role, $company] = array_map('trim', explode($sep, $h, 2));

                return [$role, $company];
            }
        }

        return [$h, ''];
    }

    private function experience(array $lines): array
    {
        $entries = [];
        $pending = [];
        $cur = null;

        $flush = function () use (&$entries, &$cur) {
            if ($cur) {
                $entries[] = $cur;
                $cur = null;
            }
        };

        foreach ($lines as $raw) {
            $isBullet = SectionParser::bullet($raw);
            $line = SectionParser::stripBullet($raw);
            if ($line === '') {
                continue;
            }
            $dates = $this->dateRange($line);
            if ($dates) {
                $flush();
                $remainder = trim(str_replace($dates['raw'], '', $line), " |,-–—•·()");
                $heads = $remainder !== '' ? [$remainder] : $pending;
                $pending = [];
                $role = $company = '';
                if (count($heads) >= 2) {
                    [$role, $company] = [$heads[count($heads) - 2], $heads[count($heads) - 1]];
                } elseif (count($heads) === 1) {
                    [$role, $company] = $this->splitHeading($heads[0]);
                }
                $cur = [
                    'id' => uniqid('e'), 'role' => $role, 'company' => $company, 'location' => '',
                    'start' => $dates['start'], 'end' => $dates['end'], 'current' => $dates['current'], 'bullets' => [],
                ];

                continue;
            }
            if ($isBullet || mb_strlen($line) > 60) {
                if ($cur) {
                    $cur['bullets'][] = $line;
                }

                continue;
            }
            if ($cur && $cur['company'] === '' && ! $cur['bullets']) {
                $cur['company'] = $line;

                continue;
            }
            $pending[] = $line;
            $pending = array_slice($pending, -2);
        }
        $flush();

        return $entries;
    }

    private function education(array $lines): array
    {
        $entries = [];
        $cur = null;
        foreach ($lines as $raw) {
            $line = SectionParser::stripBullet($raw);
            $isSchool = (bool) preg_match('/university|college|institute|school|academy|polytechnic/i', $line);
            $isDegree = (bool) preg_match('/bachelor|master|b\.?\s?sc|m\.?\s?sc|b\.?\s?tech|m\.?\s?tech|\bmba\b|ph\.?d|diploma|associate|\bb\.?e\b|\bb\.?a\b|\bm\.?a\b|certificate/i', $line);
            $year = preg_match_all('/(?:19|20)\d{2}/', $line, $ym) ? $ym[0] : [];

            if ($isSchool && ($cur === null || $cur['school'] !== '')) {
                if ($cur) {
                    $entries[] = $cur;
                }
                $cur = ['id' => uniqid('d'), 'school' => '', 'degree' => '', 'field' => '', 'start' => '', 'end' => '', 'details' => ''];
            }
            if ($cur === null) {
                $cur = ['id' => uniqid('d'), 'school' => '', 'degree' => '', 'field' => '', 'start' => '', 'end' => '', 'details' => ''];
            }
            $clean = trim(preg_replace('/(?:19|20)\d{2}|\bpresent\b|[-–—]\s*$/i', '', $line), " |,-–—()");
            if ($isSchool && $isDegree && $cur['school'] === '' && $cur['degree'] === '' && str_contains($clean, ',')) {
                foreach (array_map('trim', explode(',', $clean)) as $part) {
                    if (preg_match('/university|college|institute|school|academy|polytechnic/i', $part)) {
                        $cur['school'] = $part;
                    } else {
                        $cur['degree'] = trim($cur['degree'].' '.$part);
                    }
                }
            } elseif ($isSchool && $cur['school'] === '') {
                $cur['school'] = $clean;
            } elseif ($isDegree && $cur['degree'] === '') {
                $cur['degree'] = $clean;
            } elseif ($clean !== '' && $cur['details'] === '' && ! $year) {
                $cur['details'] = $clean;
            }
            if ($year) {
                $cur['end'] = end($year);
                $cur['start'] = count($year) > 1 ? $year[0] : '';
            }
        }
        if ($cur) {
            $entries[] = $cur;
        }

        return $entries;
    }

    private function skills(array $lines): array
    {
        $skills = [];
        foreach ($lines as $line) {
            $line = SectionParser::stripBullet($line);
            $line = preg_replace('/^[A-Za-z &\/]{2,30}:\s*/', '', $line);
            foreach (preg_split('/[,|•·;]|\s{2,}/u', $line) as $s) {
                $s = trim($s, " \t-–");
                if (mb_strlen($s) >= 2 && mb_strlen($s) <= 40) {
                    $skills[mb_strtolower($s)] = $s;
                }
            }
        }

        return array_slice(array_values($skills), 0, 40);
    }
}
