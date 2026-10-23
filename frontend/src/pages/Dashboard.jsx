import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Upload, Copy, Trash2, Pencil, ScanSearch, Mail, Target, UserRoundSearch, Loader2, FileText, Crown, Clock, AlertTriangle } from 'lucide-react'
import { api } from '../api'
import { useAuth } from '../auth'
import { ResumePaper, ScaledPaper } from '../components/ResumeTemplates'
import { tone } from '../components/ScoreRing'
import UpgradeModal from '../components/UpgradeModal'

const TYPE = {
  ats: ['ATS check', ScanSearch], match: ['Job match', Target], cover: ['Cover letter', Mail], linkedin: ['LinkedIn', UserRoundSearch],
}

export default function Dashboard() {
  const { user } = useAuth()
  const nav = useNavigate()
  const fileRef = useRef()
  const [resumes, setResumes] = useState(null)
  const [history, setHistory] = useState([])
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [upgradeOpen, setUpgradeOpen] = useState(false)

  const load = () => {
    api.get('/resumes').then((r) => setResumes(r.resumes)).catch((e) => setError(e.message))
    api.get('/history').then((r) => setHistory(r.history)).catch(() => {})
  }
  useEffect(() => {
    load()
  }, [])

  const create = async () => {
    setBusy('new')
    try { const r = await api.post('/resumes', { title: 'My Resume' }); nav(`/builder/${r.resume.id}`) }
    catch (e) { setError(e.message); setBusy('') }
  }
  const importFile = async (file) => {
    if (!file) return
    setBusy('import'); setError('')
    try {
      const fd = new FormData(); fd.append('file', file)
      const r = await api.post('/resumes/import', fd)
      nav(`/builder/${r.resume.id}`)
    } catch (e) { setError(e.message); setBusy('') }
  }
  const dup = async (id) => { await api.post(`/resumes/${id}/duplicate`); load() }
  const del = async (id) => { if (confirm('Delete this resume permanently?')) { await api.del(`/resumes/${id}`); load() } }
  const delHist = async (id) => { await api.del(`/history/${id}`); setHistory(history.filter((h) => h.id !== id)) }

  return (
    <main className="page">
      <div className="container">
        {/* 1-Month Trial Active Banner */}
        {user?.is_trial && (
          <div className="alert alert-info row between" style={{ marginBottom: 24, background: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd', padding: '12px 18px', flexWrap: 'wrap', gap: 10 }}>
            <div className="row" style={{ gap: 10 }}>
              <Clock size={20} color="#0284c7" />
              <div>
                <strong style={{ fontSize: '0.92rem' }}>1-Month Free Trial Active ({user.trial_days_left} days remaining)</strong>
                <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>You have full access to Smartcvmaker. After 30 days, upgrade to Pro to continue unlimited use.</div>
              </div>
            </div>
            <button className="btn btn-sm btn-primary row" style={{ gap: 6, fontSize: '0.8rem', background: '#0284c7' }} onClick={() => setUpgradeOpen(true)}>
              <Crown size={14} /> Upgrade with Razorpay
            </button>
          </div>
        )}

        {/* 1-Month Trial Expired Banner */}
        {user?.is_trial_expired && (
          <div className="alert alert-error row between" style={{ marginBottom: 24, background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', padding: '14px 18px', flexWrap: 'wrap', gap: 12 }}>
            <div className="row" style={{ gap: 10 }}>
              <AlertTriangle size={22} color="#dc2626" />
              <div>
                <strong style={{ fontSize: '0.96rem' }}>Your 30-Day Free Trial has expired!</strong>
                <div style={{ fontSize: '0.82rem', opacity: 0.95 }}>To continue creating, customizing, and downloading with all 35 templates, please upgrade to the Pro version.</div>
              </div>
            </div>
            <button
              id="dashboard-upgrade-expired-btn"
              className="btn btn-primary btn-sm row"
              style={{ gap: 6, fontSize: '0.82rem', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' }}
              onClick={() => setUpgradeOpen(true)}
            >
              <Crown size={14} /> Take Pro Version via Razorpay
            </button>
          </div>
        )}

        <div className="row wrap" style={{ marginBottom: 32 }}>
          <div>
            <h1 className="page-title">Hi {user?.name?.split(' ')[0]} 👋</h1>
            <p className="muted">Build, score and tailor your resumes from one place.</p>
          </div>
          <span className="spacer" />
          <input ref={fileRef} type="file" hidden accept=".pdf,.docx,.txt" onChange={(e) => importFile(e.target.files[0])} />
          <button className="btn" onClick={() => fileRef.current.click()} disabled={!!busy}>{busy === 'import' ? <Loader2 size={16} className="spin" /> : <Upload size={16} />} Import resume</button>
          <button id="new-resume" className="btn btn-primary" onClick={create} disabled={!!busy}>{busy === 'new' ? <Loader2 size={16} className="spin" /> : <Plus size={16} />} New resume</button>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

        <div className="grid grid-4" style={{ marginBottom: 40 }}>
          {[['/tools/ats', 'ATS Checker', ScanSearch], ['/tools/job-match', 'Job Match', Target], ['/tools/cover-letter', 'Cover Letter', Mail], ['/tools/linkedin', 'LinkedIn Optimizer', UserRoundSearch]].map(([to, label, Icon]) => (
            <Link key={to} to={to} className="card card-hover row" style={{ padding: 18 }}>
              <div className="icon-bubble" style={{ margin: 0, width: 42, height: 42 }}><Icon size={19} /></div><strong>{label}</strong>
            </Link>
          ))}
        </div>

        <h2 style={{ fontSize: '1.5rem', marginBottom: 18 }}>Your resumes</h2>
        {resumes === null ? <div className="empty">Loading…</div> : resumes.length === 0 ? (
          <div className="card empty"><FileText size={44} /><p>No resumes yet. Create one or import an existing file.</p></div>
        ) : (
          <div className="grid grid-4">
            {resumes.map((r) => (
              <div key={r.id} className="card resume-card card-hover">
                <Link to={`/builder/${r.id}`} className="thumb">
                  <div className="thumb-inner"><ScaledPaper width={220}><ResumePaper data={r.data} template={r.template} accent={r.accent} font={r.font} /></ScaledPaper></div>
                </Link>
                <div className="resume-meta">
                  <div className="row"><strong style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</strong><span className="spacer" />
                    {r.ats_score != null && <span className={`score-pill ${tone(r.ats_score)}`}>ATS {r.ats_score}</span>}</div>
                  <div className="muted small" style={{ margin: '2px 0 12px' }}>Edited {new Date(r.updated_at).toLocaleDateString()}</div>
                  <div className="row">
                    <Link to={`/builder/${r.id}`} className="btn btn-sm" style={{ flex: 1 }}><Pencil size={14} /> Edit</Link>
                    <button className="btn btn-sm btn-icon" title="Duplicate" onClick={() => dup(r.id)}><Copy size={15} /></button>
                    <button className="btn btn-sm btn-icon btn-danger" title="Delete" onClick={() => del(r.id)}><Trash2 size={15} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {history.length > 0 && (
          <>
            <h2 style={{ fontSize: '1.5rem', margin: '48px 0 18px' }}>Recent activity</h2>
            <div className="card" style={{ padding: '8px 24px' }}>
              {history.slice(0, 8).map((h) => {
                const [label, Icon] = TYPE[h.type] || ['Analysis', ScanSearch]
                return (
                  <div key={h.id} className="rec row" style={{ alignItems: 'center' }}>
                    <Icon size={18} color="#c4b5fd" />
                    <div><strong>{label}</strong> <span className="muted">· {h.title || 'Untitled'}</span><div className="muted small">{new Date(h.created_at).toLocaleString()}</div></div>
                    <span className="spacer" />
                    {h.score != null && <span className={`score-pill ${tone(h.score)}`}>{h.score}</span>}
                    <button className="btn btn-sm btn-ghost btn-icon" onClick={() => delHist(h.id)} title="Remove"><Trash2 size={14} /></button>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </main>
  )
}
