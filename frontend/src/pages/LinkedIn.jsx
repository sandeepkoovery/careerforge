import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, UserRoundSearch, Sparkles, Copy, Check, CheckCircle2, Circle } from 'lucide-react'
import { api } from '../api'
import { ScoreRing } from '../components/ScoreRing'

function CopyBtn({ text }) {
  const [ok, setOk] = useState(false)
  return (
    <button className="btn btn-sm" onClick={async () => { await navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1400) }}>
      {ok ? <Check size={14} /> : <Copy size={14} />} {ok ? 'Copied' : 'Copy'}
    </button>
  )
}

export default function LinkedIn() {
  const [resumes, setResumes] = useState(null)
  const [f, setF] = useState({ resume_id: '', target_role: '', current_headline: '', current_about: '' })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [res, setRes] = useState(null)

  useEffect(() => {
    api.get('/resumes').then((r) => { setResumes(r.resumes); if (r.resumes[0]) setF((x) => ({ ...x, resume_id: String(r.resumes[0].id) })) }).catch((e) => setErr(e.message))
  }, [])

  const run = async () => {
    setBusy(true); setErr('')
    try { setRes(await api.post('/ai/linkedin', f)) } catch (e) { setErr(e.message) } finally { setBusy(false) }
  }
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  return (
    <main className="page">
      <div className="container">
        <div className="section-head" style={{ marginBottom: 36 }}>
          <span className="eyebrow"><UserRoundSearch size={14} /> LinkedIn Optimizer</span>
          <h1 className="page-title" style={{ marginTop: 14 }}>Get found by <span className="gradient-text">recruiters</span></h1>
          <p className="muted" style={{ marginTop: 10 }}>Generate a keyword-rich headline and About section from your resume, and audit your profile.</p>
        </div>

        {resumes && resumes.length === 0 ? (
          <div className="card empty"><p>Create a resume first — we use it to write your profile.</p><Link to="/templates" className="btn btn-primary" style={{ marginTop: 16 }}>Create a resume</Link></div>
        ) : (
          <div className="tool-grid">
            <div className="card stack" style={{ '--gap': '14px' }}>
              <div><label className="label" htmlFor="li-resume">Resume</label>
                <select id="li-resume" className="select" value={f.resume_id} onChange={set('resume_id')}>{(resumes || []).map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}</select></div>
              <div><label className="label" htmlFor="li-role">Target role (optional)</label><input id="li-role" className="input" value={f.target_role} onChange={set('target_role')} placeholder="e.g. Engineering Manager" /></div>
              <div><label className="label" htmlFor="li-h">Current headline (optional)</label><input id="li-h" className="input" value={f.current_headline} onChange={set('current_headline')} /></div>
              <div><label className="label" htmlFor="li-a">Current About section (optional)</label><textarea id="li-a" className="textarea" style={{ minHeight: 140 }} value={f.current_about} onChange={set('current_about')} placeholder="Paste to get a profile audit…" /></div>
              {err && <div className="alert alert-error">{err}</div>}
              <button id="run-linkedin" className="btn btn-primary btn-lg" disabled={!f.resume_id || busy} onClick={run}>
                {busy ? <Loader2 size={18} className="spin" /> : <Sparkles size={18} />} Optimise my profile
              </button>
            </div>

            <div>
              {!res ? (
                <div className="card empty"><UserRoundSearch size={48} /><p>Your optimised profile content will appear here.</p></div>
              ) : (
                <div className="stack fade-in" style={{ '--gap': '20px' }}>
                  <div className="card">
                    <h3 style={{ marginBottom: 14 }}>Headline options</h3>
                    <div className="stack" style={{ '--gap': '10px' }}>
                      {res.headline_options.map((h, i) => (
                        <div key={i} className="row" style={{ padding: '12px 14px', borderRadius: 12, background: 'rgba(0,0,0,.3)', border: '1px solid var(--border)' }}>
                          <span style={{ flex: 1 }}>{h}</span><CopyBtn text={h} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="card">
                    <div className="row" style={{ marginBottom: 12 }}><h3>About section</h3><span className="spacer" /><CopyBtn text={res.about} /></div>
                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, padding: 16, borderRadius: 12, background: 'rgba(0,0,0,.3)', border: '1px solid var(--border)' }}>{res.about}</div>
                  </div>
                  <div className="card">
                    <h3 style={{ marginBottom: 12 }}>Skills to feature</h3>
                    <div className="row wrap" style={{ gap: 7 }}>{res.suggested_skills.map((s) => <span key={s} className="chip">{s}</span>)}</div>
                  </div>
                  <div className="card">
                    <div className="row wrap" style={{ gap: 24, marginBottom: 8 }}>
                      <ScoreRing value={res.score} size={96} />
                      <div><h3>Profile checklist</h3><p className="muted small">{res.audited_current_profile ? 'Based on the profile text you pasted.' : 'Paste your current headline and About to audit them.'}</p></div>
                    </div>
                    {res.tips.map((t, i) => (
                      <div key={i} className="rec">
                        {t.done ? <CheckCircle2 size={18} color="#34d399" style={{ flex: 'none' }} /> : <Circle size={18} color="#6b6b85" style={{ flex: 'none' }} />}
                        <div><strong>{t.label}</strong><div className="muted small">{t.tip}</div></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
