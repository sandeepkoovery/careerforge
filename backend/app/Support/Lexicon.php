<?php

namespace App\Support;

/**
 * Shared vocabularies used by the resume analysis engines.
 */
class Lexicon
{
    public const ACTION_VERBS = [
        'accelerated', 'accomplished', 'achieved', 'acquired', 'adapted', 'administered', 'advanced', 'advised',
        'analyzed', 'architected', 'assembled', 'audited', 'automated', 'boosted', 'built', 'championed',
        'collaborated', 'completed', 'conceived', 'conducted', 'configured', 'consolidated', 'constructed',
        'consulted', 'coordinated', 'created', 'cut', 'decreased', 'defined', 'delivered', 'deployed', 'designed',
        'developed', 'devised', 'directed', 'drove', 'earned', 'educated', 'eliminated', 'enabled', 'engineered',
        'enhanced', 'established', 'evaluated', 'executed', 'expanded', 'expedited', 'facilitated', 'forecasted',
        'formulated', 'founded', 'generated', 'guided', 'headed', 'identified', 'implemented', 'improved',
        'increased', 'influenced', 'initiated', 'innovated', 'installed', 'integrated', 'introduced', 'launched',
        'led', 'leveraged', 'managed', 'maximized', 'mentored', 'migrated', 'minimized', 'modernized', 'monitored',
        'negotiated', 'optimized', 'orchestrated', 'organized', 'oversaw', 'partnered', 'performed', 'pioneered',
        'planned', 'presented', 'prioritized', 'produced', 'programmed', 'promoted', 'proposed', 'provided',
        'published', 'raised', 'reduced', 'refactored', 'rebuilt', 'redesigned', 'released', 'resolved',
        'restructured', 'revamped', 'reviewed', 'scaled', 'secured', 'shipped', 'simplified', 'solved',
        'spearheaded', 'standardized', 'streamlined', 'strengthened', 'supervised', 'surpassed', 'taught',
        'tested', 'trained', 'transformed', 'translated', 'troubleshot', 'unified', 'upgraded', 'utilized',
        'validated', 'won', 'wrote',
    ];

    public const WEAK_PHRASES = [
        'responsible for', 'duties included', 'worked on', 'helped with', 'tasked with', 'assisted in',
        'in charge of', 'participated in', 'was involved in', 'hard worker', 'team player', 'go-getter',
        'results-driven', 'detail-oriented',
    ];

    /** Phrases that, when leading a bullet, can be swapped for a stronger verb. */
    public const WEAK_REWRITES = [
        'responsible for' => '',
        'duties included' => '',
        'in charge of' => 'Led',
        'worked on' => 'Developed',
        'helped with' => 'Supported',
        'helped to' => 'Helped',
        'tasked with' => '',
        'assisted in' => 'Supported',
        'assisted with' => 'Supported',
        'participated in' => 'Contributed to',
        'was involved in' => 'Contributed to',
    ];

    public const SKILLS = [
        // Programming & web
        'php', 'laravel', 'symfony', 'javascript', 'typescript', 'react', 'react native', 'next.js', 'vue', 'angular',
        'node.js', 'express', 'python', 'django', 'flask', 'fastapi', 'java', 'spring boot', 'kotlin', 'swift', 'c#',
        '.net', 'c++', 'go', 'rust', 'ruby', 'rails', 'html', 'css', 'sass', 'tailwind', 'bootstrap', 'graphql',
        'rest api', 'restful', 'api', 'microservices', 'jquery', 'webpack', 'vite',
        // Data & cloud
        'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'firebase', 'aws', 'azure', 'gcp',
        'docker', 'kubernetes', 'terraform', 'ci/cd', 'jenkins', 'github actions', 'linux', 'git', 'nginx',
        'devops', 'serverless', 'machine learning', 'deep learning', 'data analysis', 'data science', 'tensorflow',
        'pytorch', 'pandas', 'numpy', 'tableau', 'power bi', 'excel', 'etl', 'big data', 'spark', 'hadoop',
        'nlp', 'computer vision', 'statistics', 'a/b testing',
        // Process & quality
        'agile', 'scrum', 'kanban', 'jira', 'tdd', 'unit testing', 'qa', 'selenium', 'cypress', 'jest', 'phpunit',
        'code review', 'cybersecurity', 'oauth', 'jwt',
        // Design & product
        'figma', 'sketch', 'adobe xd', 'photoshop', 'illustrator', 'ui design', 'ux design', 'user research',
        'wireframing', 'prototyping', 'design systems', 'product management', 'roadmap', 'product strategy',
        'stakeholder management',
        // Marketing & sales
        'seo', 'sem', 'google analytics', 'content marketing', 'social media', 'email marketing', 'copywriting',
        'google ads', 'facebook ads', 'crm', 'salesforce', 'hubspot', 'lead generation', 'b2b', 'b2c',
        'account management', 'negotiation', 'cold calling', 'market research', 'branding',
        // Business & finance
        'budgeting', 'forecasting', 'financial analysis', 'financial modeling', 'accounting', 'quickbooks', 'sap',
        'erp', 'compliance', 'risk management', 'project management', 'pmp', 'operations', 'supply chain',
        'procurement', 'customer service', 'customer success', 'recruiting', 'talent acquisition', 'payroll',
        'onboarding', 'training', 'six sigma', 'lean',
        // Soft skills
        'leadership', 'communication', 'problem solving', 'teamwork', 'collaboration', 'mentoring',
        'critical thinking', 'time management', 'presentation', 'strategic planning', 'analytical',
    ];

    /** Skill suggestions keyed by role keywords. */
    public const ROLE_SKILLS = [
        'developer' => ['JavaScript', 'TypeScript', 'React', 'Node.js', 'PHP', 'Laravel', 'REST APIs', 'SQL', 'Git', 'Docker', 'CI/CD', 'Unit Testing', 'Agile'],
        'engineer' => ['System Design', 'Python', 'Java', 'SQL', 'AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Microservices', 'Git', 'Testing', 'Agile'],
        'designer' => ['Figma', 'UI Design', 'UX Research', 'Wireframing', 'Prototyping', 'Design Systems', 'Adobe Creative Suite', 'Accessibility', 'User Testing'],
        'data' => ['Python', 'SQL', 'Pandas', 'Machine Learning', 'Data Visualization', 'Tableau', 'Power BI', 'Statistics', 'A/B Testing', 'ETL'],
        'marketing' => ['SEO', 'Content Marketing', 'Google Analytics', 'Email Marketing', 'Social Media', 'Campaign Management', 'Copywriting', 'Marketing Automation', 'A/B Testing'],
        'product' => ['Product Strategy', 'Roadmapping', 'User Research', 'Agile', 'Stakeholder Management', 'Data Analysis', 'Jira', 'Go-to-Market', 'Prioritization'],
        'sales' => ['Lead Generation', 'CRM', 'Salesforce', 'Negotiation', 'Account Management', 'Pipeline Management', 'Cold Outreach', 'Forecasting', 'Closing'],
        'manager' => ['Leadership', 'Team Building', 'Strategic Planning', 'Budgeting', 'Stakeholder Management', 'Coaching', 'Performance Management', 'Project Management'],
        'accountant' => ['Financial Reporting', 'Budgeting', 'Forecasting', 'QuickBooks', 'Excel', 'Reconciliation', 'Auditing', 'Tax Compliance', 'GAAP'],
        'default' => ['Communication', 'Problem Solving', 'Project Management', 'Collaboration', 'Time Management', 'Leadership', 'Data Analysis', 'Microsoft Office'],
    ];

    public const STOPWORDS = [
        'a', 'about', 'above', 'after', 'again', 'all', 'also', 'am', 'an', 'and', 'any', 'are', 'as', 'at', 'be',
        'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'could', 'did', 'do',
        'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has', 'have', 'having',
        'he', 'her', 'here', 'hers', 'him', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'just', 'me',
        'more', 'most', 'my', 'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our',
        'ours', 'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than', 'that', 'the', 'their',
        'theirs', 'them', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under',
        'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why',
        'will', 'with', 'would', 'you', 'your', 'yours', 'job', 'role', 'position', 'company', 'team', 'work',
        'working', 'ability', 'strong', 'experience', 'years', 'year', 'required', 'requirements', 'preferred',
        'responsibilities', 'qualifications', 'candidate', 'looking', 'join', 'must', 'etc', 'including', 'well',
        'new', 'across', 'within', 'using', 'use', 'help', 'make', 'part', 'time', 'full', 'based', 'will',
        'plus', 'good', 'great', 'excellent', 'knowledge', 'understanding', 'skills', 'skill', 'proven', 'seeking',
        'opportunity', 'benefits', 'salary', 'apply', 'equal', 'employer', 'environment', 'like', 'love', 'want',
        'need', 'needs', 'ensure', 'support', 'related', 'relevant', 'various', 'multiple', 'high', 'level',
        'senior', 'junior', 'able', 'day', 'days', 'every', 'both', 'being', 'maintain', 'provide', 'perform',
    ];

    /** Case-insensitive, boundary-aware term lookup. Expects a lower-cased haystack. */
    public static function has(string $haystackLower, string $term): bool
    {
        return self::count($haystackLower, $term) > 0;
    }

    public static function count(string $haystackLower, string $term): int
    {
        $term = mb_strtolower($term);
        $quoted = preg_quote($term, '/');
        $plural = preg_match('/[a-z]$/', $term) ? '(?:s|es)?' : '';

        return (int) preg_match_all('/(?<![\p{L}\p{N}])'.$quoted.$plural.'(?![\p{L}\p{N}])/u', $haystackLower);
    }

    public static function stem(string $word): string
    {
        $w = mb_strtolower($word);
        $len = mb_strlen($w);
        if ($len > 5 && str_ends_with($w, 'ies')) {
            return mb_substr($w, 0, -3).'y';
        }
        foreach (['ing' => 6, 'ed' => 5, 'es' => 5, 's' => 4] as $suffix => $min) {
            if ($len > $min && str_ends_with($w, $suffix)) {
                return mb_substr($w, 0, -mb_strlen($suffix));
            }
        }

        return $w;
    }

    public static function roleSkills(?string $role): array
    {
        $role = mb_strtolower((string) $role);
        foreach (self::ROLE_SKILLS as $key => $skills) {
            if ($key !== 'default' && str_contains($role, $key)) {
                return $skills;
            }
        }

        return self::ROLE_SKILLS['default'];
    }
}
