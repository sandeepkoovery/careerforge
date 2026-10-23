import { Link } from 'react-router-dom'
import { ArrowRight, ScanSearch, Mail, Target, UserRoundSearch, LayoutTemplate, Wand2, CheckCircle2, Upload, PenLine, Download } from 'lucide-react'
import { ResumePaper, ScaledPaper } from '../components/ResumeTemplates'
import { ScoreRing } from '../components/ScoreRing'
import { SAMPLE, TEMPLATES } from '../data'

const FEATURES = [
  { icon: Wand2, title: 'AI Resume Builder', to: '/templates', text: 'Write with live suggestions. Rewrite weak bullets, draft summaries and discover skills for your target role — while a live preview updates as you type.' },
  { icon: ScanSearch, title: 'ATS Score Checker', to: '/tools/ats', text: 'Upload a PDF or DOCX and get an instant compatibility score with a section-by-section breakdown and prioritised fixes.' },
  { icon: Mail, title: 'Cover Letter Generator', to: '/tools/cover-letter', text: 'Personalised letters tailored to each job, drawing on your real achievements and the keywords in the posting.' },
  { icon: Target, title: 'Job Match Analysis', to: '/tools/job-match', text: 'Paste a job description and see exactly which skills you cover, what is missing and how to close the gap.' },
  { icon: UserRoundSearch, title: 'LinkedIn Optimizer', to: '/tools/linkedin', text: 'Headline options, a polished About section and a profile checklist designed to attract recruiters.' },
  { icon: LayoutTemplate, title: '12 Modern Templates', to: '/templates', text: 'Recruiter-approved layouts with custom colours and fonts. 3 free forever layouts, plus 9 Pro designs for competitive applicants.' },
]

export default function Landing() {
  return (
    <main>
      <section className="hero">
        <div className="container hero-grid">
          <div className="fade-in">
            <span className="eyebrow"><span className="dot-live" /> Free ATS check — no sign-up needed</span>
            <h1>Build a resume that <span className="gradient-text">beats the bots</span> and wins the interview.</h1>
            <p className="lead">Smartcvmaker helps you craft ATS-friendly resumes, tailor them to every job, and land in front of recruiters — with smart scoring and writing help built in.</p>
            <div className="row wrap" style={{ marginTop: 32 }}>
              <Link to="/register" className="btn btn-primary btn-lg">Build my resume <ArrowRight size={18} /></Link>
              <Link to="/tools/ats" className="btn btn-lg">Check my ATS score</Link>
            </div>
            <div className="row wrap muted small" style={{ marginTop: 28, gap: 22 }}>
              {['ATS-optimised templates', 'Instant PDF export', 'Real-time feedback'].map((t) => (
                <span key={t} className="row" style={{ gap: 6 }}><CheckCircle2 size={16} color="#059669" />{t}</span>
              ))}
            </div>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <div className="hero-paper">
              <ScaledPaper width={400}><ResumePaper data={SAMPLE} template="modern" accent="#6366f1" /></ScaledPaper>
            </div>
            <div className="float-card a">
              <div className="row" style={{ gap: 14 }}>
                <ScoreRing value={92} size={74} />
                <div><div style={{ fontWeight: 700 }}>ATS Score</div><div className="muted small">Excellent match</div></div>
              </div>
            </div>
            <div className="float-card b">
              <div className="small muted" style={{ marginBottom: 8 }}>Keyword match</div>
              <div className="row wrap" style={{ maxWidth: 220, gap: 6 }}>
                <span className="chip good">Laravel</span><span className="chip good">React</span>
                <span className="chip good">Docker</span><span className="chip bad">Kubernetes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="features">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Everything in one place</span>
            <h2>Your complete <span className="gradient-text">job-search toolkit</span></h2>
            <p className="muted">From first draft to final application — every tool you need to get noticed.</p>
          </div>
          <div className="grid grid-3">
            {FEATURES.map(({ icon: Icon, title, text, to }) => (
              <Link key={title} to={to} className="card card-hover">
                <div className="icon-bubble"><Icon size={22} /></div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: 8 }}>{title}</h3>
                <p className="muted">{text}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--surface-muted)' }}>
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">{TEMPLATES.length} Recruiter-Approved Layouts</span>
            <h2>Pick a design. <span className="gradient-text">Make it yours.</span></h2>
            <p className="muted">3 free templates for everyone, plus {TEMPLATES.length - 3} Pro layouts crafted for senior, tech, engineering, and creative roles.</p>
          </div>
          <div className="grid grid-3">
            {TEMPLATES.slice(0, 6).map((t, i) => {
              const accents = ['#6366f1', '#334155', '#0891b2', '#2563eb', '#db2777', '#059669']
              return (
                <Link key={t.id} to="/templates" className="card card-hover tpl-card">
                  <div className="thumb"><div className="thumb-inner">
                    <ScaledPaper width={250}><ResumePaper data={SAMPLE} template={t.id} accent={accents[i % accents.length]} /></ScaledPaper>
                  </div></div>
                  <div className="resume-meta">
                    <div className="row between" style={{ marginBottom: 4 }}>
                      <strong>{t.name}</strong>
                      <span className={`badge ${t.pro ? 'badge-pro' : 'badge-free'}`}>{t.pro ? '👑 PRO' : 'FREE'}</span>
                    </div>
                    <div className="muted small">{t.tag}</div>
                  </div>
                </Link>
              )
            })}
          </div>
          <div className="center" style={{ marginTop: 36 }}><Link to="/templates" className="btn btn-primary btn-lg">Explore all {TEMPLATES.length} templates <ArrowRight size={18} /></Link></div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head"><span className="eyebrow">How it works</span><h2>From blank page to <span className="gradient-text">job-ready</span> in 3 steps</h2></div>
          <div className="grid grid-3">
            {[
              [Upload, 'Start your way', 'Import an existing PDF/DOCX or begin from a template. We parse your details automatically.'],
              [PenLine, 'Refine with feedback', 'Improve bullets, add keywords and watch your ATS score climb as you edit.'],
              [Download, 'Apply with confidence', 'Export a clean PDF, generate a matching cover letter and polish your LinkedIn.'],
            ].map(([Icon, title, text], i) => (
              <div key={title} className="card">
                <div className="step-num">0{i + 1}</div>
                <div className="row" style={{ margin: '6px 0 8px' }}><Icon size={20} color="#c4b5fd" /><h3 style={{ fontSize: '1.2rem' }}>{title}</h3></div>
                <p className="muted">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="cta-box">
            <h2 style={{ fontSize: 'clamp(2rem,4vw,3rem)' }}>Ready to forge a <span className="gradient-text">standout resume?</span></h2>
            <p className="muted" style={{ margin: '14px auto 28px', maxWidth: 520 }}>Create your free account and get your first ATS-friendly resume done in minutes.</p>
            <Link to="/register" className="btn btn-primary btn-lg">Get started free <ArrowRight size={18} /></Link>
          </div>
        </div>
      </section>
    </main>
  )
}
