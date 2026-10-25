import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, Download, ChevronDown, ChevronUp, Plus, Trash2, Sparkles, Loader2, Check, User, FileText, Briefcase,
  GraduationCap, Wrench, FolderGit2, Award, X, ArrowUp, ArrowDown, Eye, Pencil, ScanSearch, Crown, Printer, LayoutTemplate, Lock,
  CheckCircle2, AlertCircle, Shield, Clock, AlertTriangle
} from 'lucide-react'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { api } from '../api'
import { useAuth } from '../auth'
import { ACCENTS, FONTS, PROFESSIONS, SAMPLE, TEMPLATES, uid } from '../data'
import { ResumePaper, ScaledPaper } from '../components/ResumeTemplates'
import { tone } from '../components/ScoreRing'
import UpgradeModal from '../components/UpgradeModal'

const LIST_KEYS = ['experience', 'education', 'skills', 'projects', 'certifications']
const normalise = (d = {}) => ({
  basics: { name: '', title: '', email: '', phone: '', location: '', website: '', linkedin: '', summary: '', ...(d.basics || {}) },
  ...Object.fromEntries(LIST_KEYS.map((k) => [k, Array.isArray(d[k]) ? d[k] : []])),
})

function Field({ label, value, onChange, textarea, placeholder, type = 'text', id }) {
  const P = { id, className: textarea ? 'textarea' : 'input', value: value ?? '', placeholder, onChange: (e) => onChange(e.target.value) }
  return (
    <div className="field">
      {label && <label className="label" htmlFor={id}>{label}</label>}
      {textarea ? <textarea {...P} rows={4} /> : <input {...P} type={type} />}
    </div>
  )
}

function Accordion({ title, icon: Icon, open, onToggle, children, action }) {
  return (
    <section className="acc">
      <button className="acc-head" onClick={onToggle}>
        <Icon size={17} color="#6366f1" /><span>{title}</span><span className="spacer" />
        {action}{open ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
      </button>
      {open && <div className="acc-body">{children}</div>}
    </section>
  )
}

function Suggestions({ state, onPick, onClose }) {
  if (!state) return null
  return (
    <div className="suggest-box fade-in">
      <div className="row small" style={{ color: '#4338ca' }}>
        <Sparkles size={14} /> <strong>AI Suggestions</strong><span className="spacer" />
        <button className="btn btn-icon btn-ghost btn-sm" onClick={onClose}><X size={14} /></button>
      </div>
      {state.loading ? <div className="small muted" style={{ padding: 8 }}><Loader2 size={14} className="spin" /> Thinking…</div>
        : state.items.length === 0 ? <div className="small muted" style={{ padding: 8 }}>No suggestions available.</div>
          : state.items.map((s, i) => <button key={i} className="suggest-opt" onClick={() => onPick(s)}>{s}</button>)}
      {state.note && <div className="small muted" style={{ marginTop: 8 }}>{state.note}</div>}
    </div>
  )
}

export default function Builder() {
  const { id } = useParams()
  const { user } = useAuth()
  const nav = useNavigate()
  const [resume, setResume] = useState(null)
  const [status, setStatus] = useState('saved')
  const [err, setErr] = useState('')
  const [open, setOpen] = useState('basics')
  const [view, setView] = useState('edit')
  const [sug, setSug] = useState(null)
  const [skillInput, setSkillInput] = useState('')
  const [paneW, setPaneW] = useState(700)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [templateModalOpen, setTemplateModalOpen] = useState(false)
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false)
  const [profModalOpen, setProfModalOpen] = useState(false)
  const [profChoice, setProfChoice] = useState('')
  const [sampleSuccess, setSampleSuccess] = useState('')
  const [targetTplName, setTargetTplName] = useState('')
  const [downloading, setDownloading] = useState(false)
  const paneRef = useRef()
  const dirty = useRef(false)

  const resetToBlank = (confirmPrompt = false) => {
    if (confirmPrompt && !isEmpty && !window.confirm('Clear all fields to start a blank custom resume?')) {
      return
    }
    mutate((r) => {
      r.data = {
        basics: {
          name: '',
          title: '',
          email: '',
          phone: '',
          location: '',
          website: '',
          linkedin: '',
          summary: '',
        },
        experience: [],
        education: [],
        skills: [],
        projects: [],
        certifications: [],
      }
      r.title = 'Custom Resume'
    })
    setProfChoice('blank')
    setSampleSuccess('Cleared all dummy content! Custom blank canvas ready.')
    setTimeout(() => setSampleSuccess(''), 3500)
  }

  const loadProfession = (profId) => {
    if (profId === 'blank') {
      resetToBlank(false)
      return
    }
    const resolvedId = profId === 'dev' ? 'developer' : (profId === 'datascience' ? 'data_scientist' : profId)
    const prof = PROFESSIONS.find((p) => p.id === resolvedId || p.id === profId)
    if (!prof) return
    mutate((r) => {
      r.data = normalise(structuredClone(prof.data))
      r.title = `${prof.data.basics.name} – ${prof.data.basics.title}`
    })
    setProfChoice(prof.id)
    setSampleSuccess(`Loaded ${prof.label} sample profile!`)
    setTimeout(() => setSampleSuccess(''), 3500)
  }

  useEffect(() => {
    api.get(`/resumes/${id}`)
      .then((r) => {
        const tpl = TEMPLATES.find((t) => t.id === r.resume.template)
        if (tpl?.pro && !user?.is_pro) {
          r.resume.template = 'modern'
        }
        setResume({ ...r.resume, data: normalise(r.resume.data) })
      })
      .catch((e) => setErr(e.message))
  }, [id, user?.is_pro])

  // Autosave (debounced)
  useEffect(() => {
    if (!resume || !dirty.current) return
    setStatus('saving')
    const t = setTimeout(async () => {
      try {
        const { title, template, accent, font, data } = resume
        const r = await api.put(`/resumes/${id}`, { title, template, accent, font, data })
        dirty.current = false
        setResume((cur) => (cur ? { ...cur, ats_score: r.resume.ats_score } : cur))
        setStatus('saved')
      } catch (e) {
        setStatus('error')
        if (e.errors?.pro_required || e.status === 403) {
          setUpgradeOpen(true)
        }
        setErr(e.message)
      }
    }, 1000)
    return () => clearTimeout(t)
  }, [resume, id])

  useEffect(() => {
    if (!paneRef.current) return
    const ro = new ResizeObserver(([e]) => setPaneW(e.contentRect.width))
    ro.observe(paneRef.current)
    return () => ro.disconnect()
  }, [resume === null])

  const mutate = useCallback((fn) => {
    dirty.current = true
    setResume((r) => { const n = structuredClone(r); fn(n); return n })
  }, [])

  const onTemplateChange = (newTplId) => {
    const tpl = TEMPLATES.find((t) => t.id === newTplId)
    if (!tpl) return
    if (tpl.pro && !user?.is_pro) {
      setTargetTplName(tpl.name)
      setUpgradeOpen(true)
      return
    }
    mutate((r) => { r.template = newTplId })
  }

  const handleDownloadPdf = () => {
    setPdfPreviewOpen(true)
  }

  const setBasic = (k, v) => mutate((r) => { r.data.basics[k] = v })
  const list = (key, blank) => ({
    add: () => mutate((r) => { r.data[key].push({ id: uid(key[0]), ...blank }) }),
    set: (i, k, v) => mutate((r) => { r.data[key][i][k] = v }),
    del: (i) => mutate((r) => { r.data[key].splice(i, 1) }),
    move: (i, d) => mutate((r) => { const a = r.data[key]; const j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]] }),
  })
  const exp = list('experience', { role: '', company: '', location: '', start: '', end: '', current: false, bullets: [''] })
  const edu = list('education', { school: '', degree: '', field: '', start: '', end: '', details: '' })
  const proj = list('projects', { name: '', link: '', description: '' })
  const cert = list('certifications', { name: '', issuer: '', year: '' })

  if (err && !resume) return <div className="empty"><p>{err}</p><Link to="/dashboard" className="btn" style={{ marginTop: 16 }}>Back to dashboard</Link></div>
  if (!resume) return <div className="empty">Loading your resume…</div>

  const d = resume.data
  const isEmpty = !d.basics.name && d.experience.length === 0 && d.skills.length === 0

  const loadSample = () => mutate((r) => {
    const s = structuredClone(SAMPLE)
    s.basics.name = r.data.basics.name || s.basics.name
    r.data = normalise(s)
  })

  const ask = async (key, payload, apply) => {
    setSug({ key, loading: true, items: [], apply })
    try {
      const r = await api.post('/ai/suggest', payload)
      setSug({ key, loading: false, items: r.suggestions, apply, note: r.source === 'smart-template' ? 'Tip: replace the [X] placeholders with your real numbers.' : '' })
    } catch (e) { setSug({ key, loading: false, items: [], apply, note: e.message }) }
  }
  const role = d.basics.title || d.experience[0]?.role || ''
  const yearsGuess = (() => {
    const ys = d.experience.map((e) => parseInt((e.start || '').match(/(19|20)\d{2}/)?.[0])).filter(Boolean)
    return ys.length ? new Date().getFullYear() - Math.min(...ys) : undefined
  })()

  const addSkill = (s) => {
    s = s.trim()
    if (s && !d.skills.some((x) => x.toLowerCase() === s.toLowerCase())) mutate((r) => { r.data.skills.push(s) })
    setSkillInput('')
  }
  const scale = Math.min(1, Math.max(0.3, (paneW - 56) / 794))

  return (
    <div>
      <div className="builder-top">
        <Link to="/dashboard" className="btn btn-icon btn-ghost" title="Back"><ArrowLeft size={18} /></Link>
        <input aria-label="Resume title" className="input" style={{ maxWidth: 200, fontWeight: 600 }} value={resume.title} onChange={(e) => mutate((r) => { r.title = e.target.value })} />

        <select
          aria-label="Template"
          className="select"
          style={{ width: 175 }}
          value={resume.template}
          onChange={(e) => {
            const next = e.target.value
            const tpl = TEMPLATES.find((t) => t.id === next)
            if (tpl?.pro && !user?.is_pro) {
              e.target.value = resume.template
              setTargetTplName(tpl.name)
              setUpgradeOpen(true)
              return
            }
            mutate((r) => { r.template = next })
          }}
        >
          <optgroup label="Free Templates (3)">
            {TEMPLATES.filter((t) => !t.pro).map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} (Free)
              </option>
            ))}
          </optgroup>
          <optgroup label={`Pro Templates (${TEMPLATES.filter((t) => t.pro).length})`}>
            {TEMPLATES.filter((t) => t.pro).map((t) => (
              <option key={t.id} value={t.id} disabled={!user?.is_pro}>
                {!user?.is_pro ? `🔒 ${t.name} (PRO Only)` : `⭐ ${t.name} (PRO)`}
              </option>
            ))}
          </optgroup>
        </select>

        <button
          className="btn btn-sm btn-ghost row"
          style={{ padding: '6px 10px', gap: 6 }}
          onClick={() => setTemplateModalOpen(true)}
          title={`Browse all ${TEMPLATES.length} templates visually`}
        >
          <LayoutTemplate size={14} /> Templates ({TEMPLATES.length})
        </button>

        <select aria-label="Font" className="select" style={{ width: 110 }} value={resume.font} onChange={(e) => mutate((r) => { r.font = e.target.value })}>
          {Object.entries(FONTS).map(([k, f]) => <option key={k} value={k}>{f.label}</option>)}
        </select>

        <div className="swatches" style={{ marginLeft: 2 }}>
          {ACCENTS.map((c) => <button key={c} aria-label={`Accent ${c}`} className={`swatch ${resume.accent === c ? 'on' : ''}`} style={{ background: c }} onClick={() => mutate((r) => { r.accent = c })} />)}
        </div>

        <span className="spacer" />

        {user?.is_admin && (
          <Link
            to="/admin"
            id="builder-admin-link"
            className="btn btn-sm row"
            style={{ gap: 4, background: '#ede9fe', color: '#6d28d9', border: '1px solid #ddd6fe', fontWeight: 600, fontSize: '0.75rem', padding: '3px 8px' }}
            title="Open Administrator Console"
          >
            <Shield size={12} /> Admin
          </Link>
        )}

        {user?.is_pro ? (
          <button className="badge-pro" onClick={() => setUpgradeOpen(true)} title="Pro Account Active (Click to manage)">
            <Crown size={12} /> PRO ({TEMPLATES.length} Templates)
          </button>
        ) : user?.is_trial ? (
          <button
            className="badge row"
            style={{ background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', fontSize: '0.75rem', padding: '4px 8px', borderRadius: 6, fontWeight: 600, gap: 4, cursor: 'pointer' }}
            onClick={() => setUpgradeOpen(true)}
            title="1-Month Free Trial active. Click to view Pro options"
          >
            <Clock size={12} /> Trial ({user.trial_days_left}d)
          </button>
        ) : user?.is_trial_expired ? (
          <button
            className="badge row"
            style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', fontSize: '0.75rem', padding: '4px 8px', borderRadius: 6, fontWeight: 700, gap: 4, cursor: 'pointer' }}
            onClick={() => setUpgradeOpen(true)}
            title="Your 1-Month Trial has expired! Upgrade to Pro via Razorpay"
          >
            <AlertTriangle size={12} /> Trial Expired (Upgrade)
          </button>
        ) : (
          <div className="row" style={{ gap: 6 }}>
            <span className="badge badge-free" style={{ fontSize: '0.74rem', padding: '3px 8px', borderRadius: 6, background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' }}>
              Free Plan (3 Templates)
            </span>
            <button className="badge-pro" onClick={() => setUpgradeOpen(true)} title={`Unlock all ${TEMPLATES.length} templates`}>
              <Crown size={12} /> Upgrade to Pro
            </button>
          </div>
        )}

        {resume.ats_score != null && (
          <Link to="/tools/ats" state={{ resumeId: resume.id }} className={`score-pill ${tone(resume.ats_score)} row`} style={{ gap: 6 }} title="Run a full ATS check">
            <ScanSearch size={14} /> ATS {resume.ats_score}
          </Link>
        )}

        <span className="muted small row" style={{ gap: 6, minWidth: 70 }}>
          {status === 'saving' ? <><Loader2 size={14} className="spin" /> Saving</> : status === 'error' ? <span style={{ color: 'var(--bad)' }}>Not saved</span> : <><Check size={14} color="#10b981" /> Saved</>}
        </span>
        <button className="btn btn-icon mobile-switch" onClick={() => setView(view === 'edit' ? 'preview' : 'edit')}>{view === 'edit' ? <Eye size={16} /> : <Pencil size={16} />}</button>

        <button id="download-pdf" className="btn btn-primary row" style={{ gap: 6 }} onClick={handleDownloadPdf}>
          <Download size={16} /> Download PDF
        </button>
        <button className="btn btn-icon btn-ghost" onClick={() => window.print()} title="Print or save via browser print dialog">
          <Printer size={16} />
        </button>
      </div>

      <div className={`builder show-${view}`}>
        <div className="editor">
          {/* Quick-Pick Profession Sample Selector */}
          <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: 12, border: '1px solid var(--border)', marginBottom: 16 }}>
            <div className="row between" style={{ marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
              <div className="row" style={{ gap: 6, color: '#4338ca', fontWeight: 700, fontSize: '0.88rem' }}>
                <Sparkles size={16} /> <span>Resume Content Options:</span>
              </div>
              <div className="row" style={{ gap: 6 }}>
                <button
                  id="btn-clear-blank"
                  className="btn btn-sm btn-outline row"
                  style={{ fontSize: '0.76rem', padding: '3px 8px', gap: 4, color: '#b91c1c', borderColor: '#fca5a5', background: '#fff' }}
                  onClick={() => resetToBlank(true)}
                  title="Clear all content to edit custom resume from scratch"
                >
                  <Trash2 size={13} /> <span>Clear to Blank</span>
                </button>
                <button
                  id="btn-browse-professions"
                  className="btn btn-sm btn-ghost row"
                  style={{ fontSize: '0.76rem', padding: '3px 8px', gap: 4, color: '#4f46e5', background: '#eef2ff' }}
                  onClick={() => setProfModalOpen(true)}
                >
                  <span>Browse 12 Profiles</span>
                </button>
              </div>
            </div>

            {/* Quick-click Chips: Blank Custom Edit + Top Professions */}
            <div className="row wrap" style={{ gap: 6, marginBottom: 10 }}>
              <button
                id="btn-sample-blank"
                className={`btn btn-sm row ${profChoice === 'blank' || isEmpty ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.76rem', padding: '3px 9px', gap: 5, borderRadius: 6, fontWeight: 700, background: profChoice === 'blank' || isEmpty ? 'var(--brand)' : '#fff' }}
                onClick={() => resetToBlank(false)}
                title="Start with a blank canvas for custom editing without dummy content"
              >
                <span>✏️</span> <span>Blank (Custom Edit)</span>
              </button>
              {[
                { id: 'civil', icon: '🏗️', label: 'Civil Engineer' },
                { id: 'developer', icon: '💻', label: 'Developer' },
                { id: 'designer', icon: '🎨', label: 'UI/UX Designer' },
                { id: 'data_scientist', icon: '📊', label: 'Data Scientist' },
              ].map((qp) => (
                <button
                  key={qp.id}
                  id={`btn-sample-${qp.id}`}
                  className={`btn btn-sm row ${profChoice === qp.id ? 'btn-primary' : 'btn-outline'}`}
                  style={{ fontSize: '0.76rem', padding: '3px 8px', gap: 4, background: profChoice === qp.id ? 'var(--brand)' : '#ffffff', borderRadius: 6 }}
                  onClick={() => loadProfession(qp.id)}
                  title={`1-Click auto-fill ${qp.label} sample resume`}
                >
                  <span>{qp.icon}</span> <span>{qp.label}</span>
                </button>
              ))}
            </div>

            <select
              id="profession-sample-select"
              className="select"
              style={{ width: '100%', fontSize: '0.88rem', fontWeight: 500 }}
              value={profChoice}
              onChange={(e) => {
                const val = e.target.value
                if (val === 'blank') {
                  resetToBlank(false)
                } else if (val) {
                  loadProfession(val)
                }
              }}
            >
              <option value="" disabled>⚡ Choose dummy content or blank custom canvas...</option>
              <option value="blank">✏️ Blank Resume (Custom Edit — No Dummy Content)</option>
              <optgroup label="Dummy Content (12 Realistic Professions)">
                {PROFESSIONS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.icon} {p.label}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {sampleSuccess && (
            <div className="alert alert-info row" style={{ marginBottom: 14, background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }}>
              <CheckCircle2 size={16} color="#059669" />
              <span>{sampleSuccess}</span>
            </div>
          )}

          {isEmpty && (
            <div className="alert alert-info row between" style={{ marginBottom: 14, background: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1', padding: '10px 14px' }}>
              <div className="row" style={{ gap: 8 }}>
                <FileText size={18} color="#6366f1" />
                <span><strong>Custom Edit Mode:</strong> Blank canvas ready. Type your details into the sections below.</span>
              </div>
              <button className="btn btn-sm" style={{ fontSize: '0.76rem' }} onClick={() => setProfModalOpen(true)}>
                <Sparkles size={13} /> Need sample content?
              </button>
            </div>
          )}
          {err && <div className="alert alert-error" style={{ marginBottom: 14 }}>{err}</div>}

          <Accordion title="Personal details" icon={User} open={open === 'basics'} onToggle={() => setOpen(open === 'basics' ? '' : 'basics')}>
            <div className="field-row">
              <Field id="f-name" label="Full name" value={d.basics.name} onChange={(v) => setBasic('name', v)} />
              <Field id="f-title" label="Job title" value={d.basics.title} onChange={(v) => setBasic('title', v)} placeholder="e.g. Product Designer" />
            </div>
            <div className="field-row">
              <Field label="Email" value={d.basics.email} onChange={(v) => setBasic('email', v)} type="email" />
              <Field label="Phone" value={d.basics.phone} onChange={(v) => setBasic('phone', v)} />
            </div>
            <div className="field-row">
              <Field label="Location" value={d.basics.location} onChange={(v) => setBasic('location', v)} placeholder="City, Country" />
              <Field label="Website" value={d.basics.website} onChange={(v) => setBasic('website', v)} />
            </div>
            <Field label="LinkedIn" value={d.basics.linkedin} onChange={(v) => setBasic('linkedin', v)} placeholder="linkedin.com/in/you" />
          </Accordion>

          <Accordion title="Professional summary" icon={FileText} open={open === 'summary'} onToggle={() => setOpen(open === 'summary' ? '' : 'summary')}>
            <Field textarea value={d.basics.summary} onChange={(v) => setBasic('summary', v)} placeholder="2–3 sentences on who you are, what you do best and the impact you deliver." />
            <button className="btn btn-sm" onClick={() => ask('summary', { type: 'summary', role, years: yearsGuess, skills: d.skills, experience: d.experience.slice(0, 2) }, (s) => setBasic('summary', s))}>
              <Sparkles size={14} /> Write with AI
            </button>
            {sug?.key === 'summary' && <Suggestions state={sug} onClose={() => setSug(null)} onPick={(s) => { sug.apply(s); setSug(null) }} />}
          </Accordion>

          <Accordion title="Work experience" icon={Briefcase} open={open === 'exp'} onToggle={() => setOpen(open === 'exp' ? '' : 'exp')}>
            {d.experience.map((e, i) => (
              <div key={e.id} className="item-box">
                <div className="row" style={{ marginBottom: 10 }}>
                  <strong className="small muted">Position {i + 1}</strong><span className="spacer" />
                  <button className="btn btn-icon btn-ghost btn-sm" onClick={() => exp.move(i, -1)}><ArrowUp size={14} /></button>
                  <button className="btn btn-icon btn-ghost btn-sm" onClick={() => exp.move(i, 1)}><ArrowDown size={14} /></button>
                  <button className="btn btn-icon btn-ghost btn-sm btn-danger" onClick={() => exp.del(i)}><Trash2 size={14} /></button>
                </div>
                <div className="field-row">
                  <Field label="Job title" value={e.role} onChange={(v) => exp.set(i, 'role', v)} />
                  <Field label="Company" value={e.company} onChange={(v) => exp.set(i, 'company', v)} />
                </div>
                <div className="field-row">
                  <Field label="Start" value={e.start} onChange={(v) => exp.set(i, 'start', v)} placeholder="Jan 2021" />
                  <Field label="End" value={e.current ? 'Present' : e.end} onChange={(v) => exp.set(i, 'end', v)} placeholder="Dec 2023" />
                </div>
                <label className="row small muted" style={{ marginBottom: 12, cursor: 'pointer' }}>
                  <input type="checkbox" checked={!!e.current} onChange={(ev) => exp.set(i, 'current', ev.target.checked)} /> I currently work here
                </label>
                <Field label="Location" value={e.location} onChange={(v) => exp.set(i, 'location', v)} />
                <label className="label">Achievements</label>
                {(e.bullets || []).map((b, bi) => {
                  const key = `e${i}b${bi}`
                  return (
                    <div key={bi} style={{ marginBottom: 10 }}>
                      <textarea className="textarea" rows={2} style={{ minHeight: 60 }} value={b} placeholder="Led X that resulted in Y (use numbers!)"
                        onChange={(ev) => mutate((r) => { r.data.experience[i].bullets[bi] = ev.target.value })} />
                      <div className="row" style={{ marginTop: 6 }}>
                        <button className="btn btn-sm" disabled={!b.trim()} onClick={() => ask(key, { type: 'bullet', text: b, role: e.role }, (s) => mutate((r) => { r.data.experience[i].bullets[bi] = s }))}>
                          <Sparkles size={13} /> Improve
                        </button>
                        <button className="btn btn-sm btn-ghost btn-danger" onClick={() => mutate((r) => { r.data.experience[i].bullets.splice(bi, 1) })}><Trash2 size={13} /></button>
                      </div>
                      {sug?.key === key && <Suggestions state={sug} onClose={() => setSug(null)} onPick={(s) => { sug.apply(s); setSug(null) }} />}
                    </div>
                  )
                })}
                <button className="btn btn-sm" onClick={() => mutate((r) => { r.data.experience[i].bullets.push('') })}><Plus size={14} /> Add bullet</button>
              </div>
            ))}
            <button className="btn" style={{ width: '100%' }} onClick={exp.add}><Plus size={16} /> Add position</button>
          </Accordion>

          <Accordion title="Education" icon={GraduationCap} open={open === 'edu'} onToggle={() => setOpen(open === 'edu' ? '' : 'edu')}>
            {d.education.map((e, i) => (
              <div key={e.id} className="item-box">
                <div className="row" style={{ marginBottom: 10 }}><strong className="small muted">Education {i + 1}</strong><span className="spacer" />
                  <button className="btn btn-icon btn-ghost btn-sm btn-danger" onClick={() => edu.del(i)}><Trash2 size={14} /></button></div>
                <Field label="School" value={e.school} onChange={(v) => edu.set(i, 'school', v)} />
                <div className="field-row">
                  <Field label="Degree" value={e.degree} onChange={(v) => edu.set(i, 'degree', v)} />
                  <Field label="Field of study" value={e.field} onChange={(v) => edu.set(i, 'field', v)} />
                </div>
                <div className="field-row">
                  <Field label="Start" value={e.start} onChange={(v) => edu.set(i, 'start', v)} />
                  <Field label="End" value={e.end} onChange={(v) => edu.set(i, 'end', v)} />
                </div>
              </div>
            ))}
            <button className="btn" style={{ width: '100%' }} onClick={edu.add}><Plus size={16} /> Add education</button>
          </Accordion>

          <Accordion title="Skills" icon={Wrench} open={open === 'skills'} onToggle={() => setOpen(open === 'skills' ? '' : 'skills')}>
            <div className="row wrap" style={{ marginBottom: 12 }}>
              {d.skills.map((s, i) => (
                <span key={s + i} className="chip">{s}<button aria-label={`Remove ${s}`} onClick={() => mutate((r) => { r.data.skills.splice(i, 1) })}><X size={12} /></button></span>
              ))}
            </div>
            <div className="row">
              <input className="input" placeholder="Type a skill and press Enter" value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill(skillInput) } }} />
              <button className="btn" onClick={() => addSkill(skillInput)}>Add</button>
            </div>
            <button className="btn btn-sm" style={{ marginTop: 12 }} onClick={() => ask('skills', { type: 'skills', role, skills: d.skills }, addSkill)}>
              <Sparkles size={14} /> Suggest skills for {role || 'my role'}
            </button>
            {sug?.key === 'skills' && (
              <div className="suggest-box fade-in">
                {sug.loading ? <span className="small muted"><Loader2 size={14} className="spin" /> Thinking…</span> : (
                  <div className="row wrap">{sug.items.map((s) => <button key={s} className="chip action" onClick={() => addSkill(s)}><Plus size={12} />{s}</button>)}</div>
                )}
              </div>
            )}
          </Accordion>

          <Accordion title="Projects" icon={FolderGit2} open={open === 'proj'} onToggle={() => setOpen(open === 'proj' ? '' : 'proj')}>
            {d.projects.map((p, i) => (
              <div key={p.id} className="item-box">
                <div className="row" style={{ marginBottom: 10 }}><strong className="small muted">Project {i + 1}</strong><span className="spacer" />
                  <button className="btn btn-icon btn-ghost btn-sm btn-danger" onClick={() => proj.del(i)}><Trash2 size={14} /></button></div>
                <div className="field-row">
                  <Field label="Name" value={p.name} onChange={(v) => proj.set(i, 'name', v)} />
                  <Field label="Link" value={p.link} onChange={(v) => proj.set(i, 'link', v)} />
                </div>
                <Field label="Description" textarea value={p.description} onChange={(v) => proj.set(i, 'description', v)} />
              </div>
            ))}
            <button className="btn" style={{ width: '100%' }} onClick={proj.add}><Plus size={16} /> Add project</button>
          </Accordion>

          <Accordion title="Certifications" icon={Award} open={open === 'cert'} onToggle={() => setOpen(open === 'cert' ? '' : 'cert')}>
            {d.certifications.map((c, i) => (
              <div key={c.id} className="item-box">
                <div className="row" style={{ marginBottom: 10 }}><strong className="small muted">Certification {i + 1}</strong><span className="spacer" />
                  <button className="btn btn-icon btn-ghost btn-sm btn-danger" onClick={() => cert.del(i)}><Trash2 size={14} /></button></div>
                <Field label="Name" value={c.name} onChange={(v) => cert.set(i, 'name', v)} />
                <div className="field-row">
                  <Field label="Issuer" value={c.issuer} onChange={(v) => cert.set(i, 'issuer', v)} />
                  <Field label="Year" value={c.year} onChange={(v) => cert.set(i, 'year', v)} />
                </div>
              </div>
            ))}
            <button className="btn" style={{ width: '100%' }} onClick={cert.add}><Plus size={16} /> Add certification</button>
          </Accordion>
        </div>

        <div className="preview-pane" ref={paneRef}>
          <ScaledPaper width={794 * scale} printable style={{ boxShadow: '0 20px 50px -15px rgba(15,23,42,0.18)', borderRadius: 3, flex: 'none' }}>
            <ResumePaper
              data={d}
              template={resume.template}
              accent={resume.accent}
              font={resume.font}
              headerStyle={d.headerStyle || 'dark'}
            />
          </ScaledPaper>
        </div>
      </div>

      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} templateName={targetTplName} />
      <TemplatePickerModal
        open={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        currentTemplate={resume.template}
        resumeData={resume.data}
        accent={resume.accent}
        isPro={!!user?.is_pro}
        onSelect={(tplId) => mutate((r) => { r.template = tplId })}
        onUpgradeReq={(tplName) => {
          setTargetTplName(tplName)
          setUpgradeOpen(true)
        }}
      />
      <PdfPreviewModal
        open={pdfPreviewOpen}
        onClose={() => setPdfPreviewOpen(false)}
        resume={resume}
      />
      <ProfessionModal
        open={profModalOpen}
        onClose={() => setProfModalOpen(false)}
        onSelect={(pid) => {
          loadProfession(pid)
          setProfChoice(pid)
          setProfModalOpen(false)
        }}
      />
    </div>
  )
}

function TemplatePickerModal({ open, onClose, currentTemplate, resumeData, accent, onSelect, isPro, onUpgradeReq }) {
  const [tab, setTab] = useState('all')
  const [query, setQuery] = useState('')

  if (!open) return null

  const freeCount = TEMPLATES.filter((t) => !t.pro).length
  const proCount = TEMPLATES.filter((t) => t.pro).length

  const list = TEMPLATES.filter((t) => {
    if (tab === 'free' && t.pro) return false
    if (tab === 'pro' && !t.pro) return false
    if (query.trim()) {
      const q = query.toLowerCase()
      return t.name.toLowerCase().includes(q) || t.tag.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q)
    }
    return true
  })

  // Prepare balanced preview data: use candidate's actual text if available, fallback to SAMPLE for empty sections
  const previewData = {
    basics: {
      ...SAMPLE.basics,
      ...(resumeData?.basics?.name ? resumeData.basics : {}),
    },
    experience: resumeData?.experience?.length ? resumeData.experience : SAMPLE.experience,
    education: resumeData?.education?.length ? resumeData.education : SAMPLE.education,
    skills: resumeData?.skills?.length ? resumeData.skills : SAMPLE.skills,
    projects: resumeData?.projects?.length ? resumeData.projects : SAMPLE.projects,
    certifications: resumeData?.certifications?.length ? resumeData.certifications : SAMPLE.certifications,
  }

  return (
    <div className="modal-backdrop fade-in" onClick={onClose}>
      <div className="card modal-card" style={{ width: 'min(1100px, 96vw)', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <button className="btn btn-icon btn-ghost modal-close" onClick={onClose} aria-label="Close modal"><X size={18} /></button>
        <div style={{ marginBottom: 20 }}>
          <div className="row between" style={{ flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', marginBottom: 4 }}>Select a Resume Template</h2>
              <p className="muted small">Choose from {TEMPLATES.length} professional ATS-optimized templates ({freeCount} Free, {proCount} Pro) with live previews.</p>
            </div>
            <input
              type="text"
              className="input"
              style={{ width: 240, fontSize: '0.86rem' }}
              placeholder="🔍 Search templates..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="tabs" style={{ marginTop: 14 }}>
            <button className={`tab ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>All Templates ({TEMPLATES.length})</button>
            <button className={`tab ${tab === 'free' ? 'active' : ''}`} onClick={() => setTab('free')}>Free ({freeCount})</button>
            <button className={`tab ${tab === 'pro' ? 'active' : ''}`} onClick={() => setTab('pro')}>Pro Only ({proCount})</button>
          </div>
        </div>
        <div className="grid grid-3" style={{ gap: 16 }}>
          {list.map((t) => {
            const isCurrent = currentTemplate === t.id
            const locked = t.pro && !isPro
            return (
              <div
                key={t.id}
                className="card card-hover tpl-card"
                style={{
                  padding: 0,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  border: isCurrent ? '2px solid #6366f1' : '1px solid var(--border)',
                  background: isCurrent ? 'rgba(99,102,241,0.03)' : '#fff',
                  borderRadius: 12,
                  boxShadow: isCurrent ? '0 0 0 2px rgba(99,102,241,0.2)' : undefined,
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
              >
                {/* Visual Resume Template Preview */}
                <div
                  className="thumb"
                  style={{
                    height: 230,
                    background: '#f8fafc',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    padding: '14px 14px 0',
                    overflow: 'hidden',
                    position: 'relative',
                    cursor: 'pointer',
                    borderBottom: '1px solid #e2e8f0',
                  }}
                  onClick={() => {
                    if (isCurrent) return
                    if (locked) {
                      onClose()
                      onUpgradeReq(t.name)
                    } else {
                      onSelect(t.id)
                      onClose()
                    }
                  }}
                >
                  {/* Badge in top right corner */}
                  {t.pro ? (
                    <span className="badge-pro tpl-tag-badge" style={{ position: 'absolute', top: 10, right: 10, zIndex: 5, fontSize: '0.72rem', padding: '3px 8px' }}>
                      👑 PRO
                    </span>
                  ) : (
                    <span className="badge-free tpl-tag-badge" style={{ position: 'absolute', top: 10, right: 10, zIndex: 5, fontSize: '0.72rem', padding: '3px 8px' }}>
                      FREE
                    </span>
                  )}

                  {isCurrent && (
                    <span
                      style={{
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        zIndex: 5,
                        background: '#6366f1',
                        color: '#fff',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        boxShadow: '0 2px 6px rgba(99,102,241,0.3)',
                      }}
                    >
                      <Check size={12} /> Active
                    </span>
                  )}

                  <div className="thumb-inner" style={{ pointerEvents: 'none', userSelect: 'none', borderRadius: 4, overflow: 'hidden' }}>
                    <ScaledPaper width={230}>
                      <ResumePaper data={previewData} template={t.id} accent={accent || '#6366f1'} />
                    </ScaledPaper>
                  </div>

                  {/* Lock overlay if Pro template and user is not Pro */}
                  {locked && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(15, 23, 42, 0.28)',
                        backdropFilter: 'blur(2px)',
                        display: 'grid',
                        placeItems: 'center',
                        zIndex: 4,
                      }}
                    >
                      <span
                        className="badge-pro"
                        style={{
                          fontSize: '0.82rem',
                          padding: '6px 14px',
                          boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          background: 'linear-gradient(135deg, #7c3aed 0%, #d946ef 100%)',
                          color: '#fff',
                          border: 'none',
                        }}
                      >
                        <Lock size={14} /> Unlock with Pro
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Meta & Actions */}
                <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div className="row between" style={{ marginBottom: 4 }}>
                    <strong style={{ fontSize: '1.02rem', color: '#0f172a' }}>{t.name}</strong>
                    <span className="chip" style={{ fontSize: '0.74rem' }}>{t.tag}</span>
                  </div>
                  <p className="muted small" style={{ fontSize: '0.82rem', minHeight: 36, marginBottom: 12, lineHeight: 1.4 }}>
                    {t.desc}
                  </p>
                  <div style={{ marginTop: 'auto' }}>
                    {isCurrent ? (
                      <button className="btn btn-sm" disabled style={{ width: '100%', opacity: 0.85, background: '#f1f5f9', color: '#64748b' }}>
                        <Check size={14} /> Current Template
                      </button>
                    ) : locked ? (
                      <button
                        className="btn btn-sm btn-primary"
                        style={{ width: '100%', background: 'linear-gradient(135deg, #7c3aed 0%, #d946ef 100%)', gap: 6 }}
                        onClick={() => { onClose(); onUpgradeReq(t.name) }}
                      >
                        <Lock size={13} /> Unlock with Pro
                      </button>
                    ) : (
                      <button
                        className="btn btn-sm btn-outline"
                        style={{ width: '100%' }}
                        onClick={() => { onSelect(t.id); onClose() }}
                      >
                        Use Template
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function PdfPreviewModal({ open, onClose, resume }) {
  const [zoom, setZoom] = useState(0.75)
  const [downloading, setDownloading] = useState(false)
  const [downloadSuccess, setDownloadSuccess] = useState(false)
  const [exportError, setExportError] = useState('')
  const previewRef = useRef(null)

  if (!open || !resume) return null

  const d = resume.data || {}
  const safeName = (d.basics?.name || resume.title || 'Resume').trim().replace(/[^a-zA-Z0-9_-]+/g, '_')
  const fileName = `${safeName}_Resume.pdf`

  const handlePrint = () => {
    window.print()
  }

  const handleDirectDownload = async () => {
    setDownloading(true)
    setExportError('')
    try {
      const paperEl = previewRef.current?.querySelector('.paper')
      if (!paperEl) throw new Error('Resume paper element not found in preview')

      const canvas = await html2canvas(paperEl, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      })

      const imgData = canvas.toDataURL('image/jpeg', 0.98)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const pdfWidth = pdf.internal.pageSize.getWidth() // 210 mm
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width // proportional height

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(fileName)

      setDownloadSuccess(true)
      setTimeout(() => setDownloadSuccess(false), 4500)
    } catch (e) {
      console.error('Direct PDF export error, falling back to print dialog', e)
      setExportError('Direct download encountered an issue. Opening standard print-to-PDF dialog...')
      setTimeout(() => window.print(), 1000)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="modal-backdrop fade-in" onClick={onClose} style={{ zIndex: 110, padding: 12 }}>
      <div
        className="card modal-card"
        style={{
          width: 'min(1100px, 98vw)',
          height: '94vh',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          borderRadius: 16
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="row between" style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', background: '#ffffff', flex: 'none' }}>
          <div className="row" style={{ gap: 12 }}>
            <span style={{ fontSize: '1.4rem' }}>📄</span>
            <div>
              <div className="row" style={{ gap: 8, alignItems: 'center' }}>
                <strong style={{ fontSize: '1.1rem' }}>PDF Preview & Export</strong>
                <span className="badge badge-free" style={{ fontSize: '0.72rem' }}>A4 Standard</span>
              </div>
              <div className="muted small">{resume.title} · {TEMPLATES.find((t) => t.id === resume.template)?.name || resume.template}</div>
            </div>
          </div>

          {/* Zoom controls */}
          <div className="row" style={{ gap: 4, background: '#f8fafc', padding: '3px 6px', borderRadius: 8, border: '1px solid var(--border)' }}>
            <button className={`btn btn-sm btn-ghost ${zoom === 0.5 ? 'btn-primary' : ''}`} style={{ padding: '4px 8px', fontSize: '0.78rem' }} onClick={() => setZoom(0.5)}>50%</button>
            <button className={`btn btn-sm btn-ghost ${zoom === 0.75 ? 'btn-primary' : ''}`} style={{ padding: '4px 8px', fontSize: '0.78rem' }} onClick={() => setZoom(0.75)}>75%</button>
            <button className={`btn btn-sm btn-ghost ${zoom === 1 ? 'btn-primary' : ''}`} style={{ padding: '4px 8px', fontSize: '0.78rem' }} onClick={() => setZoom(1)}>100%</button>
          </div>

          {/* Actions */}
          <div className="row" style={{ gap: 8 }}>
            <button
              id="modal-print-btn"
              className="btn btn-outline row"
              style={{ gap: 6 }}
              onClick={handlePrint}
              title="Print or choose 'Save as PDF' via browser for crisp vector PDF"
            >
              <Printer size={16} /> Print / Save as PDF
            </button>
            <button
              id="modal-direct-download-btn"
              className="btn btn-primary row"
              style={{ gap: 6 }}
              onClick={handleDirectDownload}
              disabled={downloading}
            >
              {downloading ? <Loader2 size={16} className="spin" /> : <Download size={16} />}
              {downloading ? 'Generating PDF…' : 'Download PDF'}
            </button>
            <button className="btn btn-icon btn-ghost" onClick={onClose} aria-label="Close modal">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Success toast */}
        {downloadSuccess && (
          <div className="alert alert-info row center" style={{ margin: '8px 20px 0', padding: '8px 16px', gap: 8, background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }}>
            <CheckCircle2 size={16} color="#059669" />
            <span>PDF downloaded successfully! Ready to submit or print.</span>
          </div>
        )}
        {exportError && (
          <div className="alert alert-error row center" style={{ margin: '8px 20px 0', padding: '8px 16px', gap: 8 }}>
            <AlertCircle size={16} />
            <span>{exportError}</span>
          </div>
        )}

        {/* Scrollable Preview Canvas */}
        <div
          style={{
            flex: 1,
            background: '#e2e8f0',
            overflow: 'auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            padding: '30px 16px',
          }}
        >
          <div
            ref={previewRef}
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
              boxShadow: '0 25px 60px -15px rgba(15,23,42,0.35)',
              borderRadius: 3,
              marginBottom: 40,
              background: '#ffffff',
            }}
          >
            <ResumePaper
              data={d}
              template={resume.template}
              accent={resume.accent}
              font={resume.font}
              headerStyle={d.headerStyle || 'dark'}
            />
          </div>
        </div>

        {/* Footer tip */}
        <div className="row between" style={{ padding: '10px 24px', background: '#f8fafc', borderTop: '1px solid var(--border)', fontSize: '0.8rem', color: '#64748b' }}>
          <div>💡 <strong>Quality Tip:</strong> Use <em>"Print / Save as PDF"</em> for 100% crisp, selectable vector text formatted to standard A4.</div>
          <div>Dimensions: 210mm × 297mm (A4 Portrait)</div>
        </div>
      </div>
    </div>
  )
}

function ProfessionModal({ open, onClose, onSelect }) {
  const [search, setSearch] = useState('')
  if (!open) return null

  const list = PROFESSIONS.filter((p) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      p.label.toLowerCase().includes(q) ||
      p.data.basics.title.toLowerCase().includes(q) ||
      p.data.skills.some((s) => s.toLowerCase().includes(q))
    )
  })

  return (
    <div className="modal-backdrop fade-in" onClick={onClose} style={{ zIndex: 105 }}>
      <div className="card modal-card" style={{ width: 'min(980px, 96vw)', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <button className="btn btn-icon btn-ghost modal-close" onClick={onClose} aria-label="Close modal"><X size={18} /></button>
        <div style={{ marginBottom: 20 }}>
          <div className="row between" style={{ flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', marginBottom: 4 }}>Select Profession Sample Content</h2>
              <p className="muted small">Load complete, ATS-proven sample content across 12 realistic professions with 1 click.</p>
            </div>
            <input
              type="text"
              className="input"
              style={{ width: 260, fontSize: '0.86rem' }}
              placeholder="🔍 Search profession or skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Option to start blank custom edit without any dummy content */}
        <div style={{ marginBottom: 20, padding: '14px 18px', background: '#f8fafc', borderRadius: 14, border: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <strong style={{ fontSize: '0.98rem', display: 'flex', alignItems: 'center', gap: 6, color: '#0f172a' }}>
              <span>✏️</span> Custom Edit (Start from Scratch)
            </strong>
            <p className="muted small" style={{ margin: '2px 0 0', fontSize: '0.82rem' }}>
              Clear all pre-filled dummy content and manually type your own custom details from a fresh blank canvas.
            </p>
          </div>
          <button
            id="modal-select-blank"
            className="btn btn-sm btn-outline row"
            style={{ fontWeight: 600, borderColor: '#6366f1', color: '#4f46e5', background: '#ffffff', padding: '6px 14px' }}
            onClick={() => onSelect('blank')}
          >
            <span>✏️ Start Blank (Custom Edit)</span>
          </button>
        </div>

        <div className="grid grid-3" style={{ gap: 16 }}>
          {list.map((p) => (
            <div key={p.id} className="card" style={{ padding: 16, border: '1px solid var(--border)', background: '#fff', display: 'flex', flexDirection: 'column' }}>
              <div className="row" style={{ gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: '1.4rem' }}>{p.icon}</span>
                <div>
                  <strong style={{ fontSize: '1.02rem', display: 'block' }}>{p.label}</strong>
                  <span className="muted small" style={{ fontSize: '0.78rem' }}>{p.data.basics.name}</span>
                </div>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#4338ca', fontWeight: 600, marginBottom: 8 }}>
                {p.data.basics.title}
              </div>
              <p className="muted small" style={{ fontSize: '0.8rem', minHeight: 46, marginBottom: 10, lineHeight: 1.4 }}>
                {p.data.basics.summary.slice(0, 105)}…
              </p>
              <div className="row wrap" style={{ gap: 4, marginBottom: 14 }}>
                {p.data.skills.slice(0, 4).map((s) => (
                  <span key={s} className="chip" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>{s}</span>
                ))}
                {p.data.skills.length > 4 && (
                  <span className="muted small" style={{ fontSize: '0.7rem' }}>+{p.data.skills.length - 4} more</span>
                )}
              </div>
              <div style={{ marginTop: 'auto' }}>
                <button
                  id={`select-prof-btn-${p.id}`}
                  className="btn btn-sm btn-primary"
                  style={{ width: '100%' }}
                  onClick={() => onSelect(p.id)}
                >
                  <Sparkles size={13} /> Load {p.label}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


