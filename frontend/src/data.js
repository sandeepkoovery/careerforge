export const TEMPLATES = [
  // 3 FREE TEMPLATES
  { id: 'modern', name: 'Aurora', pro: false, tag: 'Sidebar · Bold', desc: 'Two-column layout with a colour sidebar. Clean, versatile all-rounder.' },
  { id: 'classic', name: 'Heritage', pro: false, tag: 'Serif · Traditional', desc: 'Timeless serif layout loved by finance, legal, and academic recruiters.' },
  { id: 'minimal', name: 'Whisper', pro: false, tag: 'Clean · Airy', desc: 'Generous white space, fine dividing lines, and pure ATS-safe structure.' },

  // 29 PRO TEMPLATES (32 TOTAL)
  { id: 'executive', name: 'Summit', pro: true, tag: 'Banner · Senior', desc: 'Authoritative dark banner header designed for leadership and senior roles.' },
  { id: 'creative', name: 'Prism', pro: true, tag: 'Colour · Creative', desc: 'Vibrant modern header and pill chips for designers, marketers, and product managers.' },
  { id: 'tech', name: 'Syntax', pro: true, tag: 'Compact · Tech', desc: 'Dense, scannable terminal timeline layout engineered for software engineers.' },
  { id: 'metro', name: 'Gridline', pro: true, tag: 'Swiss · Modernist', desc: 'Structured architectural grid, high-impact uppercase tracking, and numbered sections.' },
  { id: 'compact', name: 'OnePager', pro: true, tag: 'Dense · 1-Page Pro', desc: 'Balanced 2-column density engineered to pack maximum achievements on a single page.' },
  { id: 'academic', name: 'Scholar', pro: true, tag: 'Formal · Research', desc: 'Classical CV with double-rule section breaks and publication/project prominence.' },
  { id: 'elegant', name: 'Vogue', pro: true, tag: 'Editorial · Luxury', desc: 'Refined serif typography, delicate hairline dividers, and sophisticated high-end aesthetic.' },
  { id: 'infographic', name: 'Beacon', pro: true, tag: 'Visual · Metrics', desc: 'Dynamic skill badges, left timeline connectors, and prominent metric highlight callouts.' },
  { id: 'corporate', name: 'Apex', pro: true, tag: 'Navy · Corporate', desc: 'Corporate frame layout with deep navy header accents and structured tabular experience.' },
  { id: 'nordic', name: 'Nordic', pro: true, tag: 'Airy · Minimalist', desc: 'Scandinavian minimalism featuring soft typography, generous whitespace, and muted accents.' },
  { id: 'silicon', name: 'Silicon', pro: true, tag: 'Modern · Tech', desc: 'Fast-paced tech startup format with badge pills, monospace tags, and streamlined sections.' },
  { id: 'cascade', name: 'Cascade', pro: true, tag: 'Dual · Asymmetric', desc: 'Waterfall 2-column flow pairing a dense left timeline with an expansive right details pane.' },
  { id: 'zenith', name: 'Zenith', pro: true, tag: 'Boxed · Modern Cards', desc: 'Crisp card containers with subtle borders separating career history from core credentials.' },
  { id: 'nova', name: 'Nova', pro: true, tag: 'Accent · Rail Border', desc: 'Distinctive solid accent rail down the left border anchoring dates and achievements.' },
  { id: 'matrix', name: 'Matrix', pro: true, tag: 'Data · Grid Focus', desc: 'Engineered for data science and analytics with dedicated matrix skill tables and KPI highlights.' },
  { id: 'horizon', name: 'Horizon', pro: true, tag: 'Panoramic · Header', desc: 'Wide horizontal header band and distinct category dividers for polished executive presentation.' },
  { id: 'prestige', name: 'Prestige', pro: true, tag: 'Gold · C-Suite', desc: 'Opulent serif headers with warm accent rules tailored for VP, Director, and C-suite candidates.' },
  { id: 'artisan', name: 'Artisan', pro: true, tag: 'Showcase · Visual', desc: 'Boutique design format with project spotlight blocks, creative typography, and portfolio emphasis.' },
  { id: 'catalyst', name: 'Catalyst', pro: true, tag: 'Impact · Results', desc: 'Achievement-focused structure engineered with bullet callout tags and quantified metric displays.' },
  { id: 'vanguard', name: 'Vanguard', pro: true, tag: 'Dynamic · Angled', desc: 'Bold asymmetric layout with dynamic angular accents and energetic section transitions.' },
  { id: 'prime', name: 'Prime', pro: true, tag: 'Classic · Corporate', desc: 'Standard business recruiter layout with left quick-facts sidebar and right comprehensive history.' },
  { id: 'frontier', name: 'Frontier', pro: true, tag: 'Engineering · Tech', desc: 'Schematic structure with technical blueprint borders and rigorous specification formatting.' },
  { id: 'odyssey', name: 'Odyssey', pro: true, tag: 'Milestone · Story', desc: 'Narrative career journey with prominent milestone date badges and evolution timeline.' },
  { id: 'sovereign', name: 'Sovereign', pro: true, tag: 'Royal · Monogram', desc: 'Distinguished formal banner with geometric monogram insignia and balanced serif body.' },
  { id: 'monarch', name: 'Monarch', pro: true, tag: 'Framed · Editorial', desc: 'Double-line framed canvas with high-fashion editorial typography and centered header.' },
  { id: 'alpine', name: 'Alpine', pro: true, tag: 'Crisp · Modular', desc: 'Modular grid compartments with clean border separators and compact tag chips.' },
  { id: 'titan', name: 'Titan', pro: true, tag: 'Heavyweight · C-Level', desc: 'High-contrast heavyweight headers with commanding presence for enterprise leaders.' },
  { id: 'element', name: 'Element', pro: true, tag: 'Contemporary · Soft', desc: 'Modern material styling with soft tinted subpanels and clean rounded metadata tags.' },
  { id: 'atlas', name: 'Atlas', pro: true, tag: 'Global · International', desc: 'International standard CV format with multi-regional project focus and global mobility markers.' },
  { id: 'orbit', name: 'Orbit', pro: true, tag: 'Fluid · Rounded', desc: 'Rounded pill badges, subtle ring initials, and modern fluid spacing for digital innovators.' },
  { id: 'pinnacle', name: 'Pinnacle', pro: true, tag: 'Elevated · Clean', desc: 'Clean elevated header with dual accent line and scannable bullet hierarchies.' },
  { id: 'quantum', name: 'Quantum', pro: true, tag: 'Futuristic · Dense', desc: 'High-density futuristic tech layout with bracketed section headers and code-inspired syntax.' },
]

export const ACCENTS = ['#6366f1', '#2563eb', '#0891b2', '#059669', '#d97706', '#e11d48', '#db2777', '#334155']

export const FONTS = {
  inter: { label: 'Inter', css: "'Inter', sans-serif" },
  outfit: { label: 'Outfit', css: "'Outfit', sans-serif" },
  merriweather: { label: 'Merriweather', css: "'Merriweather', serif" },
  lora: { label: 'Lora', css: "'Lora', serif" },
}

export const TEXT_COLORS = [
  { id: 'dark', label: 'Black / Dark Slate', value: '#0f172a', bg: '#ffffff', name: '⚫ Black Font' },
  { id: 'light', label: 'White / Dark Mode Canvas', value: '#ffffff', bg: '#0f172a', name: '⚪ White Font' },
]

export const uid = (p = 'x') => p + Math.random().toString(36).slice(2, 9)

/** 12 Rich Industry Professions with Real Data & Metrics */
export const PROFESSIONS = [
  {
    id: 'developer',
    label: 'Software Developer (Full Stack)',
    icon: '💻',
    category: 'Engineering & Technology',
    data: {
      basics: {
        name: 'Arjun Mehta',
        title: 'Senior Full Stack Software Engineer',
        email: 'arjun.mehta@devmail.com',
        phone: '+91 98234 56789',
        location: 'Bengaluru, India',
        website: 'arjunmehta.tech',
        linkedin: 'linkedin.com/in/arjunmehta-dev',
        summary:
          'Full stack engineer with 7+ years building enterprise microservices and reactive web applications using React, Node.js, and Laravel. Scaled platforms serving 4M+ active users with 99.99% uptime.',
      },
      experience: [
        {
          id: 'dev1',
          role: 'Lead Full Stack Engineer',
          company: 'CloudScale Technologies',
          location: 'Bengaluru',
          start: 'Feb 2022',
          end: 'Present',
          current: true,
          bullets: [
            'Architected distributed microservices handling 12,000 requests/sec, reducing API p95 latency by 42%',
            'Spearheaded migration of monolith backend to modular services, saving $68,000 in annual AWS infrastructure costs',
            'Mentored 8 mid-level engineers and established TypeScript testing standards, raising code test coverage from 54% to 88%',
          ],
        },
        {
          id: 'dev2',
          role: 'Senior Software Developer',
          company: 'Nexus Digital Labs',
          location: 'Pune',
          start: 'Aug 2018',
          end: 'Jan 2022',
          current: false,
          bullets: [
            'Engineered real-time collaboration canvas in React & WebSockets utilized by 250,000 monthly active users',
            'Optimized relational database queries and indexed Redis caching layer, decreasing checkout load time by 60%',
          ],
        },
      ],
      education: [
        { id: 'edu1', school: 'National Institute of Technology (NIT)', degree: 'B.Tech', field: 'Computer Science & Engineering', start: '2014', end: '2018', details: 'Graduated Magna Cum Laude, GPA 8.9/10' },
      ],
      skills: ['React', 'Node.js', 'Laravel', 'TypeScript', 'Docker', 'Kubernetes', 'AWS', 'PostgreSQL', 'Redis', 'GraphQL', 'CI/CD Pipelines', 'System Design'],
      projects: [
        { id: 'p1', name: 'DevFlow Automator', link: 'github.com/arjun/devflow', description: 'Open-source GitHub Action runner with 2.8k GitHub stars and 50k weekly downloads.' },
        { id: 'p2', name: 'KubeWatch CLI', link: 'github.com/arjun/kubewatch', description: 'Real-time Kubernetes cluster monitoring tool with lightweight interactive terminal UI.' },
      ],
      certifications: [
        { id: 'c1', name: 'AWS Certified Solutions Architect – Professional', issuer: 'Amazon Web Services', year: '2023' },
        { id: 'c2', name: 'Certified Kubernetes Application Developer (CKAD)', issuer: 'Linux Foundation', year: '2022' },
      ],
    },
  },
  {
    id: 'designer',
    label: 'UI/UX & Product Designer',
    icon: '🎨',
    category: 'Design & Creative',
    data: {
      basics: {
        name: 'Sneha Patel',
        title: 'Senior Product & UX Designer',
        email: 'sneha.design@portfolio.io',
        phone: '+91 97112 34567',
        location: 'Mumbai, India',
        website: 'snehapatel.design',
        linkedin: 'linkedin.com/in/snehapatel-design',
        summary:
          'User-centric product designer with 6+ years designing SaaS, FinTech, and mobile products. Led end-to-end design systems that increased user conversion by 34% and reduced customer support tickets by 28%.',
      },
      experience: [
        {
          id: 'des1',
          role: 'Lead Product Designer',
          company: 'FinVibe Technologies',
          location: 'Mumbai',
          start: 'Jan 2022',
          end: 'Present',
          current: true,
          bullets: [
            'Redesigned the multi-step merchant onboarding journey, increasing completion rate by 34% across 80,000 applications',
            'Built and maintained unified design system comprising 220+ Figma components adopted across 4 product verticals',
            'Facilitated 40+ user interviews and usability testing sessions to validate core workflows prior to engineering sprint delivery',
          ],
        },
        {
          id: 'des2',
          role: 'UX/UI Designer',
          company: 'Studio PixelCraft',
          location: 'Bengaluru',
          start: 'Jul 2019',
          end: 'Dec 2021',
          current: false,
          bullets: [
            'Delivered complete mobile banking UI for iOS and Android with 4.8-star App Store rating over 1.2M downloads',
            'Collaborated closely with frontend developers to ensure design token fidelity and WCAG 2.1 AA accessibility compliance',
          ],
        },
      ],
      education: [
        { id: 'edu2', school: 'National Institute of Design (NID)', degree: 'B.Des', field: 'Interaction & Visual Communication Design', start: '2015', end: '2019', details: 'Merit scholar in Human-Computer Interaction' },
      ],
      skills: ['Figma', 'Design Systems', 'User Research', 'Wireframing', 'Interactive Prototyping', 'Usability Testing', 'Information Architecture', 'WCAG Accessibility', 'Design Tokens', 'Micro-interactions'],
      projects: [
        { id: 'p3', name: 'OpenDesign UI Kit', link: 'figma.com/@sneha/opendesign', description: 'Comprehensive accessible design kit downloaded by over 45,000 designers globally.' },
        { id: 'p4', name: 'HealthPulse Patient App', link: 'snehapatel.design/healthpulse', description: 'End-to-end telemedicine app design recognized at the 2023 India Design Forum.' },
      ],
      certifications: [
        { id: 'c3', name: 'Nielsen Norman Group UX Master Certified', issuer: 'NN/g', year: '2023' },
        { id: 'c4', name: 'Google Professional UX Design Certificate', issuer: 'Coursera / Google', year: '2020' },
      ],
    },
  },
  {
    id: 'civil',
    label: 'Civil & Structural Engineer',
    icon: '🏗️',
    category: 'Engineering & Construction',
    data: {
      basics: {
        name: 'Rohan Deshmukh',
        title: 'Senior Civil & Structural Engineer',
        email: 'rohan.deshmukh@infraeng.com',
        phone: '+91 99887 65432',
        location: 'Hyderabad, India',
        website: 'rohandeshmukh.in',
        linkedin: 'linkedin.com/in/rohandeshmukh-civil',
        summary:
          'Licensed Civil Engineer with 8+ years specializing in reinforced concrete structures, high-rise commercial foundations, and infrastructure project management. Delivered 14 major projects within budget and on schedule.',
      },
      experience: [
        {
          id: 'civ1',
          role: 'Lead Structural Engineer',
          company: 'Apex Infrastructure & Constructions',
          location: 'Hyderabad',
          start: 'Mar 2021',
          end: 'Present',
          current: true,
          bullets: [
            'Directed structural design and seismic load analysis for a 28-story commercial tower valued at $45M (₹370 Cr)',
            'Optimized steel reinforcement bar schedules with BIM & ETABS, reducing structural material costs by 12.5%',
            'Managed a multidisciplinary site team of 35 engineers and contractors, logging zero major safety incidents over 450,000 man-hours',
          ],
        },
        {
          id: 'civ2',
          role: 'Project Civil Engineer',
          company: 'Metro InfraCon Pvt Ltd',
          location: 'Pune',
          start: 'Aug 2017',
          end: 'Feb 2021',
          current: false,
          bullets: [
            'Supervised construction of 4.2 km elevated metro flyover with prestressed concrete girders according to IRC standards',
            'Conducted daily quality control testing for concrete compressive strength, soil compaction, and slump tolerances',
          ],
        },
      ],
      education: [
        { id: 'edu3', school: 'IIT Roorkee', degree: 'M.Tech', field: 'Structural Engineering', start: '2015', end: '2017', details: 'Thesis on Earthquake-Resistant High-Rise Concrete Shear Walls' },
        { id: 'edu4', school: 'Osmania University College of Engineering', degree: 'B.E.', field: 'Civil Engineering', start: '2011', end: '2015', details: 'First Class with Distinction' },
      ],
      skills: ['AutoCAD', 'ETABS', 'STAAD.Pro', 'Revit BIM', 'Structural Concrete Design', 'Seismic Analysis', 'Project Estimation', 'Site Supervision', 'Soil Mechanics', 'Cost Control', 'IS / IRC Codes', 'Primavera P6'],
      projects: [
        { id: 'p5', name: 'CyberTower High-Rise', link: 'rohandeshmukh.in/cybertower', description: '28-story mixed-use commercial center featuring deep pile foundations and tuned mass damping.' },
        { id: 'p6', name: 'Godavari River Cable-Stayed Bridge', link: 'rohandeshmukh.in/bridge', description: 'Assisted primary engineering analysis for 650m cable-stayed river crossing.' },
      ],
      certifications: [
        { id: 'c5', name: 'Chartered Engineer (India) — Civil Division', issuer: 'Institution of Engineers (IEI)', year: '2021' },
        { id: 'c6', name: 'Autodesk Certified Professional: Revit Structure', issuer: 'Autodesk', year: '2019' },
      ],
    },
  },
  {
    id: 'data_scientist',
    label: 'Data Scientist & AI Specialist',
    icon: '📊',
    category: 'Data & Analytics',
    data: {
      basics: {
        name: 'Dr. Kavita Nair',
        title: 'Lead Data Scientist & Machine Learning Specialist',
        email: 'kavita.nair@ailabs.org',
        phone: '+91 91234 87654',
        location: 'Bengaluru, India',
        website: 'kavitanair.ml',
        linkedin: 'linkedin.com/in/kavitanair-ml',
        summary:
          'Data scientist with 6+ years transforming massive enterprise datasets into predictive algorithms and generative AI models. Deployed churn and recommendation models generating $3.2M incremental revenue.',
      },
      experience: [
        {
          id: 'ds1',
          role: 'Principal Machine Learning Scientist',
          company: 'Predictive Insights Corp',
          location: 'Bengaluru',
          start: 'Jan 2022',
          end: 'Present',
          current: true,
          bullets: [
            'Built deep learning recommendation engine processing 30M events/day, driving a 21% uplift in user retention',
            'Productionized fine-tuned LLM document extraction pipeline with 96.4% precision, saving 12,000 manual review hours annually',
            'Implemented automated MLOps model monitoring with MLflow, detecting data drift and retraining models in real time',
          ],
        },
        {
          id: 'ds2',
          role: 'Data Scientist',
          company: 'E-Comm Analytics Labs',
          location: 'Hyderabad',
          start: 'Jun 2019',
          end: 'Dec 2021',
          current: false,
          bullets: [
            'Formulated customer lifetime value (LTV) models with XGBoost, boosting targeted campaign ROI by 38%',
            'Architected distributed PySpark ETL pipelines extracting insights from 4TB daily clickstream data in Snowflake',
          ],
        },
      ],
      education: [
        { id: 'edu5', school: 'IISc Bengaluru', degree: 'Ph.D.', field: 'Machine Learning & Computational Data Science', start: '2015', end: '2019', details: 'Published 4 papers in NeurIPS & ICML' },
      ],
      skills: ['Python', 'PyTorch', 'TensorFlow', 'Scikit-Learn', 'SQL', 'PySpark', 'Snowflake', 'NLP / LLMs', 'Docker', 'MLOps', 'Feature Engineering', 'Tableau'],
      projects: [
        { id: 'p7', name: 'OpenHealth AI', link: 'github.com/kavita/openhealth', description: 'Early diagnostic classification model for chest radiography with 94.8% ROC-AUC score.' },
      ],
      certifications: [
        { id: 'c7', name: 'TensorFlow Developer Certified', issuer: 'Google', year: '2021' },
        { id: 'c8', name: 'AWS Certified Machine Learning – Specialty', issuer: 'Amazon Web Services', year: '2022' },
      ],
    },
  },
  {
    id: 'marketing',
    label: 'Digital Marketing & Growth Manager',
    icon: '🚀',
    category: 'Marketing & Growth',
    data: {
      basics: {
        name: 'Vikram Sengupta',
        title: 'Head of Growth & Digital Marketing',
        email: 'vikram.growth@marketinghub.com',
        phone: '+91 98450 11223',
        location: 'Delhi NCR, India',
        website: 'vikramsengupta.com',
        linkedin: 'linkedin.com/in/vikramsengupta',
        summary:
          'Data-driven growth marketer with 7+ years scaling B2B & B2C acquisition funnels. Scaled SaaS ARR from $1.5M to $8M through organic SEO, paid acquisition campaigns, and conversion rate optimization (CRO).',
      },
      experience: [
        {
          id: 'mkt1',
          role: 'Growth Marketing Director',
          company: 'SaaSify Platforms',
          location: 'Gurugram',
          start: 'May 2021',
          end: 'Present',
          current: true,
          bullets: [
            'Scaled paid media across Google Ads and LinkedIn with $120k monthly spend, reducing Customer Acquisition Cost (CAC) by 31%',
            'Spearheaded programmatic SEO campaign ranking for 1,400+ high-intent keywords, driving 450,000 monthly organic visitors',
            'Implemented behavioral email automation lifecycle in HubSpot that boosted lead-to-paid demo conversion rate by 24%',
          ],
        },
        {
          id: 'mkt2',
          role: 'Performance Marketing Manager',
          company: 'Zest Media Group',
          location: 'Noida',
          start: 'Jan 2018',
          end: 'Apr 2021',
          current: false,
          bullets: [
            'Managed omnichannel growth campaigns delivering $3.4M in client revenue at an average 4.2x Return on Ad Spend (ROAS)',
            'Ran 80+ rigorous A/B landing page experiments, lifting baseline signup conversion from 3.1% to 6.8%',
          ],
        },
      ],
      education: [
        { id: 'edu6', school: 'Faculty of Management Studies (FMS) Delhi', degree: 'MBA', field: 'Marketing & Strategy', start: '2016', end: '2018', details: 'Dean’s Honor List' },
      ],
      skills: ['Performance Marketing', 'SEO Optimization', 'Google Ads', 'LinkedIn Ads', 'HubSpot CRM', 'Google Analytics 4', 'A/B Testing', 'Conversion Rate Optimization', 'Content Strategy', 'Mixpanel', 'Email Marketing'],
      projects: [
        { id: 'p8', name: 'The Growth Playbook', link: 'growthplaybook.co', description: 'Weekly growth case study newsletter with 35,000 active marketing professional subscribers.' },
      ],
      certifications: [
        { id: 'c9', name: 'Google Ads Search & Display Certified', issuer: 'Google', year: '2023' },
        { id: 'c10', name: 'HubSpot Inbound Marketing Certified', issuer: 'HubSpot Academy', year: '2022' },
      ],
    },
  },
  {
    id: 'finance',
    label: 'Financial Analyst & Accountant',
    icon: '📈',
    category: 'Finance & Banking',
    data: {
      basics: {
        name: 'Ritu Kulkarni',
        title: 'Senior Financial Analyst & CPA',
        email: 'ritu.kulkarni@capitalcorp.com',
        phone: '+91 97654 32109',
        location: 'Mumbai, India',
        website: 'ritukulkarni.cpa',
        linkedin: 'linkedin.com/in/ritukulkarni-cpa',
        summary:
          'Chartered Accountant with 6+ years in corporate financial planning, variance analysis, and cash flow modeling. Streamlined annual budgeting for a $140M enterprise, uncovering $2.4M in operational savings.',
      },
      experience: [
        {
          id: 'fin1',
          role: 'Lead Financial Analyst',
          company: 'Apex Global Capital Partners',
          location: 'Mumbai',
          start: 'Sep 2021',
          end: 'Present',
          current: true,
          bullets: [
            'Built 3-statement financial forecasting models and DCF valuation frameworks for 12 M&A transactions valued at $85M',
            'Delivered monthly executive FP&A variance reports to CFO and board members with actionable variance breakdowns',
            'Automated financial close reconciliations with Power BI and Advanced Excel macros, shaving 4 days off month-end close',
          ],
        },
        {
          id: 'fin2',
          role: 'Corporate Financial Auditor',
          company: 'Deloitte India',
          location: 'Mumbai',
          start: 'Oct 2018',
          end: 'Aug 2021',
          current: false,
          bullets: [
            'Conducted statutory audits for 6 Fortune 500 manufacturing and tech clients following Ind AS and IFRS standards',
            'Audited internal financial controls and risk management compliance, reducing audit deficiency findings by 40%',
          ],
        },
      ],
      education: [
        { id: 'edu7', school: 'The Institute of Chartered Accountants of India (ICAI)', degree: 'Chartered Accountant (CA)', field: 'Finance & Auditing', start: '2014', end: '2018', details: 'All India Rank (AIR) 32' },
      ],
      skills: ['Financial Modeling', 'DCF Valuation', 'FP&A Reporting', 'Budgeting & Forecasting', 'IFRS / Ind AS', 'Power BI', 'SAP ERP', 'Advanced Excel / VBA', 'Cash Flow Analysis', 'Risk Management'],
      projects: [
        { id: 'p9', name: 'SaaS Metrics Valuation Suite', link: 'github.com/ritu/saas-valuation', description: 'Financial model template for calculating CAC payback, Net Dollar Retention, and rule-of-40 benchmarks.' },
      ],
      certifications: [
        { id: 'c11', name: 'Chartered Financial Analyst (CFA) Level II Passed', issuer: 'CFA Institute', year: '2023' },
        { id: 'c12', name: 'Chartered Accountant (CA)', issuer: 'ICAI', year: '2018' },
      ],
    },
  },
  {
    id: 'pm',
    label: 'Project & Operations Manager',
    icon: '📋',
    category: 'Management & Operations',
    data: {
      basics: {
        name: 'Pooja Iyer',
        title: 'Senior Technical Project Manager (PMP®)',
        email: 'pooja.iyer@agilelead.com',
        phone: '+91 98333 44556',
        location: 'Chennai, India',
        website: 'poojaiyer.pm',
        linkedin: 'linkedin.com/in/poojaiyer-pmp',
        summary:
          'PMP-certified Senior Project Manager with 8+ years leading cross-functional engineering, design, and QA teams. Delivered 22 enterprise product launches on time and under budget using Agile/Scrum frameworks.',
      },
      experience: [
        {
          id: 'pm1',
          role: 'Senior Project Manager',
          company: 'Vertex Digital Solutions',
          location: 'Chennai',
          start: 'Jan 2021',
          end: 'Present',
          current: true,
          bullets: [
            'Managed delivery of multi-cloud transformation program across 4 global teams (42 engineers) with a $6.5M budget',
            'Implemented Agile sprint cadence and Jira workflows that increased team sprint velocity by 36% in two quarters',
            'Mitigated high-risk technical roadblocks through weekly stakeholder alignment and rigorous RAID log governance',
          ],
        },
        {
          id: 'pm2',
          role: 'Scrum Master & Project Lead',
          company: 'Infosys Technologies',
          location: 'Bengaluru',
          start: 'Jun 2016',
          end: 'Dec 2020',
          current: false,
          bullets: [
            'Facilitated daily standups, sprint planning, and retrospective sessions for 3 engineering squads',
            'Reduced client onboarding delivery timeline from 90 days to 45 days through value-stream mapping',
          ],
        },
      ],
      education: [
        { id: 'edu8', school: 'Anna University College of Engineering', degree: 'B.E.', field: 'Information Technology', start: '2012', end: '2016', details: 'Graduated with First Class Distinction' },
      ],
      skills: ['Agile / Scrum', 'Jira & Confluence', 'PMP Standards', 'Risk Management (RAID)', 'Stakeholder Management', 'Sprint Planning', 'Budgeting & Forecasting', 'Resource Allocation', 'SDLC', 'Cross-Functional Delivery'],
      projects: [
        { id: 'p10', name: 'Agile Delivery Framework', link: 'poojaiyer.pm/agile-toolkit', description: 'Open sprint planning and retrospective templates used by 200+ engineering managers.' },
      ],
      certifications: [
        { id: 'c13', name: 'Project Management Professional (PMP®)', issuer: 'Project Management Institute (PMI)', year: '2020' },
        { id: 'c14', name: 'Certified ScrumMaster (CSM®)', issuer: 'Scrum Alliance', year: '2019' },
      ],
    },
  },
  {
    id: 'nurse',
    label: 'Healthcare & Registered Nurse',
    icon: '🩺',
    category: 'Healthcare & Nursing',
    data: {
      basics: {
        name: 'Anjali Thomas',
        title: 'Senior Critical Care Registered Nurse (RN)',
        email: 'anjali.thomas@healthcare.org',
        phone: '+91 97456 78901',
        location: 'Kochi, India',
        website: 'anjalithomas.rn',
        linkedin: 'linkedin.com/in/anjalithomas-rn',
        summary:
          'Compassionate, licensed Critical Care Registered Nurse with 7+ years administering intensive patient care in Level-1 trauma centers. Recognized for clinical excellence, rapid emergency triage, and patient advocacy.',
      },
      experience: [
        {
          id: 'nur1',
          role: 'Intensive Care Unit (ICU) Charge Nurse',
          company: 'Aster Medcity Specialty Hospital',
          location: 'Kochi',
          start: 'Apr 2021',
          end: 'Present',
          current: true,
          bullets: [
            'Supervised 18 ICU beds and led a nursing shift of 12 clinical nurses, prioritizing acute emergencies and ventilatory support',
            'Reduced central line-associated bloodstream infection (CLABSI) rates to 0% across 18 consecutive months through sterile protocol audits',
            'Administered complex intravenous vasoactive infusions, hemodialysis support, and continuous hemodynamic monitoring',
          ],
        },
        {
          id: 'nur2',
          role: 'Staff Registered Nurse – Emergency & Trauma',
          company: 'Apollo Multi-Specialty Hospital',
          location: 'Chennai',
          start: 'Jan 2017',
          end: 'Mar 2021',
          current: false,
          bullets: [
            'Delivered urgent resuscitation and critical stabilization care to 25+ trauma and cardiac arrest patients per shift',
            'Trained 20+ newly inducted graduate nurses on electronic health record (EHR) charting and pharmacological safety checks',
          ],
        },
      ],
      education: [
        { id: 'edu9', school: 'Christian Medical College (CMC) Vellore', degree: 'B.Sc.', field: 'Nursing Science', start: '2012', end: '2016', details: 'Gold Medalist for Clinical Academic Distinction' },
      ],
      skills: ['Critical Care Nursing (ICU)', 'Emergency Triage (BLS/ACLS)', 'Patient Advocacy', 'Hemodynamic Monitoring', 'Ventilator Management', 'Infection Control Protocols', 'Electronic Health Records (EHR)', 'IV Infusion Administration'],
      projects: [
        { id: 'p11', name: 'ICU Sepsis Early-Warning Protocol', link: 'astermedcity.com/clinical-excellence', description: 'Co-developed clinical nurse checklist cutting septic shock response time by 35 minutes.' },
      ],
      certifications: [
        { id: 'c15', name: 'Advanced Cardiovascular Life Support (ACLS)', issuer: 'American Heart Association (AHA)', year: '2023' },
        { id: 'c16', name: 'Critical Care Registered Nurse (CCRN)', issuer: 'AACN Certification Corporation', year: '2021' },
      ],
    },
  },
  {
    id: 'sales',
    label: 'Sales Director & Account Executive',
    icon: '💼',
    category: 'Sales & Revenue',
    data: {
      basics: {
        name: 'Karan Malhotra',
        title: 'Senior Enterprise Account Executive',
        email: 'karan.malhotra@enterprisesales.com',
        phone: '+91 99100 22334',
        location: 'Gurugram, India',
        website: 'karanmalhotra.sales',
        linkedin: 'linkedin.com/in/karanmalhotra-sales',
        summary:
          'High-performing B2B enterprise sales leader with 8+ years exceeding quota in cloud software. Generated $14.2M in cumulative contracted Annual Recurring Revenue (ARR) across Tier-1 enterprise clients.',
      },
      experience: [
        {
          id: 'sal1',
          role: 'Strategic Enterprise Account Director',
          company: 'OmniCloud Technologies',
          location: 'Gurugram',
          start: 'Jan 2021',
          end: 'Present',
          current: true,
          bullets: [
            'Achieved 142% of annual quota in FY2023, closing $4.8M in enterprise multi-year ARR deals across banking and telecom clients',
            'Spearheaded enterprise pipeline generation through C-level outreach, maintaining a healthy 4.5x rolling pipeline coverage',
            'Negotiated complex 7-figure master service agreements (MSAs) with legal and procurement teams, shortening deal cycle by 22 days',
          ],
        },
        {
          id: 'sal2',
          role: 'Senior Account Executive',
          company: 'SaaSGlobal Software',
          location: 'Noida',
          start: 'Jul 2017',
          end: 'Dec 2020',
          current: false,
          bullets: [
            'Recognized as President’s Club Top Performer for 3 consecutive years, averaging 128% annual quota attainment',
            'Expanded existing client contract values by 48% through strategic upselling and executive business reviews (EBRs)',
          ],
        },
      ],
      education: [
        { id: 'edu10', school: 'Symbiosis Institute of Business Management (SIBM)', degree: 'MBA', field: 'Marketing & International Sales', start: '2015', end: '2017', details: 'Top 5% of Graduating Cohort' },
      ],
      skills: ['Enterprise B2B Sales', 'MEDDPICC Methodology', 'Salesforce CRM', 'C-Level Negotiations', 'Contract Drafting (MSA/SOW)', 'Pipeline Generation', 'Account-Based Selling (ABS)', 'Revenue Forecasting'],
      projects: [
        { id: 'p12', name: 'Enterprise Sales Playbook', link: 'karanmalhotra.sales/playbook', description: 'Internal deal qualification guide adopted by 65 enterprise reps across the APAC region.' },
      ],
      certifications: [
        { id: 'c17', name: 'MEDDPICC Enterprise Sales Certified', issuer: 'MEDDICC Academy', year: '2022' },
        { id: 'c18', name: 'Salesforce Certified Administrator', issuer: 'Salesforce', year: '2020' },
      ],
    },
  },
  {
    id: 'hr',
    label: 'Human Resources (HR) & Talent Specialist',
    icon: '👥',
    category: 'Human Resources',
    data: {
      basics: {
        name: 'Meera Chawla',
        title: 'Senior People Operations & Talent Acquisition Manager',
        email: 'meera.chawla@peopleops.com',
        phone: '+91 98777 66554',
        location: 'Bengaluru, India',
        website: 'meerachawla.hr',
        linkedin: 'linkedin.com/in/meerachawla-hr',
        summary:
          'People operations leader with 7+ years specializing in technical talent acquisition, employee retention, and performance management. Scaled engineering and leadership teams from 60 to 450 employees while reducing 90-day attrition to under 4%.',
      },
      experience: [
        {
          id: 'hr1',
          role: 'Head of Talent & People Operations',
          company: 'InnoTech Innovations',
          location: 'Bengaluru',
          start: 'Feb 2021',
          end: 'Present',
          current: true,
          bullets: [
            'Scaled engineering and executive headcount from 85 to 320 employees within 18 months, reducing average time-to-hire by 28 days',
            'Spearheaded bi-annual OKR and 360-degree performance evaluation cycles in Lattice, lifting employee engagement scores to 89%',
            'Engineered diversity hiring initiatives that increased female technical engineering representation from 18% to 34%',
          ],
        },
        {
          id: 'hr2',
          role: 'Senior Technical Recruiter',
          company: 'TalentWave Global',
          location: 'Pune',
          start: 'Jun 2017',
          end: 'Jan 2021',
          current: false,
          bullets: [
            'Partnered with CTO and VPs of Engineering to close 140+ specialized software engineers, architects, and product managers',
            'Implemented automated applicant tracking workflows in Greenhouse, lowering agency recruitment reliance by 75%',
          ],
        },
      ],
      education: [
        { id: 'edu11', school: 'Tata Institute of Social Sciences (TISS) Mumbai', degree: 'M.A.', field: 'Human Resources Management & Labour Relations', start: '2015', end: '2017', details: 'Distinction in Organizational Behavior' },
      ],
      skills: ['Talent Acquisition', 'Greenhouse ATS', 'Lattice Performance', 'Employee Relations', 'HR Compliance & Labor Laws', 'Compensation & Benefits', 'Onboarding Workflows', 'Culture & Retention'],
      projects: [
        { id: 'p13', name: 'Remote Work People Operations Manual', link: 'meerachawla.hr/remote-guide', description: 'Comprehensive guide covering asynchronous workflows, mental health stipends, and compliance.' },
      ],
      certifications: [
        { id: 'c19', name: 'SHRM Senior Certified Professional (SHRM-SCP®)', issuer: 'Society for Human Resource Management', year: '2021' },
      ],
    },
  },
  {
    id: 'mechanical',
    label: 'Mechanical Design Engineer',
    icon: '⚙️',
    category: 'Engineering & Manufacturing',
    data: {
      basics: {
        name: 'Aditya Rao',
        title: 'Senior Mechanical Design & CAD Engineer',
        email: 'aditya.rao@mechdesign.com',
        phone: '+91 97888 12345',
        location: 'Pune, India',
        website: 'adityarao.mech',
        linkedin: 'linkedin.com/in/adityarao-mech',
        summary:
          'Mechanical design engineer with 7+ years expertise in 3D CAD modeling, FEA thermal/stress simulations, and precision injection molding. Holds 2 patents in lightweight electric vehicle battery enclosure packaging.',
      },
      experience: [
        {
          id: 'mec1',
          role: 'Lead Mechanical Systems Engineer',
          company: 'ElectroMotion EV Systems',
          location: 'Pune',
          start: 'May 2021',
          end: 'Present',
          current: true,
          bullets: [
            'Designed aluminum die-cast battery enclosures for next-gen electric scooters, achieving 18% weight reduction while exceeding IP67 waterproof standards',
            'Conducted finite element analysis (FEA) and computational fluid dynamics (CFD) in ANSYS to optimize thermal cooling pathways',
            'Managed tooling fabrication and DFM reviews with Tier-1 manufacturing suppliers, reducing injection molding cycle time by 14%',
          ],
        },
        {
          id: 'mec2',
          role: 'Product Design Engineer',
          company: 'Precision Automations Ltd',
          location: 'Chennai',
          start: 'Jul 2017',
          end: 'Apr 2021',
          current: false,
          bullets: [
            'Created 350+ parametric component assemblies and GD&T engineering drawings in SolidWorks for industrial robotic grippers',
            'Performed rapid 3D prototyping and physical drop-testing to validate structural fatigue and shock resistance',
          ],
        },
      ],
      education: [
        { id: 'edu12', school: 'College of Engineering Pune (COEP)', degree: 'B.Tech', field: 'Mechanical Engineering', start: '2013', end: '2017', details: 'Captain of University BAJA SAE Racing Team' },
      ],
      skills: ['SolidWorks', 'ANSYS FEA/CFD', 'GD&T (ASME Y14.5)', 'Design for Manufacturing (DFM)', 'Thermal Management', 'Injection Molding', 'Rapid Prototyping', 'Material Selection', 'AutoCAD'],
      projects: [
        { id: 'p14', name: 'Lightweight EV Chassis Module', link: 'adityarao.mech/chassis', description: 'Tubular space-frame chassis design delivering 32% torsional rigidity enhancement.' },
      ],
      certifications: [
        { id: 'c20', name: 'Certified SOLIDWORKS Expert (CSWE)', issuer: 'Dassault Systèmes', year: '2020' },
      ],
    },
  },
  {
    id: 'content',
    label: 'Content Creator & Copywriter',
    icon: '✍️',
    category: 'Content & Communications',
    data: {
      basics: {
        name: 'Tarun Saxena',
        title: 'Senior Brand Copywriter & Content Strategist',
        email: 'tarun.saxena@wordsmith.media',
        phone: '+91 99555 43210',
        location: 'Mumbai, India',
        website: 'tarunsaxena.copy',
        linkedin: 'linkedin.com/in/tarunsaxena-copy',
        summary:
          'Award-winning copywriter and narrative strategist with 6+ years creating brand voices, viral digital campaigns, and high-converting landing pages. Scripted video campaigns viewed over 18M times with 3.4x average conversion lift.',
      },
      experience: [
        {
          id: 'cnt1',
          role: 'Lead Copywriter & Content Strategist',
          company: 'Echo Brand Communications',
          location: 'Mumbai',
          start: 'Mar 2021',
          end: 'Present',
          current: true,
          bullets: [
            'Authored core brand positioning and tagline for 14 venture-backed startups, resulting in 4 Effie and Abbys advertising awards',
            'Wrote high-conversion product launch email sequences and landing pages generating $1.8M in direct ecommerce revenue',
            'Directed editorial content calendar producing 120+ long-form articles, capturing #1 Google rankings for 35 high-competition keywords',
          ],
        },
        {
          id: 'cnt2',
          role: 'Senior Digital Copywriter',
          company: 'SocialPulse Agency',
          location: 'Delhi',
          start: 'Jan 2018',
          end: 'Feb 2021',
          current: false,
          bullets: [
            'Crafted viral social media campaigns and video scripts for consumer lifestyle brands, generating 18M+ organic impressions',
            'Collaborated with creative directors and video animators to execute rapid-turnaround topical marketing campaigns',
          ],
        },
      ],
      education: [
        { id: 'edu13', school: 'St. Xavier’s College Mumbai', degree: 'B.A.', field: 'English Literature & Mass Media', start: '2014', end: '2017', details: 'Editor-in-Chief of College Annual Journal' },
      ],
      skills: ['Brand Storytelling', 'Direct-Response Copywriting', 'SEO Content Strategy', 'Video Scriptwriting', 'Email Marketing Campaigns', 'Social Media Copy', 'Creative Direction', 'Editing & Proofreading'],
      projects: [
        { id: 'p15', name: 'The Copy Vault', link: 'tarunsaxena.copy/vault', description: 'Curated library of 500+ analyzed high-converting landing page headlines and value propositions.' },
      ],
      certifications: [
        { id: 'c21', name: 'Direct Response Copywriting Certification', issuer: 'American Writers & Artists Institute (AWAI)', year: '2021' },
      ],
    },
  },
]

export const SAMPLE = PROFESSIONS[0].data
