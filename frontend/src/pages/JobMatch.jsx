import { useState } from 'react'
import { Loader2, Target, Sparkles } from 'lucide-react'
import { api } from '../api'
import ResumeSource, { emptySource, sourceReady, toFormData } from '../components/ResumeSource'
import { ScoreRing } from '../components/ScoreRing'
import { KeywordResult } from './AtsChecker'

export default function JobMatch() {
  const [source, setSource] = useState(emptySource)
  const [title, setTitle] = useState('')
  const [jd, setJd] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [res, setRes] = useState(null)

  const run = async () => {
    setBusy(true); setErr('')
    try { setRes(await api.post('/ai/job-match', toFormData(source, { job_description: jd, job_title: title }))) }
    catch (e) { setErr(e.message); setRes(null) }
    finally { setBusy(false) }
  }

  return (
    <main className="page">
      <div className="container">
        <div className="section-head" style={{ marginBottom: 36 }}>
          <span className="eyebrow"><Target size={14} /> Job Match Analysis</span>
          <h1 className="page-title" style={{ marginTop: 14 }}>How well do you <span className="gradient-text">fit the job?</span></h1>
          <p className="muted" style={{ marginTop: 10 }}>Compare your resume with a job description to see matched skills, gaps and exactly what to change.</p>
        </div>

        <div className="tool-grid">
          <div className="card stack" style={{ '--gap': '18px' }}>
            <ResumeSource value={source} onChange={setSource} />
            <div><label className="label" htmlFor="jt">Job title (optional)</label>
              <input id="jt" className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Senior Laravel Developer" /></div>
            <div><label className="label" htmlFor="jd">Job description</label>
              <textarea id="jd" className="textarea" style={{ minHeight: 200 }} value={jd} onChange={(e) => setJd(e.target.value)} placeholder="Paste the full job posting here…" /></div>
            {err && <div className="alert alert-error">{err}</div>}
            <button id="run-match" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={!sourceReady(source) || jd.trim().length < 40 || busy} onClick={run}>
              {busy ? <Loader2 size={18} className="spin" /> : <Sparkles size={18} />} Analyse match
            </button>
          </div>

          <div>
            {!res ? (
              <div className="card empty"><Target size={48} /><p>Your match report will appear here.</p></div>
            ) : (
              <div className="stack fade-in" style={{ '--gap': '20px' }}>
                <div className="card row wrap" style={{ gap: 32 }}>
                  <ScoreRing value={res.score} label="match" />
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <h2 style={{ fontSize: '1.6rem' }}>{res.verdict}</h2>
                    <div className="stack" style={{ '--gap': '10px', marginTop: 14 }}>
                      {[['Skills coverage', res.coverage.skills], ['Keyword coverage', res.coverage.keywords]].map(([l, v]) => v != null && (
                        <div key={l}><div className="row small" style={{ marginBottom: 4 }}><span className="muted">{l}</span><span className="spacer" /><strong>{v}%</strong></div>
                          <div className="bar"><span className={v >= 70 ? 'good' : v >= 45 ? 'warn' : 'bad'} style={{ width: `${v}%` }} /></div></div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="card"><h3 style={{ marginBottom: 14 }}>Keyword analysis</h3><KeywordResult k={res} /></div>
                <div className="card">
                  <h3 style={{ marginBottom: 6 }}>Tailoring tips</h3>
                  {res.suggestions.map((s, i) => <div key={i} className="rec"><span className="sev low" /><div>{s}</div></div>)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
