<?php

namespace App\Services;

/**
 * Best-effort conversion of resume plain text into the app's structured format.
 */
class ResumeImporter
{
    private const MONTH = '(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?';

    private const TITLE_WORDS = [
        'engineer', 'developer', 'designer', 'manager', 'architect', 'lead', 'specialist',
        'analyst', 'consultant', 'administrator', 'officer', 'executive', 'programmer',
        'director', 'intern', 'technician', 'scientist', 'coordinator', 'assistant', 'head',
        'founder', 'president', 'vp', 'associate', 'software', 'frontend', 'backend', 'fullstack',
        'full stack', 'devops', 'qa', 'tester', 'ui', 'ux', 'product', 'project'
    ];

    public function import(string $text, ?string $filename = null, $user = null): array
    {
        $text = preg_replace('/((?:19|20)\d{2})([A-Z][a-z]{2}\s*(?:19|20)\d{2})/', '$1 – $2', $text);
        $text = preg_replace('/((?:19|20)\d{2})(Present|Current|Now)/i', '$1 – $2', $text);
        $sections = SectionParser::parse($text);
        $data = ResumeText::blank();

        $this->basics($data, $sections['header'] ?? [], $text, $filename, $user);

        $summary = trim(implode(' ', array_map([SectionParser::class, 'stripBullet'], $sections['summary'] ?? [])));
        if ($summary === '') {
            foreach ($sections['header'] ?? [] as $line) {
                $clean = SectionParser::stripBullet($line);
                if (mb_strlen($clean) > 80 && !preg_match('/@|\d{7,}|https?:/i', $clean)) {
                    $summary = trim($summary . ' ' . $clean);
                }
            }
        }
        $data['basics']['summary'] = $summary;

        $data['experience'] = $this->experience($sections['experience'] ?? []);
        $data['education'] = $this->education($sections['education'] ?? []);
        $data['skills'] = $this->skills($sections['skills'] ?? []);
        $data['projects'] = $this->projects($sections['projects'] ?? []);

        // If experience was empty but projects has work experiences
        if (empty($data['experience']) && !empty($data['projects'])) {
            $converted = [];
            foreach ($data['projects'] as $p) {
                $pName = $p['name'];
                $pDesc = $p['description'];
                $isJob = (bool) preg_match('/\b(engineer|developer|designer|manager|architect|lead|specialist|php|software)\b/i', $pName . ' ' . $pDesc);
                if ($isJob) {
                    $converted[] = [
                        'id' => uniqid('e'),
                        'role' => $pName ?: 'Software Engineer',
                        'company' => '',
                        'location' => '',
                        'start' => '',
                        'end' => '',
                        'current' => false,
                        'bullets' => $pDesc ? [$pDesc] : []
                    ];
                }
            }
            if ($converted) {
                $data['experience'] = $converted;
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

    private function basics(array &$data, array $header, string $fullText, ?string $filename = null, $user = null): void
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
            $cleaned = trim(preg_replace([
                '/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i',
                '/(\+?\d[\d\s().-]{7,}\d)/',
                '/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/[^\s|,]+/i',
                '/(?:https?:\/\/)?(?:www\.)?[a-z0-9-]+\.(?:com|io|dev|me|net|org)\/?[^\s|,]*/i',
                '/[|•·,–-]+/',
            ], ' ', $line));
            $cleaned = trim(preg_replace('/\s+/', ' ', $cleaned));

            if ($cleaned === '' || preg_match('/\d{4}|https?:|www\./i', $cleaned) || str_word_count($cleaned) > 5) {
                continue;
            }
            if ($b['name'] === '') {
                $b['name'] = $cleaned;
            } elseif ($b['title'] === '') {
                $b['title'] = $cleaned;
                break;
            }
        }

        // Smart check: Did a job title get mistakenly assigned as the person's name?
        $nameIsTitle = false;
        if ($b['name'] !== '') {
            $nameLower = mb_strtolower($b['name']);
            foreach (self::TITLE_WORDS as $tw) {
                if (preg_match('/\b' . preg_quote($tw, '/') . '\b/i', $nameLower)) {
                    $nameIsTitle = true;
                    break;
                }
            }
        }

        // Extract potential name and role from filename (e.g. "Vasanthan RK - Senior Software Engineer Resume")
        $fileCandidateName = '';
        $fileCandidateRole = '';
        if ($filename) {
            $baseName = trim(preg_replace('/\.(pdf|docx|txt)$/i', '', $filename));
            $cleanBase = trim(preg_replace('/[_\s]+/', ' ', $baseName));
            if (preg_match('/^([A-Za-z\s.]+?)\s*[-–—|]\s*(.+?)(?:\s+(?:resume|cv))?$/i', $cleanBase, $fm)) {
                $fileCandidateName = trim($fm[1]);
                $fileCandidateRole = trim(preg_replace('/\b(resume|cv)\b/i', '', $fm[2]));
            } elseif (preg_match('/^([A-Za-z\s.]+?)(?:\s+(?:resume|cv))$/i', $cleanBase, $fm)) {
                $fileCandidateName = trim($fm[1]);
            } elseif (preg_match('/^[A-Za-z\s.]{2,40}$/', $cleanBase) && !preg_match('/\b(resume|cv|document|myresume|profile|doc)\b/i', $cleanBase)) {
                $fileCandidateName = trim($cleanBase);
            }
        }

        if ($nameIsTitle) {
            $detectedTitle = $b['name'];
            if ($b['location'] === '' && $b['title'] !== '') {
                $b['location'] = $b['title'];
            }
            $b['title'] = $fileCandidateRole ?: $detectedTitle;

            if ($fileCandidateName !== '') {
                $b['name'] = $fileCandidateName;
            } elseif (!empty($b['email'])) {
                $emailPrefix = explode('@', $b['email'])[0];
                $nameParts = preg_split('/[._-]/', $emailPrefix);
                $b['name'] = ucwords(implode(' ', array_filter($nameParts, fn($p) => !is_numeric($p) && strlen($p) > 1)));
            } elseif ($user && !empty($user->name)) {
                $b['name'] = $user->name;
            }
        } elseif ($b['name'] === '') {
            if ($fileCandidateName !== '') {
                $b['name'] = $fileCandidateName;
                if ($b['title'] === '' && $fileCandidateRole !== '') {
                    $b['title'] = $fileCandidateRole;
                }
            } elseif (!empty($b['email'])) {
                $emailPrefix = explode('@', $b['email'])[0];
                $nameParts = preg_split('/[._-]/', $emailPrefix);
                $b['name'] = ucwords(implode(' ', array_filter($nameParts, fn($p) => !is_numeric($p) && strlen($p) > 1)));
            } elseif ($user && !empty($user->name)) {
                $b['name'] = $user->name;
            }
        }

        // Ensure title is not just a duplicate of location
        if ($b['title'] !== '' && !empty($b['location'])) {
            $locNorm = strtolower(preg_replace('/[^a-z]/', '', $b['location']));
            $titleNorm = strtolower(preg_replace('/[^a-z]/', '', $b['title']));
            if ($locNorm === $titleNorm || str_contains($locNorm, $titleNorm) || str_contains($titleNorm, $locNorm)) {
                $b['title'] = $fileCandidateRole ?: ($nameIsTitle ? $detectedTitle : 'Software Engineer');
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

    private function projects(array $lines): array
    {
        $projects = [];
        $cur = null;

        $isDateLine = function (string $str): bool {
            $str = trim($str);
            if (preg_match('/^(present|current|now)$/i', $str)) return true;
            if (preg_match('/^(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*(?:19|20)\d{2}$/i', $str)) return true;
            if (preg_match('/^(?:19|20)\d{2}\s*[-–—to]\s*(?:(?:19|20)\d{2}|present|current)$/i', $str)) return true;
            return false;
        };

        $isWorkExp = function (string $name): bool {
            return (bool) preg_match('/\b(senior software engineer|php developer|web developer|lead engineer|solutions pvt|technologies|technology|it solutions)\b/i', $name);
        };

        foreach ($lines as $raw) {
            $line = SectionParser::stripBullet($raw);
            if ($line === '' || $line === '-') {
                continue;
            }

            if ($isDateLine($line) || preg_match('/^(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{4})\b/i', $line)) {
                if ($cur && empty($cur['period'])) {
                    $cur['period'] = $line;
                }
                continue;
            }

            $dateAtEnd = null;
            if (preg_match('/\s+(Present|Current|Now|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*(?:19|20)\d{2})$/i', $line, $dm)) {
                $dateAtEnd = $dm[1];
                $line = trim(substr($line, 0, -strlen($dm[0])));
            }

            $isShort = mb_strlen($line) <= 65 && !str_ends_with($line, '.') && !str_ends_with($line, ',');
            $hasColon = str_contains($line, ':') && mb_strlen(explode(':', $line)[0]) <= 50;

            if ($hasColon) {
                if ($cur) {
                    $projects[] = $cur;
                    $cur = null;
                }
                [$name, $desc] = array_map('trim', explode(':', $line, 2));
                $projects[] = [
                    'id' => uniqid('p'),
                    'name' => $name,
                    'period' => $dateAtEnd ?: 'Present',
                    'link' => '',
                    'description' => $desc,
                ];
                continue;
            }

            if ($isShort && !$isWorkExp($line)) {
                if ($cur) {
                    $projects[] = $cur;
                }
                $cur = [
                    'id' => uniqid('p'),
                    'name' => $line,
                    'period' => $dateAtEnd ?: '',
                    'link' => '',
                    'description' => '',
                ];
            } else {
                if ($cur) {
                    $cur['description'] = $cur['description'] === '' ? $line : $cur['description'] . ' ' . $line;
                }
            }
        }

        if ($cur) {
            $projects[] = $cur;
        }

        foreach ($projects as &$p) {
            if (empty($p['period'])) {
                $p['period'] = 'Present';
            }
        }

        return $projects;
    }
}
