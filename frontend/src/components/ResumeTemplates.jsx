import { useLayoutEffect, useRef, useState } from 'react'
import { FONTS } from '../data'

const dates = (e) => [e.start, e.current ? 'Present' : e.end].filter(Boolean).join(' – ')
const contacts = (b) => [b.email, b.phone, b.location, b.website, b.linkedin].filter(Boolean)
const some = (a) => Array.isArray(a) && a.length > 0
const eduLine = (e) => [e.degree, e.field].filter(Boolean).join(', ')
const bulletsOf = (e) => (e.bullets || []).filter((b) => b && b.trim())

function Bullets({ items, style }) {
  if (!items || !items.length) return null
  return <ul style={{ margin: '4px 0 0', paddingLeft: 18, ...style }}>{items.map((b, i) => <li key={i}>{b}</li>)}</ul>
}

function ProjectRow({ p, accent, style, nameStyle, dateStyle, descStyle }) {
  return (
    <div key={p.id} className="proj-item" style={{ marginBottom: 11, ...style }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
        <strong style={{ fontSize: 13, color: '#0f172a', ...nameStyle }}>{p.name}</strong>
        {(p.period || p.date) && (
          <span className="muted" style={{ fontSize: 12, whiteSpace: 'nowrap', fontWeight: 500, color: '#64748b', ...dateStyle }}>
            {p.period || p.date}
          </span>
        )}
      </div>
      {p.link && <div style={{ fontSize: 11, color: accent, marginBottom: 2 }}>{p.link}</div>}
      {p.description && <div style={{ fontSize: 12, marginTop: 2, lineHeight: 1.45, color: '#334155', ...descStyle }}>{p.description}</div>}
    </div>
  )
}

const eduDates = (e) => [e.start, e.current ? 'Present' : e.end].filter(Boolean).join(' – ') || e.year || ''

function EduRow({ e, accent, style, align = 'left', isDark = false }) {
  const dates = eduDates(e)
  const line = eduLine(e)
  const sub = [line, e.details].filter(Boolean).join(' · ')
  const textColor = isDark ? '#ffffff' : '#0f172a'
  const subColor = isDark ? 'rgba(255,255,255,.82)' : '#475569'
  const dateColor = isDark ? 'rgba(255,255,255,.75)' : '#64748b'

  if (align === 'center') {
    return (
      <div key={e.id} className="edu-item" style={{ textAlign: 'center', marginBottom: 8, ...style }}>
        <strong style={{ fontSize: 13, color: textColor }}>{e.school}</strong>
        {(sub || dates) && (
          <div style={{ fontSize: 12, color: subColor, marginTop: 1 }}>
            {[sub, dates].filter(Boolean).join('  ·  ')}
          </div>
        )}
      </div>
    )
  }

  return (
    <div key={e.id} className="edu-item" style={{ marginBottom: 8, ...style }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
        <strong style={{ fontSize: 13, color: textColor }}>{e.school}</strong>
        {dates && (
          <span className="muted" style={{ fontSize: 12, whiteSpace: 'nowrap', fontWeight: 500, color: dateColor }}>
            {dates}
          </span>
        )}
      </div>
      {sub && <div style={{ fontSize: 12, color: subColor, marginTop: 1 }}>{sub}</div>}
    </div>
  )
}

/* =====================================================================
   1. Aurora (Modern · Sidebar) - FREE
   ===================================================================== */
function Modern({ d, accent, isWhiteText }) {
  const b = d.basics || {}
  const H = ({ children, style }) => (
    <h3 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700, color: accent, borderBottom: `2px solid ${accent}22`, paddingBottom: 4, margin: '22px 0 10px', ...style }}>{children}</h3>
  )
  const SH = ({ children }) => (
    <h3 style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700, margin: '24px 0 10px', color: '#ffffff', opacity: 0.95, borderBottom: '1px solid rgba(255,255,255,.3)', paddingBottom: 4 }}>{children}</h3>
  )
  return (
    <div className="paper-body" style={{ display: 'flex', flexDirection: 'row', minHeight: 1123, height: 1123, overflow: 'hidden', background: `linear-gradient(to right, ${accent} 250px, transparent 250px)` }}>
      <aside style={{ width: 250, minWidth: 250, maxWidth: 250, flexShrink: 0, boxSizing: 'border-box', color: '#fff', padding: '44px 24px', fontSize: 12 }}>
        {!b.isPage2 ? (
          <>
            <div style={{ width: 84, height: 84, borderRadius: '50%', background: 'rgba(255,255,255,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 700, marginBottom: 6 }}>
              {(b.name || 'U').trim().charAt(0).toUpperCase()}
            </div>
            <SH>Contact</SH>
            {contacts(b).map((c, i) => <div key={i} style={{ marginBottom: 6, wordBreak: 'break-word', color: '#ffffff' }}>{c}</div>)}
          </>
        ) : null}
        {some(d.skills) && <><SH>{b.isPage2 ? 'Skills (Cont.)' : 'Skills'}</SH>{d.skills.map((s, i) => <div key={i} style={{ marginBottom: 5, color: '#ffffff' }}>▪ {s}</div>)}</>}
        {some(d.education) && <><SH>Education</SH>{d.education.map((e) => (
          <div key={e.id} style={{ marginBottom: 10, color: '#ffffff' }}><strong>{e.school}</strong><div>{eduLine(e)}</div><div style={{ opacity: 0.85 }}>{[e.start, e.end].filter(Boolean).join(' – ')}</div></div>
        ))}</>}
        {some(d.certifications) && <><SH>Certifications</SH>{d.certifications.map((c) => (
          <div key={c.id} style={{ marginBottom: 8, color: '#ffffff' }}><strong>{c.name}</strong><div style={{ opacity: 0.85 }}>{[c.issuer, c.year].filter(Boolean).join(' · ')}</div></div>
        ))}</>}
      </aside>
      <main style={{ flex: 1, minWidth: 0, boxSizing: 'border-box', padding: '44px 38px 44px 34px' }}>
        {b.isPage2 ? (
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{b.pageNum || 2}</span>
          </div>
        ) : (
          <>
            <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.1, wordBreak: 'break-word' }}>{b.name || 'Your Name'}</h1>
            <div style={{ fontSize: 15, color: accent, fontWeight: 600, marginTop: 4 }}>{b.title}</div>
            {b.summary && <><H>Profile</H><p>{b.summary}</p></>}
          </>
        )}
        {some(d.experience) && (
          <>
            <H style={b.isPage2 ? { marginTop: 0 } : {}}>{b.isPage2 ? 'Experience (Cont.)' : 'Experience'}</H>
            {d.experience.map((e) => (
              <div key={e.id} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><strong style={{ fontSize: 14 }}>{e.role}</strong><span className="muted" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{dates(e)}</span></div>
                <div style={{ color: accent, fontWeight: 600 }}>{[e.company, e.location].filter(Boolean).join(' · ')}</div>
                <Bullets items={bulletsOf(e)} />
              </div>
            ))}
          </>
        )}
        {some(d.projects) && (
          <>
            <H style={b.isPage2 && !some(d.experience) ? { marginTop: 0 } : {}}>Projects</H>
            {d.projects.map((p) => (
              <ProjectRow key={p.id} p={p} accent={accent} />
            ))}
          </>
        )}
      </main>
    </div>
  )
}

/* =====================================================================
   2. Heritage (Classic · Serif) - FREE
   ===================================================================== */
function Classic({ d, accent }) {
  const b = d.basics || {}
  const H = ({ children, style }) => (
    <h3 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 700, borderBottom: `1.5px solid ${accent}`, color: accent, paddingBottom: 3, margin: '20px 0 10px', ...style }}>{children}</h3>
  )
  return (
    <div className="paper-body" style={{ padding: '52px 56px', minHeight: 1123, height: 1123, overflow: 'hidden' }}>
      <div style={{ textAlign: b.isPage2 ? 'right' : 'center', marginBottom: b.isPage2 ? 12 : 0 }}>
        {b.isPage2 ? (
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{b.pageNum || 2}</span>
        ) : (
          <>
            <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: 1 }}>{b.name || 'Your Name'}</h1>
            {b.title && <div style={{ fontSize: 14, fontStyle: 'italic', margin: '3px 0 6px', color: accent }}>{b.title}</div>}
            <div className="muted" style={{ fontSize: 12 }}>{contacts(b).join('  •  ')}</div>
          </>
        )}
      </div>
      {b.summary && <><H>Summary</H><p>{b.summary}</p></>}
      {some(d.experience) && <><H style={b.isPage2 ? { marginTop: 0 } : {}}>{b.isPage2 ? 'Experience (Cont.)' : 'Professional Experience'}</H>{d.experience.map((e) => (
        <div key={e.id} style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><strong>{e.company}{e.location && `, ${e.location}`}</strong><span className="muted" style={{ fontSize: 12 }}>{dates(e)}</span></div>
          <div style={{ fontStyle: 'italic', color: accent }}>{e.role}</div>
          <Bullets items={bulletsOf(e)} />
        </div>
      ))}</>}
      {some(d.education) && <><H>Education</H>{d.education.map((e) => (
        <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <div><strong>{e.school}</strong> — {eduLine(e)}{e.details && <div className="muted" style={{ fontSize: 12 }}>{e.details}</div>}</div>
          <span className="muted" style={{ fontSize: 12 }}>{[e.start, e.end].filter(Boolean).join(' – ')}</span>
        </div>
      ))}</>}
      {some(d.projects) && <><H style={b.isPage2 && !some(d.experience) ? { marginTop: 0 } : {}}>Projects</H>{d.projects.map((p) => <ProjectRow key={p.id} p={p} accent={accent} />)}</>}
      {some(d.skills) && <><H>Skills</H><p>{d.skills.join('  •  ')}</p></>}
      {some(d.certifications) && <><H>Certifications</H>{d.certifications.map((c) => <div key={c.id}>{c.name}{c.issuer && `, ${c.issuer}`}{c.year && ` (${c.year})`}</div>)}</>}
    </div>
  )
}

/* =====================================================================
   3. Whisper (Minimal · Clean) - FREE
   ===================================================================== */
function Minimal({ d, accent }) {
  const b = d.basics || {}
  const H = ({ children }) => (
    <h3 style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2.5, fontWeight: 700, color: accent, margin: '22px 0 8px' }}>{children}</h3>
  )
  return (
    <div className="paper-body" style={{ padding: '56px 60px' }}>
      {!b.isPage2 ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid rgba(150,150,150,.2)', paddingBottom: 18 }}>
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 300, letterSpacing: 2, textTransform: 'uppercase' }}>{b.name || 'Your Name'}</h1>
          <div style={{ fontSize: 13, color: accent, letterSpacing: 1.5, marginTop: 4 }}>{b.title}</div>
        </div>
        <div className="muted" style={{ textAlign: 'right', fontSize: 11, lineHeight: 1.6 }}>{contacts(b).map((c, i) => <div key={i}>{c}</div>)}</div>
      </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{b.pageNum || 2}</span>
        </div>
      )}
      {b.summary && <p style={{ margin: '18px 0' }}>{b.summary}</p>}
      {some(d.experience) && <><H>Experience</H>{d.experience.map((e) => (
        <div key={e.id} style={{ display: 'grid', gridTemplateColumns: '170px 1fr', gap: 16, marginBottom: 14 }}>
          <div style={{ fontSize: 12 }}>{dates(e)}<div style={{ color: accent, fontWeight: 600 }}>{e.company}</div></div>
          <div><strong style={{ fontSize: 13 }}>{e.role}</strong><Bullets items={bulletsOf(e)} /></div>
        </div>
      ))}</>}
      {some(d.education) && <><H>Education</H>{d.education.map((e) => (
        <div key={e.id} style={{ display: 'grid', gridTemplateColumns: '170px 1fr', gap: 16, marginBottom: 8 }}>
          <div style={{ fontSize: 12 }}>{[e.start, e.end].filter(Boolean).join(' – ')}</div>
          <div><strong>{e.school}</strong><div>{eduLine(e)}</div></div>
        </div>
      ))}</>}
      {some(d.skills) && <><H>Skills</H><p>{d.skills.join(', ')}</p></>}
      {some(d.projects) && <><H>Projects</H>{d.projects.map((p) => <ProjectRow key={p.id} p={p} accent={accent} />)}</>}
      {some(d.certifications) && <><H>Certifications</H>{d.certifications.map((c) => <div key={c.id}>{c.name} {c.year && `· ${c.year}`}</div>)}</>}
    </div>
  )
}

/* =====================================================================
   4. Summit (Executive Banner) - PRO
   ===================================================================== */
function Executive({ d, accent, headerStyle }) {
  const b = d.basics || {}
  const isLight = (headerStyle || d?.headerStyle) === 'light'
  const isDark = !isLight
  const H = ({ children }) => (
    <h3 style={{ fontSize: 12.5, textTransform: 'uppercase', letterSpacing: 1.8, fontWeight: 800, margin: '20px 0 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ width: 18, height: 4, background: accent, display: 'inline-block' }} />{children}
    </h3>
  )
  return (
    <div className="paper-body">
      {!b.isPage2 ? (
        <div style={{
        background: isDark ? '#14142b' : 'rgba(240, 243, 246, 0.8)',
        color: isDark ? '#ffffff' : '#0f172a',
        padding: '42px 48px 34px',
        borderBottom: isDark ? `6px solid ${accent}` : `3px solid ${accent}`
      }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: 0.5, color: isDark ? '#ffffff' : '#0f172a', margin: 0 }}>
          {b.name || 'Your Name'}
        </h1>
        <div style={{ fontSize: 15, color: isDark ? '#cbd5e1' : '#475569', marginTop: 6, fontWeight: 600 }}>{b.title}</div>
        <div style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#64748b', marginTop: 12 }}>{contacts(b).join('   |   ')}</div>
      </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{b.pageNum || 2}</span>
        </div>
      )}
      
      <div style={{ display: 'flex', flexDirection: 'row', gap: 30, padding: '16px 48px 44px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {b.summary && <><H>Executive Summary</H><p>{b.summary}</p></>}
          {some(d.experience) && <><H>Career History</H>{d.experience.map((e) => (
            <div key={e.id} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><strong style={{ fontSize: 14 }}>{e.role}</strong><span className="muted" style={{ fontSize: 12 }}>{dates(e)}</span></div>
              <div style={{ color: accent, fontWeight: 700 }}>{[e.company, e.location].filter(Boolean).join(' · ')}</div>
              <Bullets items={bulletsOf(e)} />
            </div>
          ))}</>}
          {some(d.projects) && <><H>Key Projects</H>{d.projects.map((p) => <ProjectRow key={p.id} p={p} accent={accent} />)}</>}
        </div>
        <div style={{ fontSize: 12, width: 220, minWidth: 220, flexShrink: 0 }}>
          {some(d.skills) && <><H>Expertise</H>{d.skills.map((s, i) => <div key={i} style={{ padding: '4px 0', borderBottom: '1px solid rgba(150,150,150,.15)' }}>{s}</div>)}</>}
          {some(d.education) && <><H>Education</H>{d.education.map((e) => <div key={e.id} style={{ marginBottom: 8 }}><strong>{e.school}</strong><div>{eduLine(e)}</div><div className="muted">{[e.start, e.end].filter(Boolean).join(' – ')}</div></div>)}</>}
          {some(d.certifications) && <><H>Certifications</H>{d.certifications.map((c) => <div key={c.id} style={{ marginBottom: 6 }}>{c.name}<div className="muted">{[c.issuer, c.year].filter(Boolean).join(' · ')}</div></div>)}</>}
        </div>
      </div>
    </div>
  )
}

/* =====================================================================
   5. Prism (Creative · Colour) - PRO
   ===================================================================== */
function Creative({ d, accent, headerStyle }) {
  const b = d.basics || {}
  const isLight = (headerStyle || d?.headerStyle) === 'light'
  const H = ({ children }) => (
    <h3 style={{ fontSize: 15, fontWeight: 800, color: accent, margin: '22px 0 8px' }}>{children}</h3>
  )
  return (
    <div className="paper-body" style={{ minHeight: 1123, height: 1123, overflow: 'hidden', boxSizing: 'border-box' }}>
      {!b.isPage2 ? (
        <div style={{
          background: isLight ? 'rgba(240, 243, 246, 0.9)' : `linear-gradient(120deg, ${accent}, ${accent}bb)`,
          color: isLight ? '#0f172a' : '#ffffff',
          padding: '38px 48px',
          display: 'flex',
          alignItems: 'center',
          gap: 24
        }}>
          <div style={{ width: 84, height: 84, borderRadius: 24, background: isLight ? accent : 'rgba(255,255,255,.25)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 36, fontWeight: 800, flex: 'none', transform: 'rotate(-6deg)' }}>
            {(b.name || 'U').trim().charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: isLight ? '#0f172a' : '#ffffff', margin: 0 }}>{b.name || 'Your Name'}</h1>
            <div style={{ fontSize: 15, color: isLight ? '#475569' : '#ffffff', opacity: 0.92, marginTop: 4 }}>{b.title}</div>
            <div style={{ fontSize: 12, color: isLight ? '#64748b' : '#ffffff', opacity: 0.85, marginTop: 8 }}>{contacts(b).join('  ·  ')}</div>
          </div>
        </div>
      ) : (
        <div style={{ padding: '24px 48px 0', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{b.pageNum || 2}</span>
        </div>
      )}
      <div style={{ padding: b.isPage2 ? '12px 48px 40px' : '16px 48px 40px' }}>
        {b.summary && <><H>Hello 👋</H><p>{b.summary}</p></>}
        {some(d.skills) && <><H>Toolbox</H><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{d.skills.map((s, i) => <span key={i} style={{ padding: '3px 11px', borderRadius: 99, background: `${accent}18`, color: accent, fontWeight: 600, fontSize: 12 }}>{s}</span>)}</div></>}
        {some(d.experience) && <><H style={b.isPage2 ? { marginTop: 0 } : {}}>{b.isPage2 ? 'Experience (Cont.)' : 'Experience'}</H>{d.experience.map((e) => (
          <div key={e.id} style={{ marginBottom: 14, paddingLeft: 14, borderLeft: `3px solid ${accent}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><strong style={{ fontSize: 14 }}>{e.role}</strong><span className="muted" style={{ fontSize: 12 }}>{dates(e)}</span></div>
            <div style={{ color: accent, fontWeight: 600 }}>{[e.company, e.location].filter(Boolean).join(' · ')}</div>
            <Bullets items={bulletsOf(e)} />
          </div>
        ))}</>}
        <div style={{ display: 'grid', gridTemplateColumns: some(d.education) && some(d.projects) ? '1fr 1fr' : '1fr', gap: 24 }}>
          {some(d.education) && <div><H>Education</H>{d.education.map((e) => <EduRow key={e.id} e={e} accent={accent} />)}</div>}
          {some(d.projects) && <div><H>Projects</H>{d.projects.map((p) => <ProjectRow key={p.id} p={p} accent={accent} />)}</div>}
        </div>
        {some(d.certifications) && <><H>Certifications</H>{d.certifications.map((c) => <div key={c.id}>{c.name} {c.issuer && `· ${c.issuer}`} {c.year && `· ${c.year}`}</div>)}</>}
      </div>
    </div>
  )
}

/* =====================================================================
   6. Syntax (Tech · Timeline) - PRO
   ===================================================================== */
function Tech({ d, accent }) {
  const b = d.basics || {}
  const H = ({ children }) => (
    <h3 style={{ fontSize: 12, fontFamily: "'Courier New', monospace", fontWeight: 700, color: accent, margin: '18px 0 8px', textTransform: 'lowercase' }}>
      <span style={{ opacity: 0.55 }}>// </span>{children}
    </h3>
  )
  return (
    <div className="paper-body" style={{ padding: '40px 44px', fontSize: 12.5 }}>
      {!b.isPage2 ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: `2px solid ${accent}`, paddingBottom: 12 }}>
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 800 }}>{b.name || 'Your Name'}</h1>
          <div style={{ fontFamily: "'Courier New', monospace", color: accent, fontWeight: 700 }}>&gt; {b.title}</div>
        </div>
        <div className="muted" style={{ textAlign: 'right', fontSize: 11.5 }}>{contacts(b).map((c, i) => <div key={i}>{c}</div>)}</div>
      </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{b.pageNum || 2}</span>
        </div>
      )}
      {b.summary && <><H>summary</H><p>{b.summary}</p></>}
      {some(d.skills) && <><H>stack</H><div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>{d.skills.map((s, i) => <span key={i} style={{ fontFamily: "'Courier New', monospace", fontSize: 11.5, padding: '2px 8px', border: `1px solid ${accent}66`, borderRadius: 4, background: `${accent}0d` }}>{s}</span>)}</div></>}
      {some(d.experience) && <><H>experience</H>{d.experience.map((e) => (
        <div key={e.id} style={{ display: 'grid', gridTemplateColumns: '14px 1fr', gap: 10, marginBottom: 12 }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 3, top: 5, width: 8, height: 8, borderRadius: '50%', background: accent }} />
            <span style={{ position: 'absolute', left: 6.5, top: 14, bottom: -12, width: 1, background: `${accent}55` }} />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><strong>{e.role} <span style={{ color: accent }}>@ {e.company}</span></strong><span className="muted" style={{ fontFamily: "'Courier New', monospace", fontSize: 11 }}>{dates(e)}</span></div>
            <Bullets items={bulletsOf(e)} />
          </div>
        </div>
      ))}</>}
      {some(d.projects) && <><H>projects</H>{d.projects.map((p) => <ProjectRow key={p.id} p={p} accent={accent} nameStyle={{ fontFamily: "'Courier New', monospace" }} />)}</>}
      {some(d.education) && <><H>education</H>{d.education.map((e) => <EduRow key={e.id} e={e} accent={accent} />)}</>}
      {some(d.certifications) && <><H>certifications</H>{d.certifications.map((c) => <div key={c.id}>{c.name} {c.issuer && `· ${c.issuer}`} {c.year && `· ${c.year}`}</div>)}</>}
    </div>
  )
}

/* =====================================================================
   7. Gridline (Metro · Swiss Modernist) - PRO
   ===================================================================== */
function Metro({ d, accent }) {
  const b = d.basics || {}
  const H = ({ num, children }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0 10px', borderBottom: '2px solid rgba(150,150,150,.3)', paddingBottom: 4 }}>
      <span style={{ fontSize: 11, fontWeight: 900, color: accent, letterSpacing: 1 }}>{num}</span>
      <h3 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 2, fontWeight: 900, margin: 0 }}>{children}</h3>
    </div>
  )
  return (
    <div className="paper-body" style={{ display: 'grid', gridTemplateColumns: '12px 1fr' }}>
      {!b.isPage2 ? (
        <div style={{ background: accent }} />
      ) : (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{b.pageNum || 2}</span>
        </div>
      )}
      
      <div style={{ padding: '48px 52px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '3px solid rgba(150,150,150,.4)', paddingBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: 36, fontWeight: 900, textTransform: 'uppercase', letterSpacing: -0.5, lineHeight: 1 }}>{b.name || 'Your Name'}</h1>
            <div style={{ fontSize: 14, fontWeight: 700, color: accent, letterSpacing: 2, textTransform: 'uppercase', marginTop: 6 }}>{b.title}</div>
          </div>
          <div className="muted" style={{ textAlign: 'right', fontSize: 11, lineHeight: 1.6 }}>{contacts(b).map((c, i) => <div key={i}>{c}</div>)}</div>
        </div>
        {b.summary && <><H num="01">Summary</H><p>{b.summary}</p></>}
        {some(d.experience) && <><H num="02">Professional Experience</H>{d.experience.map((e) => (
          <div key={e.id} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div><strong style={{ fontSize: 14 }}>{e.role}</strong> <span style={{ color: accent, fontWeight: 700 }}>/ {e.company}</span></div>
              <span className="muted" style={{ fontSize: 11, fontWeight: 600 }}>{dates(e)}</span>
            </div>
            {e.location && <div className="muted" style={{ fontSize: 11, marginBottom: 2 }}>{e.location}</div>}
            <Bullets items={bulletsOf(e)} />
          </div>
        ))}</>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
          {some(d.education) && <div><H num="03">Education</H>{d.education.map((e) => (
            <div key={e.id} style={{ marginBottom: 8 }}><strong>{e.school}</strong><div>{eduLine(e)}</div><div className="muted" style={{ fontSize: 11 }}>{[e.start, e.end].filter(Boolean).join(' – ')}</div></div>
          ))}</div>}
          {some(d.skills) && <div><H num="04">Skills & Tools</H><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{d.skills.map((s, i) => (
            <span key={i} style={{ padding: '3px 9px', background: `${accent}14`, border: `1px solid ${accent}44`, fontSize: 11, fontWeight: 600 }}>{s}</span>
          ))}</div></div>}
        </div>
        {some(d.projects) && <><H num="05">Key Projects</H>{d.projects.map((p) => <ProjectRow key={p.id} p={p} accent={accent} />)}</>}
      </div>
    </div>
  )
}

/* =====================================================================
   8. OnePager (Compact · Dense) - PRO
   ===================================================================== */
function Compact({ d, accent }) {
  const b = d.basics || {}
  const H = ({ children }) => (
    <h3 style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 800, borderBottom: `2px solid ${accent}`, paddingBottom: 2, margin: '14px 0 6px' }}>{children}</h3>
  )
  return (
    <div className="paper-body" style={{ padding: '36px 40px', fontSize: 12, lineHeight: 1.45 }}>
      {!b.isPage2 ? (
        <div style={{ borderBottom: '2px solid rgba(150,150,150,.3)', paddingBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{b.name || 'Your Name'}</h1>
          <div style={{ fontSize: 13, color: accent, fontWeight: 700, marginTop: 3 }}>{b.title}</div>
        </div>
        <div className="muted" style={{ textAlign: 'right', fontSize: 11 }}>
          <div>{[b.email, b.phone].filter(Boolean).join(' | ')}</div>
          <div>{[b.location, b.linkedin || b.website].filter(Boolean).join(' | ')}</div>
        </div>
      </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{b.pageNum || 2}</span>
        </div>
      )}
      
      <div style={{ display: 'flex', flexDirection: 'row', gap: 24, marginTop: 10 }}>
        <div style={{ width: 220, minWidth: 220, flexShrink: 0, borderRight: '1px solid rgba(150,150,150,.2)', paddingRight: 20 }}>
          {some(d.skills) && <><H>Core Skills</H><div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>{d.skills.map((s, i) => (
            <span key={i} style={{ padding: '2px 7px', background: `${accent}14`, color: accent, fontWeight: 700, fontSize: 11, borderRadius: 3 }}>{s}</span>
          ))}</div></>}
          {some(d.education) && <><H>Education</H>{d.education.map((e) => (
            <div key={e.id} style={{ marginBottom: 8 }}><strong style={{ fontSize: 11.5 }}>{e.school}</strong><div>{eduLine(e)}</div><div className="muted" style={{ fontSize: 10.5 }}>{[e.start, e.end].filter(Boolean).join(' – ')}</div></div>
          ))}</>}
          {some(d.certifications) && <><H>Certifications</H>{d.certifications.map((c) => <div key={c.id} style={{ marginBottom: 5 }}><strong>{c.name}</strong><div className="muted" style={{ fontSize: 10.5 }}>{[c.issuer, c.year].filter(Boolean).join(' · ')}</div></div>)}</>}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {b.summary && <><H>Professional Summary</H><p style={{ margin: 0 }}>{b.summary}</p></>}
          {some(d.experience) && <><H>Experience</H>{d.experience.map((e) => (
            <div key={e.id} style={{ marginBottom: 11 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <strong style={{ fontSize: 13 }}>{e.role} — <span style={{ color: accent }}>{e.company}</span></strong>
                <span className="muted" style={{ fontSize: 10.5 }}>{dates(e)}</span>
              </div>
              <Bullets items={bulletsOf(e)} style={{ margin: '2px 0 0', paddingLeft: 14 }} />
            </div>
          ))}</>}
          {some(d.projects) && <><H>Projects</H>{d.projects.map((p) => <div key={p.id} style={{ marginBottom: 5 }}><strong>{p.name}</strong>: {p.description}</div>)}</>}
        </div>
      </div>
    </div>
  )
}

/* =====================================================================
   9. Scholar (Academic · Formal) - PRO
   ===================================================================== */
function Academic({ d, accent }) {
  const b = d.basics || {}
  const H = ({ children }) => (
    <h3 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700, borderBottom: '1px solid rgba(150,150,150,.4)', paddingBottom: 2, margin: '22px 0 10px' }}>{children}</h3>
  )
  return (
    <div className="paper-body" style={{ padding: '54px 60px' }}>
      {!b.isPage2 ? (
        <div style={{ textAlign: 'center', borderBottom: '3px double rgba(150,150,150,.4)', paddingBottom: 16 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: 1.5, margin: 0 }}>{b.name || 'Your Name'}</h1>
        <div style={{ fontSize: 14, fontStyle: 'italic', color: accent, marginTop: 4 }}>{b.title}</div>
        <div className="muted" style={{ fontSize: 11.5, marginTop: 8 }}>{contacts(b).join('  ◆  ')}</div>
      </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{b.pageNum || 2}</span>
        </div>
      )}
      {b.summary && <><H>Curriculum Vitae Overview</H><p style={{ textAlign: 'justify', lineHeight: 1.6 }}>{b.summary}</p></>}
      {some(d.education) && <><H>Academic Background</H>{d.education.map((e) => (
        <EduRow key={e.id} e={e} accent={accent} />
      ))}</>}
      {some(d.experience) && <><H>Professional & Research Appointments</H>{d.experience.map((e) => (
        <div key={e.id} style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><strong>{e.role}</strong><span className="muted" style={{ fontSize: 11.5 }}>{dates(e)}</span></div>
          <div style={{ fontStyle: 'italic', color: accent }}>{e.company}{e.location && ` (${e.location})`}</div>
          <Bullets items={bulletsOf(e)} />
        </div>
      ))}</>}
      {some(d.projects) && <><H>Publications & Selected Projects</H>{d.projects.map((p) => <div key={p.id} style={{ marginBottom: 6 }}><strong>{p.name}</strong>. {p.description}</div>)}</>}
      {some(d.skills) && <><H>Areas of Expertise</H><p>{d.skills.join('  •  ')}</p></>}
    </div>
  )
}

/* =====================================================================
   10. Vogue (Elegant · Editorial Luxury) - PRO
   ===================================================================== */
function Elegant({ d, accent }) {
  const b = d.basics || {}
  const H = ({ children }) => (
    <h3 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 4, fontWeight: 600, color: accent, textAlign: 'center', margin: '24px 0 12px' }}>
      — {children} —
    </h3>
  )
  return (
    <div className="paper-body" style={{ padding: '60px 68px' }}>
      {!b.isPage2 ? (
        <div style={{ textAlign: 'center', borderBottom: '1px solid rgba(150,150,150,.2)', paddingBottom: 22 }}>
        <h1 style={{ fontSize: 38, fontWeight: 400, letterSpacing: 3, textTransform: 'uppercase', margin: 0 }}>{b.name || 'Your Name'}</h1>
        <div className="muted" style={{ fontSize: 13, fontStyle: 'italic', letterSpacing: 2, marginTop: 8 }}>{b.title}</div>
        <div style={{ width: 36, height: 1, background: accent, margin: '14px auto' }} />
        <div className="muted" style={{ fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase' }}>{contacts(b).join('   ·   ')}</div>
      </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{b.pageNum || 2}</span>
        </div>
      )}
      {b.summary && <><H>Profile</H><p style={{ textAlign: 'center', maxWidth: 540, margin: '0 auto', fontStyle: 'italic', lineHeight: 1.7 }}>{b.summary}</p></>}
      {some(d.experience) && <><H>Experience</H>{d.experience.map((e) => (
        <div key={e.id} style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <strong style={{ fontSize: 14, letterSpacing: 0.5 }}>{e.role}</strong>
            <span className="muted" style={{ fontSize: 11, fontStyle: 'italic' }}>{dates(e)}</span>
          </div>
          <div style={{ fontSize: 12.5, color: accent, fontStyle: 'italic', marginBottom: 4 }}>{e.company}{e.location && `, ${e.location}`}</div>
          <Bullets items={bulletsOf(e)} />
        </div>
      ))}</>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
        {some(d.education) && <div><H>Education</H>{d.education.map((e) => <EduRow key={e.id} e={e} accent={accent} />)}</div>}
        {some(d.skills) && <div><H>Core Competencies</H><div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, padding: '0 6px' }}>{d.skills.map((s, i) => <span key={i} style={{ padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, border: '1px solid rgba(150,150,150,.2)' }}>{s}</span>)}</div></div>}
      </div>
    </div>
  )
}

/* =====================================================================
   11. Beacon (Infographic · Visual) - PRO
   ===================================================================== */
function Infographic({ d, accent }) {
  const b = d.basics || {}
  const H = ({ children }) => (
    <h3 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 800, margin: '20px 0 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: accent }} />{children}
    </h3>
  )
  return (
    <div className="paper-body" style={{ padding: '44px 50px' }}>
      {!b.isPage2 ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: `${accent}0d`, padding: '24px 28px', borderRadius: 12, border: `1px solid ${accent}33`, marginBottom: 18 }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 900, margin: 0 }}>{b.name || 'Your Name'}</h1>
            <div style={{ fontSize: 14, fontWeight: 700, color: accent, marginTop: 4 }}>{b.title}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11, textAlign: 'right' }}>
            {contacts(b).map((c, i) => <span key={i} style={{ padding: '2px 8px', borderRadius: 99, background: 'rgba(255,255,255,.2)', border: '1px solid rgba(150,150,150,.2)' }}>{c}</span>)}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{b.pageNum || 2}</span>
        </div>
      )}
      {b.summary && <div style={{ background: `${accent}08`, padding: '14px 18px', borderRadius: 8, borderLeft: `4px solid ${accent}`, marginBottom: 16 }}><p style={{ margin: 0 }}>{b.summary}</p></div>}
      {some(d.experience) && <><H>{b.isPage2 ? 'Career Milestones (Cont.)' : 'Career Milestones'}</H>{d.experience.map((e) => (
        <div key={e.id} style={{ display: 'grid', gridTemplateColumns: '16px 1fr', gap: 12, marginBottom: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', border: `2px solid ${accent}`, background: 'transparent' }} />
            <span style={{ flex: 1, width: 2, background: `${accent}44`, marginTop: 4 }} />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><strong style={{ fontSize: 13.5 }}>{e.role} @ <span style={{ color: accent }}>{e.company}</span></strong><span className="muted" style={{ fontSize: 11, fontWeight: 600 }}>{dates(e)}</span></div>
            <Bullets items={bulletsOf(e)} />
          </div>
        </div>
      ))}</>}
      {some(d.education) && <><H>Education & Credentials</H>{d.education.map((e) => (
        <EduRow key={e.id} e={e} accent={accent} />
      ))}</>}
      {some(d.projects) && <><H>Key Projects</H>{d.projects.map((p) => <ProjectRow key={p.id} p={p} accent={accent} />)}</>}
      {some(d.skills) && <><H>Key Proficiencies</H><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{d.skills.map((s, i) => <span key={i} style={{ padding: '4px 10px', borderRadius: 99, background: accent, color: '#fff', fontSize: 11, fontWeight: 700 }}>{s}</span>)}</div></>}
    </div>
  )
}

/* =====================================================================
   12. Apex (Corporate · Enterprise) - PRO
   ===================================================================== */
function Corporate({ d, accent }) {
  const b = d.basics || {}
  const H = ({ children }) => (
    <h3 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 800, background: `${accent}15`, color: accent, padding: '6px 12px', borderRadius: 4, margin: '18px 0 10px' }}>{children}</h3>
  )
  return (
    <div className="paper-body" style={{ padding: '48px 52px' }}>
      {!b.isPage2 ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, borderBottom: `2px solid ${accent}`, paddingBottom: 18 }}>
          <div style={{ width: 68, height: 68, borderRadius: 8, background: accent, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 28, fontWeight: 900 }}>
            {(b.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 32, fontWeight: 900, margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>{b.name || 'Your Name'}</h1>
            <div style={{ fontSize: 14, fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: 1 }}>{b.title}</div>
          </div>
          <div className="muted" style={{ textAlign: 'right', fontSize: 11, lineHeight: 1.6 }}>{contacts(b).map((c, i) => <div key={i}>{c}</div>)}</div>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{b.pageNum || 2}</span>
        </div>
      )}
      {b.summary && <><H>Executive Summary</H><p style={{ padding: '0 6px' }}>{b.summary}</p></>}
      {some(d.experience) && <><H>Experience & Accomplishments</H>{d.experience.map((e) => (
        <div key={e.id} style={{ marginBottom: 12, padding: '0 6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <strong style={{ fontSize: 13.5 }}>{e.role}</strong>
            <span className="muted" style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, border: '1px solid rgba(150,150,150,.2)' }}>{dates(e)}</span>
          </div>
          <div style={{ color: accent, fontWeight: 700, fontSize: 12 }}>{e.company}{e.location && ` | ${e.location}`}</div>
          <Bullets items={bulletsOf(e)} />
        </div>
      ))}</>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {some(d.education) && <div><H>Education</H>{d.education.map((e) => <EduRow key={e.id} e={e} accent={accent} />)}</div>}
        {some(d.skills) && <div><H>Core Competencies</H><div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, padding: '0 6px' }}>{d.skills.map((s, i) => <span key={i} style={{ padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, border: '1px solid rgba(150,150,150,.2)' }}>{s}</span>)}</div></div>}
      </div>
    </div>
  )
}

/* =====================================================================
   13. Nordic (Airy · Minimalist) - PRO
   ===================================================================== */
function Nordic({ d, accent }) {
  const b = d.basics || {}
  const H = ({ children }) => (
    <h3 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 3, fontWeight: 700, color: accent, margin: '24px 0 10px', borderBottom: '1px solid rgba(150,150,150,.2)', paddingBottom: 4 }}>{children}</h3>
  )
  return (
    <div className="paper-body" style={{ padding: '52px 56px' }}>
      {!b.isPage2 ? (
        <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 34, fontWeight: 300, letterSpacing: 1 }}>{b.name || 'Your Name'}</h1>
        <div style={{ fontSize: 15, color: accent, fontWeight: 600, marginTop: 4 }}>{b.title}</div>
        <div className="muted" style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 12, marginTop: 12, borderTop: '1px solid rgba(150,150,150,.15)', paddingTop: 10 }}>
          {contacts(b).map((c, i) => <span key={i}>• {c}</span>)}
        </div>
      </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{b.pageNum || 2}</span>
        </div>
      )}
      {b.summary && <p style={{ fontSize: 13.5, lineHeight: 1.65 }}>{b.summary}</p>}
      {some(d.experience) && <><H>Experience</H>{d.experience.map((e) => (
        <div key={e.id} style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><strong style={{ fontSize: 14 }}>{e.role} — <span style={{ color: accent }}>{e.company}</span></strong><span className="muted" style={{ fontSize: 11.5 }}>{dates(e)}</span></div>
          <Bullets items={bulletsOf(e)} />
        </div>
      ))}</>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {some(d.education) && <div><H>Education</H>{d.education.map((e) => <EduRow key={e.id} e={e} accent={accent} />)}</div>}
        {some(d.skills) && <div><H>Expertise</H><div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>{d.skills.map((s, i) => <span key={i} style={{ padding: '2px 8px', borderRadius: 4, background: `${accent}14`, color: accent, fontSize: 11 }}>{s}</span>)}</div></div>}
      </div>
    </div>
  )
}

/* =====================================================================
   14. Silicon (Modern · Tech Startup) - PRO
   ===================================================================== */
function Silicon({ d, accent }) {
  const b = d.basics || {}
  const H = ({ children }) => (
    <h3 style={{ fontSize: 12.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: accent, margin: '20px 0 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: accent }} />{children}
    </h3>
  )
  return (
    <div className="paper-body" style={{ padding: '44px 48px' }}>
      {!b.isPage2 ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `3px solid ${accent}`, paddingBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 900, margin: 0 }}>{b.name || 'Your Name'}</h1>
          <div style={{ fontSize: 14, fontWeight: 700, color: accent, marginTop: 4 }}>{b.title}</div>
        </div>
        <div className="muted" style={{ textAlign: 'right', fontSize: 11.5 }}>{contacts(b).map((c, i) => <div key={i}>{c}</div>)}</div>
      </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{b.pageNum || 2}</span>
        </div>
      )}
      {b.summary && <div style={{ background: `${accent}0a`, padding: '12px 16px', borderRadius: 6, margin: '16px 0' }}><p style={{ margin: 0 }}>{b.summary}</p></div>}
      {some(d.experience) && <><H>Experience</H>{d.experience.map((e) => (
        <div key={e.id} style={{ marginBottom: 13 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><strong>{e.role} <span style={{ color: accent }}>@ {e.company}</span></strong><span className="muted" style={{ fontSize: 11.5 }}>{dates(e)}</span></div>
          <Bullets items={bulletsOf(e)} />
        </div>
      ))}</>}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 20 }}>
        {some(d.skills) && <div><H>Technologies</H><div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>{d.skills.map((s, i) => <span key={i} style={{ padding: '3px 8px', borderRadius: 4, background: `${accent}14`, color: accent, fontSize: 11, fontWeight: 700 }}>{s}</span>)}</div></div>}
        {some(d.education) && <div><H>Education</H>{d.education.map((e) => <EduRow key={e.id} e={e} accent={accent} />)}</div>}
      </div>
    </div>
  )
}

/* =====================================================================
   15. Cascade (Dual · Asymmetric Flow) - PRO
   ===================================================================== */
function Cascade({ d, accent }) {
  const b = d.basics || {}
  const H = ({ children }) => (
    <h3 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 2, fontWeight: 800, color: accent, borderBottom: `2px solid ${accent}`, paddingBottom: 3, margin: '18px 0 8px' }}>{children}</h3>
  )
  return (
    <div className="paper-body" style={{ padding: '44px 48px' }}>
      {!b.isPage2 ? (
        <div style={{ borderBottom: `4px solid ${accent}`, paddingBottom: 16, marginBottom: 16 }}>
        <h1 style={{ fontSize: 34, fontWeight: 900 }}>{b.name || 'Your Name'}</h1>
        <div style={{ fontSize: 15, fontWeight: 700, color: accent }}>{b.title}</div>
        <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>{contacts(b).join('  |  ')}</div>
      </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{b.pageNum || 2}</span>
        </div>
      )}
      
      <div style={{ display: 'flex', flexDirection: 'row', gap: 28 }}>
        <div style={{ width: 220, minWidth: 220, flexShrink: 0, borderRight: '1px solid rgba(150,150,150,.2)', paddingRight: 20 }}>
          {some(d.skills) && <><H>Competencies</H><div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>{d.skills.map((s, i) => <span key={i} style={{ padding: '2px 7px', borderRadius: 3, background: `${accent}14`, color: accent, fontSize: 11, fontWeight: 600 }}>{s}</span>)}</div></>}
          {some(d.education) && <><H>Education</H>{d.education.map((e) => <EduRow key={e.id} e={e} accent={accent} />)}</>}
          {some(d.certifications) && <><H>Certifications</H>{d.certifications.map((c) => <div key={c.id} style={{ marginBottom: 6 }}><strong>{c.name}</strong></div>)}</>}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {b.summary && <><H>Executive Summary</H><p>{b.summary}</p></>}
          {some(d.experience) && <><H>Professional Experience</H>{d.experience.map((e) => (
            <div key={e.id} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><strong>{e.role}</strong><span className="muted" style={{ fontSize: 11.5 }}>{dates(e)}</span></div>
              <div style={{ color: accent, fontWeight: 600 }}>{e.company}</div>
              <Bullets items={bulletsOf(e)} />
            </div>
          ))}</>}
          {some(d.projects) && <><H>Selected Projects</H>{d.projects.map((p) => <div key={p.id} style={{ marginBottom: 6 }}><strong>{p.name}</strong> — {p.description}</div>)}</>}
        </div>
      </div>
    </div>
  )
}

/* =====================================================================
   16. Zenith (Boxed · Modern Cards) - PRO
   ===================================================================== */
function Zenith({ d, accent }) {
  const b = d.basics || {}
  const H = ({ children }) => (
    <h3 style={{ fontSize: 12.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, color: accent, margin: '20px 0 10px' }}>{children}</h3>
  )
  return (
    <div className="paper-body" style={{ padding: '44px 48px' }}>
      {!b.isPage2 ? (
        <div style={{ textAlign: 'center', background: `${accent}10`, padding: '24px', borderRadius: 10, border: `1px solid ${accent}33`, marginBottom: 18 }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, margin: 0 }}>{b.name || 'Your Name'}</h1>
        <div style={{ fontSize: 14, fontWeight: 700, color: accent, marginTop: 4 }}>{b.title}</div>
        <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>{contacts(b).join('  •  ')}</div>
      </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{b.pageNum || 2}</span>
        </div>
      )}
      {b.summary && <p style={{ textAlign: 'center', maxWidth: 620, margin: '0 auto 16px' }}>{b.summary}</p>}
      {some(d.experience) && <><H>Experience</H>{d.experience.map((e) => (
        <div key={e.id} style={{ padding: '12px 16px', borderRadius: 8, border: '1px solid rgba(150,150,150,.25)', marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><strong>{e.role} — <span style={{ color: accent }}>{e.company}</span></strong><span className="muted" style={{ fontSize: 11.5 }}>{dates(e)}</span></div>
          <Bullets items={bulletsOf(e)} />
        </div>
      ))}</>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {some(d.education) && <div><H>Education</H>{d.education.map((e) => <EduRow key={e.id} e={e} accent={accent} />)}</div>}
        {some(d.skills) && <div><H>Skills</H><div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>{d.skills.map((s, i) => <span key={i} style={{ padding: '4px 9px', borderRadius: 6, background: `${accent}15`, color: accent, fontSize: 11, fontWeight: 600 }}>{s}</span>)}</div></div>}
      </div>
    </div>
  )
}

/* =====================================================================
   17. Nova (Accent · Rail Highlight) - PRO
   ===================================================================== */
function Nova({ d, accent }) {
  const b = d.basics || {}
  const H = ({ children }) => (
    <h3 style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, color: accent, margin: '20px 0 10px' }}>{children}</h3>
  )
  return (
    <div className="paper-body" style={{ display: 'grid', gridTemplateColumns: '8px 1fr' }}>
      {!b.isPage2 ? (
        <div style={{ background: accent }} />
      ) : (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{b.pageNum || 2}</span>
        </div>
      )}
      
      <div style={{ padding: '44px 48px' }}>
        <h1 style={{ fontSize: 34, fontWeight: 900 }}>{b.name || 'Your Name'}</h1>
        <div style={{ fontSize: 15, fontWeight: 700, color: accent }}>{b.title}</div>
        <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>{contacts(b).join('  |  ')}</div>
        {b.summary && <p style={{ marginTop: 14 }}>{b.summary}</p>}
        {some(d.experience) && <><H>Experience</H>{d.experience.map((e) => (
          <div key={e.id} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><strong>{e.role} <span style={{ color: accent }}>@ {e.company}</span></strong><span className="muted" style={{ fontSize: 11.5 }}>{dates(e)}</span></div>
            <Bullets items={bulletsOf(e)} />
          </div>
        ))}</>}
        {some(d.skills) && <><H>Core Skills</H><div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>{d.skills.map((s, i) => <span key={i} style={{ padding: '3px 8px', borderRadius: 4, background: `${accent}15`, color: accent, fontSize: 11, fontWeight: 600 }}>{s}</span>)}</div></>}
        {some(d.education) && <><H>Education</H>{d.education.map((e) => <EduRow key={e.id} e={e} accent={accent} />)}</>}
      </div>
    </div>
  )
}

/* =====================================================================
   18. Matrix (Data · Grid Focus) - PRO
   ===================================================================== */
function Matrix({ d, accent }) {
  const b = d.basics || {}
  const H = ({ children }) => (
    <h3 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 2, fontWeight: 900, color: accent, borderBottom: `2px solid ${accent}`, paddingBottom: 2, margin: '18px 0 8px' }}>{children}</h3>
  )
  return (
    <div className="paper-body" style={{ padding: '40px 44px' }}>
      {!b.isPage2 ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '2px solid rgba(150,150,150,.3)', paddingBottom: 12 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 900, margin: 0 }}>{b.name || 'Your Name'}</h1>
          <div style={{ fontSize: 14, fontWeight: 700, color: accent }}>{b.title}</div>
        </div>
        <div className="muted" style={{ textAlign: 'right', fontSize: 11 }}>{contacts(b).map((c, i) => <div key={i}>{c}</div>)}</div>
      </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{b.pageNum || 2}</span>
        </div>
      )}
      {b.summary && <p style={{ margin: '12px 0' }}>{b.summary}</p>}
      {some(d.skills) && <><H>Technical & Analytical Matrix</H><div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, margin: '8px 0' }}>{d.skills.map((s, i) => <div key={i} style={{ padding: '4px 6px', borderRadius: 4, border: '1px solid rgba(150,150,150,.2)', fontSize: 11, textAlign: 'center', fontWeight: 600 }}>{s}</div>)}</div></>}
      {some(d.experience) && <><H>Experience & Performance</H>{d.experience.map((e) => (
        <div key={e.id} style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><strong>{e.role} — <span style={{ color: accent }}>{e.company}</span></strong><span className="muted" style={{ fontSize: 11 }}>{dates(e)}</span></div>
          <Bullets items={bulletsOf(e)} />
        </div>
      ))}</>}
      {some(d.projects) && <><H>Key Quantitative Projects</H>{d.projects.map((p) => <div key={p.id} style={{ marginBottom: 5 }}><strong>{p.name}</strong>: {p.description}</div>)}</>}
      {some(d.education) && <><H>Education & Credentials</H>{d.education.map((e) => <EduRow key={e.id} e={e} accent={accent} />)}</>}
    </div>
  )
}

/* =====================================================================
   19. Horizon (Panoramic · Clean Dividers) - PRO
   ===================================================================== */
function Horizon({ d, accent }) {
  const b = d.basics || {}
  const H = ({ children }) => (
    <h3 style={{ fontSize: 12.5, textTransform: 'uppercase', letterSpacing: 2, fontWeight: 800, color: accent, margin: '20px 0 8px' }}>{children}</h3>
  )
  return (
    <div className="paper-body" style={{ padding: '44px 50px' }}>
      {!b.isPage2 ? (
        <div style={{ textAlign: 'center', borderBottom: `2px solid ${accent}`, paddingBottom: 16 }}>
        <h1 style={{ fontSize: 34, fontWeight: 900, margin: 0 }}>{b.name || 'Your Name'}</h1>
        <div style={{ fontSize: 14, fontWeight: 700, color: accent, marginTop: 4 }}>{b.title}</div>
        <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>{contacts(b).join('  ·  ')}</div>
      </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{b.pageNum || 2}</span>
        </div>
      )}
      {b.summary && <p style={{ textAlign: 'center', maxWidth: 600, margin: '14px auto 18px' }}>{b.summary}</p>}
      {some(d.experience) && <><H>Work History</H>{d.experience.map((e) => (
        <div key={e.id} style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><strong>{e.role} <span style={{ color: accent }}>| {e.company}</span></strong><span className="muted" style={{ fontSize: 11.5 }}>{dates(e)}</span></div>
          <Bullets items={bulletsOf(e)} />
        </div>
      ))}</>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {some(d.education) && <div><H>Education</H>{d.education.map((e) => <EduRow key={e.id} e={e} accent={accent} />)}</div>}
        {some(d.skills) && <div><H>Skills</H><div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>{d.skills.map((s, i) => <span key={i} style={{ padding: '3px 8px', borderRadius: 4, background: `${accent}14`, color: accent, fontSize: 11, fontWeight: 600 }}>{s}</span>)}</div></div>}
      </div>
    </div>
  )
}

/* =====================================================================
   20. Prestige (Gold · C-Suite) - PRO
   ===================================================================== */
function Prestige({ d, accent }) {
  const b = d.basics || {}
  const H = ({ children }) => (
    <h3 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700, color: accent, borderBottom: `1px solid ${accent}`, paddingBottom: 2, margin: '20px 0 10px' }}>{children}</h3>
  )
  return (
    <div className="paper-body" style={{ padding: '52px 56px' }}>
      {!b.isPage2 ? (
        <div style={{ borderBottom: `2px solid ${accent}`, paddingBottom: 16 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700 }}>{b.name || 'Your Name'}</h1>
        <div style={{ fontSize: 14, fontStyle: 'italic', color: accent }}>{b.title}</div>
        <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>{contacts(b).join('  ◆  ')}</div>
      </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{b.pageNum || 2}</span>
        </div>
      )}
      {b.summary && <p style={{ fontStyle: 'italic', margin: '14px 0' }}>{b.summary}</p>}
      {some(d.experience) && <><H>Executive Leadership & Experience</H>{d.experience.map((e) => (
        <div key={e.id} style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><strong>{e.role}</strong><span className="muted" style={{ fontSize: 12 }}>{dates(e)}</span></div>
          <div style={{ color: accent, fontWeight: 600 }}>{e.company}</div>
          <Bullets items={bulletsOf(e)} />
        </div>
      ))}</>}
      {some(d.skills) && <><H>Core Strengths</H><p>{d.skills.join('  •  ')}</p></>}
      {some(d.education) && <><H>Credentials</H>{d.education.map((e) => <EduRow key={e.id} e={e} accent={accent} />)}</>}
    </div>
  )
}

/* =====================================================================
   21. Artisan (Showcase · Visual Portfolio) - PRO
   ===================================================================== */
function Artisan({ d, accent }) {
  const b = d.basics || {}
  const H = ({ children }) => (
    <h3 style={{ fontSize: 13, fontWeight: 800, color: accent, margin: '18px 0 8px' }}>{children}</h3>
  )
  return (
    <div className="paper-body" style={{ padding: '44px 50px' }}>
      {!b.isPage2 ? (
        <div style={{ background: `${accent}14`, padding: '24px', borderRadius: 12, marginBottom: 16 }}>
        <h1 style={{ fontSize: 34, fontWeight: 900, margin: 0 }}>{b.name || 'Your Name'}</h1>
        <div style={{ fontSize: 15, fontWeight: 700, color: accent, marginTop: 4 }}>{b.title}</div>
        <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>{contacts(b).join('  ·  ')}</div>
      </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{b.pageNum || 2}</span>
        </div>
      )}
      {b.summary && <p>{b.summary}</p>}
      {some(d.projects) && <><H>Project Highlights</H><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>{d.projects.map((p) => (
        <div key={p.id} style={{ padding: '10px 14px', borderRadius: 8, border: `1px solid ${accent}33`, background: `${accent}08` }}>
          <strong>{p.name}</strong><p style={{ margin: '4px 0 0', fontSize: 11.5 }}>{p.description}</p>
        </div>
      ))}</div></>}
      {some(d.experience) && <><H>Career History</H>{d.experience.map((e) => (
        <div key={e.id} style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><strong>{e.role} @ {e.company}</strong><span className="muted" style={{ fontSize: 11.5 }}>{dates(e)}</span></div>
          <Bullets items={bulletsOf(e)} />
        </div>
      ))}</>}
      {some(d.skills) && <><H>Skills</H><div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>{d.skills.map((s, i) => <span key={i} style={{ padding: '3px 8px', borderRadius: 99, background: accent, color: '#fff', fontSize: 11, fontWeight: 600 }}>{s}</span>)}</div></>}
    </div>
  )
}

/* =====================================================================
   22. Catalyst (Impact · Results Driven) - PRO
   ===================================================================== */
function Catalyst({ d, accent }) {
  const b = d.basics || {}
  const H = ({ children }) => (
    <h3 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 800, color: accent, borderLeft: `4px solid ${accent}`, paddingLeft: 8, margin: '18px 0 8px' }}>{children}</h3>
  )
  return (
    <div className="paper-body" style={{ padding: '44px 48px' }}>
      {!b.isPage2 ? (
        <>
          <h1 style={{ fontSize: 32, fontWeight: 900 }}>{b.name || 'Your Name'}</h1>
      <div style={{ fontSize: 14, fontWeight: 700, color: accent }}>{b.title}</div>
      <div className="muted" style={{ fontSize: 12, margin: '6px 0 14px' }}>{contacts(b).join('  |  ')}</div>
        </>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{b.pageNum || 2}</span>
        </div>
      )}
      {b.summary && <div style={{ padding: '10px 14px', borderRadius: 6, border: '1px solid rgba(150,150,150,.2)', marginBottom: 14 }}><p style={{ margin: 0 }}>{b.summary}</p></div>}
      {some(d.experience) && <><H>Key Results & Impact</H>{d.experience.map((e) => (
        <div key={e.id} style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><strong>{e.role} — <span style={{ color: accent }}>{e.company}</span></strong><span className="muted" style={{ fontSize: 11.5 }}>{dates(e)}</span></div>
          <Bullets items={bulletsOf(e)} />
        </div>
      ))}</>}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 20 }}>
        {some(d.skills) && <div><H>Core Competencies</H><div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>{d.skills.map((s, i) => <span key={i} style={{ padding: '3px 8px', borderRadius: 4, background: `${accent}14`, color: accent, fontSize: 11, fontWeight: 700 }}>{s}</span>)}</div></div>}
        {some(d.education) && <div><H>Education</H>{d.education.map((e) => <EduRow key={e.id} e={e} accent={accent} />)}</div>}
      </div>
    </div>
  )
}

/* =====================================================================
   23. Vanguard (Dynamic · Angled Header) - PRO
   ===================================================================== */
function Vanguard({ d, accent }) {
  const b = d.basics || {}
  const H = ({ children }) => (
    <h3 style={{ fontSize: 12.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, color: accent, margin: '20px 0 10px' }}>{children}</h3>
  )
  return (
    <div className="paper-body" style={{ padding: '44px 48px' }}>
      {!b.isPage2 ? (
        <div style={{ borderLeft: `6px solid ${accent}`, paddingLeft: 16, marginBottom: 18 }}>
        <h1 style={{ fontSize: 34, fontWeight: 900, margin: 0 }}>{b.name || 'Your Name'}</h1>
        <div style={{ fontSize: 15, fontWeight: 700, color: accent }}>{b.title}</div>
        <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>{contacts(b).join('  •  ')}</div>
      </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{b.pageNum || 2}</span>
        </div>
      )}
      {b.summary && <p>{b.summary}</p>}
      {some(d.experience) && <><H>Experience Track</H>{d.experience.map((e) => (
        <div key={e.id} style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><strong>{e.role}</strong><span className="muted" style={{ fontSize: 11.5 }}>{dates(e)}</span></div>
          <div style={{ color: accent, fontWeight: 600 }}>{e.company}</div>
          <Bullets items={bulletsOf(e)} />
        </div>
      ))}</>}
      {some(d.skills) && <><H>Skills</H><div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>{d.skills.map((s, i) => <span key={i} style={{ padding: '3px 8px', borderRadius: 4, border: `1px solid ${accent}44`, fontSize: 11, fontWeight: 600 }}>{s}</span>)}</div></>}
      {some(d.education) && <><H>Education</H>{d.education.map((e) => <EduRow key={e.id} e={e} accent={accent} />)}</>}
    </div>
  )
}

/* =====================================================================
   24. Prime (Classic · Corporate Standard) - PRO
   ===================================================================== */
function Prime({ d, accent }) {
  const b = d.basics || {}
  const H = ({ children }) => (
    <h3 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 700, borderBottom: '1px solid rgba(150,150,150,.3)', paddingBottom: 2, margin: '18px 0 8px' }}>{children}</h3>
  )
  return (
    <div className="paper-body" style={{ padding: '48px 52px' }}>
      {!b.isPage2 ? (
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
        <h1 style={{ fontSize: 30, fontWeight: 800 }}>{b.name || 'Your Name'}</h1>
        <div style={{ fontSize: 14, color: accent, fontWeight: 600 }}>{b.title}</div>
        <div className="muted" style={{ fontSize: 11.5, marginTop: 6 }}>{contacts(b).join('  |  ')}</div>
      </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{b.pageNum || 2}</span>
        </div>
      )}
      {b.summary && <><H>Professional Profile</H><p>{b.summary}</p></>}
      {some(d.experience) && <><H>Work Experience</H>{d.experience.map((e) => (
        <div key={e.id} style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><strong>{e.role} — {e.company}</strong><span className="muted" style={{ fontSize: 11 }}>{dates(e)}</span></div>
          <Bullets items={bulletsOf(e)} />
        </div>
      ))}</>}
      {some(d.skills) && <><H>Core Skills</H><p>{d.skills.join('  •  ')}</p></>}
      {some(d.education) && <><H>Education</H>{d.education.map((e) => <EduRow key={e.id} e={e} accent={accent} />)}</>}
    </div>
  )
}

/* =====================================================================
   25. Frontier (Engineering · Blueprint) - PRO
   ===================================================================== */
function Frontier({ d, accent }) {
  const b = d.basics || {}
  const H = ({ children }) => (
    <h3 style={{ fontSize: 11.5, textTransform: 'uppercase', letterSpacing: 2, fontWeight: 800, color: accent, borderBottom: `2px solid ${accent}`, paddingBottom: 2, margin: '18px 0 8px' }}>
      [ {children} ]
    </h3>
  )
  return (
    <div className="paper-body" style={{ padding: '40px 44px', border: `1px solid ${accent}44`, margin: 16 }}>
      {!b.isPage2 ? (
        <div style={{ borderBottom: `2px solid ${accent}`, paddingBottom: 12 }}>
        <h1 style={{ fontSize: 30, fontWeight: 900 }}>{b.name || 'Your Name'}</h1>
        <div style={{ fontSize: 14, fontWeight: 700, color: accent }}>{b.title}</div>
        <div className="muted" style={{ fontSize: 11.5, marginTop: 6 }}>{contacts(b).join('  //  ')}</div>
      </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{b.pageNum || 2}</span>
        </div>
      )}
      {b.summary && <><H>Executive Summary</H><p>{b.summary}</p></>}
      {some(d.experience) && <><H>Engineering & Project History</H>{d.experience.map((e) => (
        <div key={e.id} style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><strong>{e.role} @ {e.company}</strong><span className="muted" style={{ fontSize: 11 }}>{dates(e)}</span></div>
          <Bullets items={bulletsOf(e)} />
        </div>
      ))}</>}
      {some(d.skills) && <><H>Technical Proficiencies</H><div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>{d.skills.map((s, i) => <span key={i} style={{ padding: '2px 8px', border: `1px solid ${accent}66`, fontSize: 11 }}>{s}</span>)}</div></>}
      {some(d.education) && <><H>Academic Qualifications</H>{d.education.map((e) => <EduRow key={e.id} e={e} accent={accent} />)}</>}
    </div>
  )
}

/* =====================================================================
   26. Odyssey (Milestone · Career Story) - PRO
   ===================================================================== */
function Odyssey({ d, accent }) {
  const b = d.basics || {}
  const H = ({ children }) => (
    <h3 style={{ fontSize: 12.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, color: accent, margin: '20px 0 10px' }}>{children}</h3>
  )
  return (
    <div className="paper-body" style={{ padding: '44px 50px' }}>
      {!b.isPage2 ? (
        <>
          <h1 style={{ fontSize: 32, fontWeight: 900 }}>{b.name || 'Your Name'}</h1>
      <div style={{ fontSize: 14, fontWeight: 600, color: accent }}>{b.title}</div>
      <div className="muted" style={{ fontSize: 12, margin: '6px 0 14px' }}>{contacts(b).join('  ·  ')}</div>
        </>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{b.pageNum || 2}</span>
        </div>
      )}
      {b.summary && <p>{b.summary}</p>}
      {some(d.experience) && <><H>Career Milestones</H>{d.experience.map((e, idx) => (
        <div key={e.id} style={{ display: 'grid', gridTemplateColumns: '28px 1fr', gap: 12, marginBottom: 12 }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: accent, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 800 }}>{idx + 1}</div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><strong>{e.role} — {e.company}</strong><span className="muted" style={{ fontSize: 11 }}>{dates(e)}</span></div>
            <Bullets items={bulletsOf(e)} />
          </div>
        </div>
      ))}</>}
      {some(d.skills) && <><H>Skills</H><p>{d.skills.join(', ')}</p></>}
      {some(d.education) && <><H>Education</H>{d.education.map((e) => <EduRow key={e.id} e={e} accent={accent} />)}</>}
    </div>
  )
}

/* =====================================================================
   27. Sovereign (Royal · Monogram Header) - PRO
   ===================================================================== */
function Sovereign({ d, accent }) {
  const b = d.basics || {}
  const H = ({ children }) => (
    <h3 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 2, fontWeight: 800, color: accent, textAlign: 'center', borderTop: `1px solid ${accent}`, borderBottom: `1px solid ${accent}`, padding: '4px 0', margin: '22px 0 10px' }}>{children}</h3>
  )
  return (
    <div className="paper-body" style={{ padding: '52px 56px' }}>
      {!b.isPage2 ? (
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', border: `2px solid ${accent}`, color: accent, display: 'grid', placeItems: 'center', margin: '0 auto 8px', fontSize: 24, fontWeight: 800 }}>{(b.name || 'U').charAt(0)}</div>
        <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0 }}>{b.name || 'Your Name'}</h1>
        <div style={{ fontSize: 14, fontStyle: 'italic', color: accent }}>{b.title}</div>
        <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>{contacts(b).join('  ◆  ')}</div>
      </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{b.pageNum || 2}</span>
        </div>
      )}
      {b.summary && <p style={{ textAlign: 'center', fontStyle: 'italic' }}>{b.summary}</p>}
      {some(d.experience) && <><H>Distinguished Experience</H>{d.experience.map((e) => (
        <div key={e.id} style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><strong>{e.role}</strong><span className="muted" style={{ fontSize: 11.5 }}>{dates(e)}</span></div>
          <div style={{ color: accent, fontWeight: 600 }}>{e.company}</div>
          <Bullets items={bulletsOf(e)} />
        </div>
      ))}</>}
      {some(d.skills) && <><H>Core Disciplines</H><p style={{ textAlign: 'center' }}>{d.skills.join('  •  ')}</p></>}
      {some(d.education) && <><H>Academic Background</H>{d.education.map((e) => <EduRow key={e.id} e={e} accent={accent} align="center" />)}</>}
    </div>
  )
}

/* =====================================================================
   28. Monarch (Framed · Editorial) - PRO
   ===================================================================== */
function Monarch({ d, accent }) {
  const b = d.basics || {}
  const H = ({ children }) => (
    <h3 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 2.5, fontWeight: 700, color: accent, textAlign: 'center', margin: '22px 0 10px' }}>• {children} •</h3>
  )
  return (
    <div className="paper-body" style={{ padding: '48px 52px', border: `3px double ${accent}88`, margin: 16 }}>
      {!b.isPage2 ? (
        <div style={{ textAlign: 'center', borderBottom: '1px solid rgba(150,150,150,.2)', paddingBottom: 16 }}>
        <h1 style={{ fontSize: 34, fontWeight: 400, letterSpacing: 2 }}>{b.name || 'Your Name'}</h1>
        <div style={{ fontSize: 14, fontStyle: 'italic', color: accent }}>{b.title}</div>
        <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>{contacts(b).join('   ·   ')}</div>
      </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{b.pageNum || 2}</span>
        </div>
      )}
      {b.summary && <p style={{ textAlign: 'center', margin: '14px 0' }}>{b.summary}</p>}
      {some(d.experience) && <><H>Professional Background</H>{d.experience.map((e) => (
        <div key={e.id} style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><strong>{e.role}</strong><span className="muted" style={{ fontSize: 11.5 }}>{dates(e)}</span></div>
          <div style={{ color: accent, fontStyle: 'italic' }}>{e.company}</div>
          <Bullets items={bulletsOf(e)} />
        </div>
      ))}</>}
      {some(d.education) && <><H>Education</H>{d.education.map((e) => <EduRow key={e.id} e={e} accent={accent} align="center" />)}</>}
      {some(d.skills) && <><H>Capabilities</H><p style={{ textAlign: 'center' }}>{d.skills.join('  ·  ')}</p></>}
    </div>
  )
}

/* =====================================================================
   29. Alpine (Modular · Boxed Grid) - PRO
   ===================================================================== */
function Alpine({ d, accent }) {
  const b = d.basics || {}
  const H = ({ children }) => (
    <h3 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 800, color: accent, margin: '16px 0 8px' }}>{children}</h3>
  )
  return (
    <div className="paper-body" style={{ padding: '40px 44px' }}>
      {!b.isPage2 ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `2px solid ${accent}`, paddingBottom: 12 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 900 }}>{b.name || 'Your Name'}</h1>
          <div style={{ fontSize: 14, fontWeight: 700, color: accent }}>{b.title}</div>
        </div>
        <div className="muted" style={{ textAlign: 'right', fontSize: 11.5 }}>{contacts(b).map((c, i) => <div key={i}>{c}</div>)}</div>
      </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{b.pageNum || 2}</span>
        </div>
      )}
      {b.summary && <div style={{ padding: '10px 14px', borderRadius: 6, border: '1px solid rgba(150,150,150,.2)', margin: '12px 0' }}><p style={{ margin: 0 }}>{b.summary}</p></div>}
      {some(d.experience) && <><H>Work Experience</H>{d.experience.map((e) => (
        <div key={e.id} style={{ padding: '10px 14px', borderRadius: 6, border: '1px solid rgba(150,150,150,.18)', marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><strong>{e.role} — <span style={{ color: accent }}>{e.company}</span></strong><span className="muted" style={{ fontSize: 11 }}>{dates(e)}</span></div>
          <Bullets items={bulletsOf(e)} />
        </div>
      ))}</>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {some(d.education) && <div><H>Education</H>{d.education.map((e) => <EduRow key={e.id} e={e} accent={accent} />)}</div>}
        {some(d.skills) && <div><H>Skills</H><div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>{d.skills.map((s, i) => <span key={i} style={{ padding: '3px 8px', borderRadius: 4, background: `${accent}15`, color: accent, fontSize: 11, fontWeight: 600 }}>{s}</span>)}</div></div>}
      </div>
    </div>
  )
}

/* =====================================================================
   30. Titan (Heavyweight · C-Suite) - PRO
   ===================================================================== */
function Titan({ d, accent }) {
  const b = d.basics || {}
  const H = ({ children }) => (
    <h3 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 2, fontWeight: 900, color: accent, borderBottom: `3px solid ${accent}`, paddingBottom: 2, margin: '20px 0 10px' }}>{children}</h3>
  )
  return (
    <div className="paper-body" style={{ padding: '48px 52px' }}>
      {!b.isPage2 ? (
        <>
          <h1 style={{ fontSize: 38, fontWeight: 900, letterSpacing: -0.5, lineHeight: 1 }}>{b.name || 'Your Name'}</h1>
      <div style={{ fontSize: 16, fontWeight: 800, color: accent, textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 4 }}>{b.title}</div>
      <div className="muted" style={{ fontSize: 12, margin: '8px 0 16px' }}>{contacts(b).join('  |  ')}</div>
        </>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{b.pageNum || 2}</span>
        </div>
      )}
      {b.summary && <p style={{ fontSize: 13.5, lineHeight: 1.6 }}>{b.summary}</p>}
      {some(d.experience) && <><H>Executive Leadership Track</H>{d.experience.map((e) => (
        <div key={e.id} style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><strong style={{ fontSize: 14 }}>{e.role}</strong><span className="muted" style={{ fontSize: 11.5 }}>{dates(e)}</span></div>
          <div style={{ color: accent, fontWeight: 700 }}>{e.company}</div>
          <Bullets items={bulletsOf(e)} />
        </div>
      ))}</>}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24 }}>
        {some(d.skills) && <div><H>Core Competencies</H><p>{d.skills.join('  •  ')}</p></div>}
        {some(d.education) && <div><H>Education</H>{d.education.map((e) => <EduRow key={e.id} e={e} accent={accent} />)}</div>}
      </div>
    </div>
  )
}

/* =====================================================================
   31. Element (Contemporary · Soft Cards) - PRO
   ===================================================================== */
function Element({ d, accent }) {
  const b = d.basics || {}
  const H = ({ children }) => (
    <h3 style={{ fontSize: 12.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, color: accent, margin: '20px 0 8px' }}>{children}</h3>
  )
  return (
    <div className="paper-body" style={{ padding: '44px 48px' }}>
      {!b.isPage2 ? (
        <div style={{ background: `${accent}10`, padding: '24px 28px', borderRadius: 12, border: `1px solid ${accent}25`, marginBottom: 16 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0 }}>{b.name || 'Your Name'}</h1>
        <div style={{ fontSize: 14, fontWeight: 700, color: accent, marginTop: 4 }}>{b.title}</div>
        <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>{contacts(b).join('   ·   ')}</div>
      </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{b.pageNum || 2}</span>
        </div>
      )}
      {b.summary && <p>{b.summary}</p>}
      {some(d.experience) && <><H>Experience</H>{d.experience.map((e) => (
        <div key={e.id} style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><strong>{e.role} <span style={{ color: accent }}>| {e.company}</span></strong><span className="muted" style={{ fontSize: 11.5 }}>{dates(e)}</span></div>
          <Bullets items={bulletsOf(e)} />
        </div>
      ))}</>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {some(d.education) && <div><H>Education</H>{d.education.map((e) => <EduRow key={e.id} e={e} accent={accent} />)}</div>}
        {some(d.skills) && <div><H>Skills</H><div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>{d.skills.map((s, i) => <span key={i} style={{ padding: '3px 8px', borderRadius: 6, background: `${accent}15`, color: accent, fontSize: 11, fontWeight: 600 }}>{s}</span>)}</div></div>}
      </div>
    </div>
  )
}

/* =====================================================================
   32. Atlas (Global · Multilingual CV) - PRO
   ===================================================================== */
function Atlas({ d, accent }) {
  const b = d.basics || {}
  const H = ({ children }) => (
    <h3 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 2, fontWeight: 800, color: accent, borderBottom: `2px solid ${accent}`, paddingBottom: 2, margin: '20px 0 10px' }}>{children}</h3>
  )
  return (
    <div className="paper-body" style={{ padding: '48px 52px' }}>
      {!b.isPage2 ? (
        <div style={{ borderBottom: `3px solid ${accent}`, paddingBottom: 16 }}>
        <h1 style={{ fontSize: 34, fontWeight: 900 }}>{b.name || 'Your Name'}</h1>
        <div style={{ fontSize: 15, fontWeight: 700, color: accent }}>{b.title}</div>
        <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>{contacts(b).join('  |  ')}</div>
      </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{b.pageNum || 2}</span>
        </div>
      )}
      {b.summary && <><H>International Executive Profile</H><p>{b.summary}</p></>}
      {some(d.experience) && <><H>Global Engagements & Experience</H>{d.experience.map((e) => (
        <div key={e.id} style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><strong>{e.role}</strong><span className="muted" style={{ fontSize: 11.5 }}>{dates(e)}</span></div>
          <div style={{ color: accent, fontWeight: 600 }}>{e.company}{e.location && ` (${e.location})`}</div>
          <Bullets items={bulletsOf(e)} />
        </div>
      ))}</>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {some(d.education) && <div><H>Education & Credentials</H>{d.education.map((e) => <EduRow key={e.id} e={e} accent={accent} />)}</div>}
        {some(d.skills) && <div><H>Core Competencies</H><p>{d.skills.join('  •  ')}</p></div>}
      </div>
    </div>
  )
}

const MAP = {
  modern: Modern,
  classic: Classic,
  minimal: Minimal,
  executive: Executive,
  creative: Creative,
  tech: Tech,
  metro: Metro,
  compact: Compact,
  academic: Academic,
  elegant: Elegant,
  infographic: Infographic,
  corporate: Corporate,
  nordic: Nordic,
  silicon: Silicon,
  cascade: Cascade,
  zenith: Zenith,
  nova: Nova,
  matrix: Matrix,
  horizon: Horizon,
  prestige: Prestige,
  artisan: Artisan,
  catalyst: Catalyst,
  vanguard: Vanguard,
  prime: Prime,
  frontier: Frontier,
  odyssey: Odyssey,
  sovereign: Sovereign,
  monarch: Monarch,
  alpine: Alpine,
  titan: Titan,
  element: Element,
  atlas: Atlas,
  // Alias additional IDs gracefully to core engines
  orbit: Creative,
  pinnacle: Horizon,
  quantum: Tech,
}

/**
 * Splits resume data cleanly across A4 pages (Page 1, Page 2, Page 3, ...)
 * so that no element, job entry, project, or paragraph is sliced in half or cut off at the bottom.
 */
export function paginateResumeData(d, template = 'modern') {
  if (!d) return [{}]

  const b = d.basics || {}
  const exp = Array.isArray(d.experience) ? d.experience : []
  const proj = Array.isArray(d.projects) ? d.projects : []
  const edu = Array.isArray(d.education) ? d.education : []
  const skills = Array.isArray(d.skills) ? d.skills : []
  const certs = Array.isArray(d.certifications) ? d.certifications : []

  // Check if template uses dedicated aside column for skills & education (only modern has an <aside>)
  const isSidebar = template === 'modern'
  // Templates that show skills near the top before experience
  const isTopSkills = template === 'creative' || template === 'executive' || template === 'tech'

  // Usable height limit on Page 1 (in px). Standard A4 is 1123px.
  const MAX_PAGE_1_H = (template === 'creative' || template === 'infographic') ? 880 : 930
  // Usable height limit on subsequent pages (Page 2, Page 3, ...).
  const MAX_SUBSEQUENT_PAGE_H = 1025

  // 1. Calculate Page 1 Base Header + Summary Height
  let baseH = (template === 'creative' || template === 'executive' || template === 'infographic') ? 135 : 65
  const sLen = (b.summary || '').length
  if (sLen > 0) {
    baseH += 26 + Math.ceil(sLen / 72) * 17 + 14
  }

  // Pre-experience skills only reduce Page 1 height for top-skills templates
  let extraPreH = 0
  if (isTopSkills && skills.length > 0) {
    extraPreH += 28 + Math.ceil(skills.length / 5) * 20
  }

  const pages = []
  let curExp = []
  let curProj = []
  let remH = MAX_PAGE_1_H - (baseH + extraPreH)
  let curExpHNeeded = true
  let curProjHNeeded = true

  const startNewPage = () => {
    pages.push({
      experience: curExp,
      projects: curProj,
    })
    curExp = []
    curProj = []
    remH = MAX_SUBSEQUENT_PAGE_H
    curExpHNeeded = true
    curProjHNeeded = true
  }

  // Distribute Experience entries
  for (const e of exp) {
    let itemH = 34 // role + company
    const bullets = bulletsOf(e)
    for (const bullet of bullets) {
      itemH += Math.max(17, Math.ceil(bullet.length / 68) * 17)
    }
    itemH += 12 // margin

    const neededH = (curExpHNeeded ? 28 : 0) + itemH
    if (neededH > remH && (curExp.length > 0 || pages.length > 0)) {
      startNewPage()
    }

    if (curExpHNeeded) {
      remH -= 28
      curExpHNeeded = false
    }
    curExp.push(e)
    remH -= itemH
  }

  // Distribute Projects entries
  for (const p of proj) {
    const descLen = (p.description || '').length
    let itemH = 20 + (descLen > 0 ? Math.ceil(descLen / 70) * 16 + 2 : 0) + 10
    // In creative, projects share a 2-column grid
    if (template === 'creative') {
      itemH = Math.ceil(itemH * 0.72)
    }

    const neededH = (curProjHNeeded ? 28 : 0) + itemH
    if (neededH > remH && (curExp.length > 0 || curProj.length > 0 || pages.length > 0)) {
      startNewPage()
    }

    if (curProjHNeeded) {
      remH -= 28
      curProjHNeeded = false
    }
    curProj.push(p)
    remH -= itemH
  }

  // Push final page
  pages.push({
    experience: curExp,
    projects: curProj,
  })

  // If only 1 page was needed, return single page
  if (pages.length === 1) {
    return [d]
  }

  return pages.map((pageData, index) => {
    const isFirst = index === 0
    const isLast = index === pages.length - 1

    // In sidebar templates (modern), education lives in Page 1 aside.
    // In non-sidebar templates, education always renders on the final page after all experiences,
    // ensuring Career Milestones are never split or interrupted by education.
    const pageEdu = isSidebar
      ? (isFirst ? edu : [])
      : (isLast ? edu : [])

    // Skills placement: top-skills templates stay on Page 1; bottom-skills templates render on last page
    const pageSkills = isSidebar
      ? (isFirst ? skills : [])
      : (isTopSkills ? (isFirst ? skills : []) : (isLast ? skills : []))

    // Certifications always render on the last page (or sidebar for modern)
    const pageCerts = isSidebar
      ? (isFirst ? certs : [])
      : (isLast ? certs : [])

    return {
      ...d,
      basics: {
        ...b,
        isPage2: !isFirst,
        pageNum: index + 1,
        totalPages: pages.length,
        summary: isFirst ? b.summary : '',
      },
      experience: pageData.experience,
      projects: pageData.projects,
      education: pageEdu,
      skills: pageSkills,
      certifications: pageCerts,
    }
  })
}

/** Renders a resume at native A4 size with clean multi-page pagination. Wrap in <ScaledPaper> to shrink. */
export function ResumePaper({ data, template = 'modern', accent = '#6366f1', font = 'inter', headerStyle }) {
  const T = MAP[template] || Modern
  const serifDefault = (template === 'classic' || template === 'academic' || template === 'elegant' || template === 'prestige' || template === 'monarch') && font === 'inter' ? 'lora' : font
  const pages = paginateResumeData(data, template)

  return (
    <div
      className="paper-wrapper"
      style={{
        fontFamily: FONTS[serifDefault]?.css || FONTS.inter.css,
        width: 794,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 28,
      }}
    >
      {pages.map((pData, idx) => (
        <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 794 }}>
          {idx > 0 && (
            <div
              className="page-break-badge no-print"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                width: '100%',
                margin: '10px 0 22px',
                color: '#64748b',
                fontSize: '0.78rem',
                fontWeight: 600,
                letterSpacing: 0.5,
              }}
            >
              <div style={{ flex: 1, height: 1, background: '#cbd5e1' }} />
              <span style={{ background: '#f8fafc', padding: '3px 12px', borderRadius: 999, border: '1px solid #cbd5e1', boxShadow: '0 2px 4px rgba(0,0,0,0.04)', fontWeight: 700, fontSize: '0.85rem' }}>
                {idx + 1}
              </span>
              <div style={{ flex: 1, height: 1, background: '#cbd5e1' }} />
            </div>
          )}
          <div
            className="paper resume-page-sheet"
            data-page={idx + 1}
            style={{
              width: 794,
              minHeight: 1123,
              height: 1123,
              overflow: 'hidden',
              position: 'relative',
              boxShadow: '0 20px 50px -15px rgba(15,23,42,0.18)',
              borderRadius: 3,
              background: '#ffffff',
            }}
          >
            <T
              d={pData}
              accent={accent}
              headerStyle={headerStyle || data?.headerStyle || 'dark'}
              textColor="#0f172a"
              isWhiteText={false}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

/** Scales a fixed-width A4 child to the requested width using CSS transform. */
export function ScaledPaper({ width, className = '', style, printable = false, children }) {
  const ref = useRef(null)
  const [h, setH] = useState(1123)
  const scale = width / 794
  useLayoutEffect(() => {
    if (!ref.current) return
    const ro = new ResizeObserver(() => setH(ref.current.offsetHeight))
    ro.observe(ref.current)
    setH(ref.current.offsetHeight)
    return () => ro.disconnect()
  }, [])
  return (
    <div className={className} style={{ width, height: h * scale, overflow: 'hidden', ...style }}>
      <div ref={ref} className={printable ? 'print-area' : ''} style={{ width: 794, transformOrigin: 'top left', transform: `scale(${scale})` }}>{children}</div>
    </div>
  )
}
