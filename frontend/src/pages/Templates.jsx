import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, Crown, Sparkles } from 'lucide-react'
import { api } from '../api'
import { useAuth } from '../auth'
import { ACCENTS, SAMPLE, TEMPLATES } from '../data'
import { ResumePaper, ScaledPaper } from '../components/ResumeTemplates'
import UpgradeModal from '../components/UpgradeModal'

export default function Templates() {
  const { user } = useAuth()
  const nav = useNavigate()
  const [busy, setBusy] = useState('')
  const [filter, setFilter] = useState('all') // 'all', 'free', 'pro'
  const [upgradeTarget, setUpgradeTarget] = useState(null)
  const [accents, setAccents] = useState(() => Object.fromEntries(TEMPLATES.map((t, i) => [t.id, ACCENTS[i % ACCENTS.length]])))

  const filtered = TEMPLATES.filter((t) => {
    if (filter === 'free') return !t.pro
    if (filter === 'pro') return t.pro
    return true
  })

  const use = async (t) => {
    if (t.pro && !user?.is_pro) {
      setUpgradeTarget(t.name)
      return
    }
    if (!user) return nav('/register', { state: { from: '/templates' } })
    setBusy(t.id)
    try {
      const r = await api.post('/resumes', { title: `${t.name} Resume`, template: t.id, accent: accents[t.id] })
      nav(`/builder/${r.resume.id}`)
    } catch (e) {
      if (e.errors?.pro_required || e.status === 403) {
        setUpgradeTarget(t.name)
      } else {
        alert(e.message)
      }
      setBusy('')
    }
  }

  return (
    <main className="page">
      <div className="container">
        <div className="section-head" style={{ marginBottom: 36 }}>
          <span className="eyebrow"><Sparkles size={14} /> Resume Gallery</span>
          <h1 className="page-title" style={{ marginTop: 12 }}>
            Choose a <span className="gradient-text">resume template</span>
          </h1>
          <p className="muted" style={{ marginTop: 10, maxWidth: 640, marginInline: 'auto' }}>
            {TEMPLATES.length} recruiter-approved layouts. Free accounts include 3 core ATS templates; upgrade to Pro to unlock all {TEMPLATES.length} designs, colors, and fonts.
          </p>

          <div className="tabs" style={{ marginTop: 24 }}>
            <button className={`tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
              All Templates ({TEMPLATES.length})
            </button>
            <button className={`tab ${filter === 'free' ? 'active' : ''}`} onClick={() => setFilter('free')}>
              Free ({TEMPLATES.filter((t) => !t.pro).length})
            </button>
            <button className={`tab ${filter === 'pro' ? 'active' : ''}`} onClick={() => setFilter('pro')}>
              Pro Only ({TEMPLATES.filter((t) => t.pro).length})
            </button>
          </div>
        </div>

        <div className="grid grid-3">
          {filtered.map((t) => (
            <div key={t.id} className="card card-hover tpl-card">
              {t.pro ? (
                <span className="badge-pro tpl-tag-badge">
                  <Crown size={11} /> PRO
                </span>
              ) : (
                <span className="badge-free tpl-tag-badge">FREE</span>
              )}

              <div className="thumb" style={{ height: 380 }}>
                <div className="thumb-inner">
                  <ScaledPaper width={290}><ResumePaper data={SAMPLE} template={t.id} accent={accents[t.id]} /></ScaledPaper>
                </div>
              </div>

              <div className="resume-meta stack" style={{ '--gap': '12px' }}>
                <div className="row">
                  <strong style={{ fontSize: '1.1rem' }}>{t.name}</strong>
                  <span className="spacer" />
                  <span className="chip">{t.tag}</span>
                </div>
                <p className="muted small">{t.desc}</p>
                <div className="swatches">
                  {ACCENTS.map((c) => (
                    <button key={c} aria-label={`Accent ${c}`} className={`swatch ${accents[t.id] === c ? 'on' : ''}`} style={{ background: c }} onClick={() => setAccents({ ...accents, [t.id]: c })} />
                  ))}
                </div>

                {t.pro && !user?.is_pro ? (
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', background: 'linear-gradient(135deg, #7c3aed 0%, #d946ef 100%)' }}
                    onClick={() => setUpgradeTarget(t.name)}
                  >
                    <Crown size={15} color="#fef08a" /> Unlock with Pro
                  </button>
                ) : (
                  <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => use(t)} disabled={!!busy}>
                    {busy === t.id && <Loader2 size={16} className="spin" />} Use this template
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <UpgradeModal
        open={!!upgradeTarget}
        templateName={upgradeTarget}
        onClose={() => setUpgradeTarget(null)}
      />
    </main>
  )
}
