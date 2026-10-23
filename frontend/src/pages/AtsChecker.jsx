import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Loader2, ScanSearch, CheckCircle2, AlertTriangle, XCircle, Sparkles } from 'lucide-react'
import { api } from '../api'
import ResumeSource, { emptySource, sourceReady, toFormData } from '../components/ResumeSource'
import { ScoreRing } from '../components/ScoreRing'

const ICON = { good: <CheckCircle2 size={16} color="#34d399" />, warn: <AlertTriangle size={16} color="#fbbf24" />, bad: <XCircle size={16} color="#fb7185" /> }

export function KeywordResult({ k }) {
  if (!k) return null
  return (
    <div className="stack">
      <div className="row wrap">
        <div style={{ flex: 1, minWidth: 220 }}>
          <div className="label">Matched keywords ({k.matched.length})</div>
          <div className="row wrap" style={{ gap: 6 }}>{k.matched.length ? k.matched.map((m) => <span key={m.term} className="chip good">{m.term}</span>) : <span className="muted small">None found</span>}</div>
        </div>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div className="label">Missing keywords ({k.missing.length})</div>
          <div className="row wrap" style={{ gap: 6 }}>{k.missing.length ? k.missing.map((m) => <span key={m.term} className={`chip ${m.importance === 'high' ? 'bad' : 'warn'}`}>{m.term}</span>) : <span className="muted small">Nothing missing 🎉</span>}</div>
        </div>
      </div>
    </div>
  )
}

export default function AtsChecker() {
  const loc = useLocation()
  const [source, setSource] = useState(loc.state?.resumeId ? { ...emptySource, mode: 'saved', resumeId: String(loc.state.resumeId) } : emptySource)
  const [jd, setJd] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [res, setRes] = useState(null)

  const run = async () => {
    setBusy(true); setErr('')
    try { setRes(await api.post('/ai/ats', toFormData(source, { job_description: jd }))) }
    catch (e) { setErr(e.message); setRes(null) }
    finally { setBusy(false) }
  }

  return (
    <main className="page">
      <div className="container">
        <div className="section-head" style={{ marginBottom: 36 }}>
          <span className="eyebrow"><ScanSearch size={14} /> ATS Resume Checker</span>
          <h1 className="page-title" style={{ marginTop: 14 }}>Will your resume <span className="gradient-text">survive the ATS?</span></h1>
          <p className="muted" style={{ marginTop: 10 }}>Upload your resume and get an instant compatibility score with a detailed list of fixes. No account required.</p>
        </div>

        <div className="tool-grid">
          <div className="card stack" style={{ '--gap': '18px' }}>
            <ResumeSource value={source} onChange={setSource} />
            <div>
              <label className="label" htmlFor="jd">Job description (optional)</label>
              <textarea id="jd" className="textarea" placeholder="Paste a job posting to also score keyword relevance for that role…" value={jd} onChange={(e) => setJd(e.target.value)} />
            </div>
            {err && <div className="alert alert-error">{err}</div>}
            <button id="run-ats" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={!sourceReady(source) || busy} onClick={run}>
              {busy ? <Loader2 size={18} className="spin" /> : <Sparkles size={18} />} Analyse my resume
            </button>
          </div>

          <div>
            {!res ? (
              <div className="card empty"><ScanSearch size={48} /><p>Your score and recommendations will appear here.</p></div>
            ) : (
              <div className="stack fade-in" style={{ '--gap': '20px' }}>
                <div className="card row wrap" style={{ gap: 32 }}>
                  <ScoreRing value={res.score} label={res.grade} />
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <h2 style={{ fontSize: '1.6rem' }}>{res.grade} ATS compatibility</h2>
                    <p className="muted" style={{ margin: '6px 0 14px' }}>
                      {res.stats.words} words · {res.stats.bullets} achievement lines · {res.stats.quantified} quantified
                    </p>
                    <div className="row wrap" style={{ gap: 6 }}>{res.strengths.map((s) => <span key={s} className="chip good"><CheckCircle2 size={13} />{s}</span>)}</div>
                  </div>
                </div>

                <div className="card">
                  <h3 style={{ marginBottom: 16 }}>Score breakdown</h3>
                  <div className="stack" style={{ '--gap': '16px' }}>
                    {res.breakdown.map((b) => (
                      <div key={b.key}>
                        <div className="row" style={{ marginBottom: 6 }}>{ICON[b.status]}<strong>{b.label}</strong><span className="spacer" /><span className="muted small">{b.score}/{b.max}</span></div>
                        <div className="bar"><span className={b.status} style={{ width: `${(b.score / b.max) * 100}%` }} /></div>
                        <div className="muted small" style={{ marginTop: 5 }}>{b.detail}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {res.recommendations.length > 0 && (
                  <div className="card">
                    <h3 style={{ marginBottom: 6 }}>How to improve</h3>
                    {res.recommendations.map((r, i) => (
                      <div key={i} className="rec"><span className={`sev ${r.severity}`} /><div><strong>{r.title}</strong><div className="muted small">{r.detail}</div></div></div>
                    ))}
                  </div>
                )}

                {res.keywords && <div className="card"><h3 style={{ marginBottom: 14 }}>Job keyword match · {res.keywords.score}%</h3><KeywordResult k={res.keywords} /></div>}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
