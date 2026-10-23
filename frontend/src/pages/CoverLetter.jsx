import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Mail, Sparkles, Copy, Check, Download } from 'lucide-react'
import { api } from '../api'

const TONES = [['professional', 'Professional'], ['enthusiastic', 'Enthusiastic'], ['concise', 'Concise'], ['creative', 'Creative']]

export default function CoverLetter() {
  const [resumes, setResumes] = useState(null)
  const [f, setF] = useState({ resume_id: '', company: '', job_title: '', manager: '', tone: 'professional', job_description: '' })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [res, setRes] = useState(null)
  const [text, setText] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    api.get('/resumes').then((r) => { setResumes(r.resumes); if (r.resumes[0]) setF((x) => ({ ...x, resume_id: String(r.resumes[0].id) })) }).catch((e) => setErr(e.message))
  }, [])

  const run = async () => {
    setBusy(true); setErr('')
    try { const r = await api.post('/ai/cover-letter', f); setRes(r); setText(r.letter) }
    catch (e) { setErr(e.message) }
    finally { setBusy(false) }
  }
  const copy = async () => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500) }
  const download = () => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }))
    a.download = `cover-letter-${f.company || 'draft'}.txt`
    a.click()
  }
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const ready = f.resume_id && f.company.trim() && f.job_title.trim()

  return (
    <main className="page">
      <div className="container">
        <div className="section-head" style={{ marginBottom: 36 }}>
          <span className="eyebrow"><Mail size={14} /> Cover Letter Generator</span>
          <h1 className="page-title" style={{ marginTop: 14 }}>A tailored letter for <span className="gradient-text">every application</span></h1>
          <p className="muted" style={{ marginTop: 10 }}>We use your real experience and the job details to draft a letter you can edit and send.</p>
        </div>

        {resumes && resumes.length === 0 ? (
          <div className="card empty"><p>You need a saved resume first so we can personalise your letter.</p><Link to="/templates" className="btn btn-primary" style={{ marginTop: 16 }}>Create a resume</Link></div>
        ) : (
          <div className="tool-grid">
            <div className="card stack" style={{ '--gap': '14px' }}>
              <div><label className="label" htmlFor="cl-resume">Resume</label>
                <select id="cl-resume" className="select" value={f.resume_id} onChange={set('resume_id')}>
                  {(resumes || []).map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
                </select></div>
              <div className="field-row">
                <div><label className="label" htmlFor="cl-company">Company</label><input id="cl-company" className="input" value={f.company} onChange={set('company')} placeholder="Acme Inc." /></div>
                <div><label className="label" htmlFor="cl-role">Job title</label><input id="cl-role" className="input" value={f.job_title} onChange={set('job_title')} placeholder="Product Manager" /></div>
              </div>
              <div><label className="label" htmlFor="cl-mgr">Hiring manager (optional)</label><input id="cl-mgr" className="input" value={f.manager} onChange={set('manager')} placeholder="Ms. Rao" /></div>
              <div><label className="label">Tone</label>
                <div className="tabs" style={{ flexWrap: 'wrap' }}>{TONES.map(([k, l]) => <button key={k} className={`tab ${f.tone === k ? 'active' : ''}`} onClick={() => setF({ ...f, tone: k })}>{l}</button>)}</div></div>
              <div><label className="label" htmlFor="cl-jd">Job description (recommended)</label>
                <textarea id="cl-jd" className="textarea" style={{ minHeight: 140 }} value={f.job_description} onChange={set('job_description')} placeholder="Paste the posting so we can highlight the right skills…" /></div>
              {err && <div className="alert alert-error">{err}</div>}
              <button id="run-cover" className="btn btn-primary btn-lg" disabled={!ready || busy} onClick={run}>
                {busy ? <Loader2 size={18} className="spin" /> : <Sparkles size={18} />} Generate cover letter
              </button>
            </div>

            <div>
              {!res ? (
                <div className="card empty"><Mail size={48} /><p>Your cover letter will appear here.</p></div>
              ) : (
                <div className="fade-in stack" style={{ '--gap': '14px' }}>
                  <div className="row wrap">
                    <span className={`chip ${res.source === 'ai' ? 'good' : ''}`}><Sparkles size={13} /> {res.source === 'ai' ? 'AI-written' : 'Smart template'}</span>
                    <span className="spacer" />
                    <button className="btn btn-sm" onClick={copy}>{copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}</button>
                    <button className="btn btn-sm" onClick={download}><Download size={14} /> .txt</button>
                    <button className="btn btn-sm" onClick={run} disabled={busy}>Regenerate</button>
                  </div>
                  <textarea aria-label="Cover letter" className="letter" style={{ width: '100%', minHeight: 520, border: 0, resize: 'vertical' }} value={text} onChange={(e) => setText(e.target.value)} />
                  <p className="muted small">You can edit the letter above before copying it.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
