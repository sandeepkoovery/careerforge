import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Sparkles, Menu, X, LogOut, Crown, Shield, Clock, AlertTriangle, User } from 'lucide-react'
import { useAuth } from '../auth'
import UpgradeModal from './UpgradeModal'

export function Logo() {
  return (
    <Link to="/" className="logo">
      <span className="logo-mark"><Sparkles size={18} color="#fff" /></span>
      Smart<span className="gradient-text">cvmaker</span>
    </Link>
  )
}

export function Navbar() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const nav = useNavigate()
  const links = [
    ['/templates', 'Templates'],
    ['/tools/ats', 'ATS Checker'],
    ['/tools/cover-letter', 'Cover Letter'],
    ['/tools/job-match', 'Job Match'],
    ['/tools/linkedin', 'LinkedIn'],
  ]
  const isPro = Boolean(user?.is_pro && user.is_pro !== '0' && user.is_pro !== 0)
  const isAdmin = Boolean(user?.is_admin && user.is_admin !== '0' && user.is_admin !== 0)

  return (
    <>
      <header className={`nav ${open ? 'open' : ''}`}>
        <div className="container nav-inner">
          <Logo />
          <nav className="nav-links" onClick={() => setOpen(false)}>
            {links.map(([to, label]) => <NavLink key={to} to={to}>{label}</NavLink>)}
          </nav>
          <div className="spacer" />
          <div className="row nav-actions" onClick={() => setOpen(false)}>
            {user ? (
              <>
                {isAdmin && (
                  <Link
                    to="/admin"
                    id="nav-admin-link"
                    className="btn btn-sm row"
                    style={{ gap: 5, background: '#ede9fe', color: '#6d28d9', border: '1px solid #ddd6fe', fontWeight: 600 }}
                    title="Open Administrator Console"
                  >
                    <Shield size={14} /> Admin Console
                  </Link>
                )}

                {isPro ? (
                  <span className="badge-pro" title="Smartcvmaker Pro Member">
                    <Crown size={13} /> PRO
                  </span>
                ) : user.is_trial ? (
                  <button
                    className="badge row"
                    style={{ background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', fontSize: '0.75rem', padding: '4px 8px', borderRadius: 6, fontWeight: 600, gap: 4, cursor: 'pointer' }}
                    onClick={() => setUpgradeOpen(true)}
                    title="1-Month Free Trial active. Click to view Pro options"
                  >
                    <Clock size={12} /> Trial ({user.trial_days_left}d)
                  </button>
                ) : user.is_trial_expired ? (
                  <button
                    className="badge row"
                    style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', fontSize: '0.75rem', padding: '4px 8px', borderRadius: 6, fontWeight: 700, gap: 4, cursor: 'pointer' }}
                    onClick={() => setUpgradeOpen(true)}
                    title="Your 1-Month Trial has expired! Upgrade to Pro to unlock all 35 templates"
                  >
                    <AlertTriangle size={12} /> Trial Expired · Go Pro
                  </button>
                ) : (
                  <button className="badge-pro" onClick={() => setUpgradeOpen(true)} title="Upgrade to Pro">
                    <Crown size={13} /> Upgrade
                  </button>
                )}

                <Link to="/dashboard" className="btn btn-sm">Dashboard</Link>
                <Link to="/profile" id="nav-profile-link" className="btn btn-sm btn-ghost row" style={{ gap: 5 }} title="My Profile & Settings">
                  <User size={15} /> Profile
                </Link>
                <button className="btn btn-sm btn-ghost" onClick={async () => { await logout(); nav('/') }} title="Log out"><LogOut size={16} /></button>
              </>
            ) : (
              <>
                <button className="badge-pro" onClick={() => setUpgradeOpen(true)} title="Upgrade to Pro">
                  <Crown size={13} /> Go Pro
                </button>
                <Link to="/login" className="btn btn-sm btn-ghost">Log in</Link>
                <Link to="/register" className="btn btn-sm btn-primary">Get started free</Link>
              </>
            )}
          </div>
          <button className="nav-toggle" onClick={() => setOpen(!open)} aria-label="Toggle menu">{open ? <X /> : <Menu />}</button>
        </div>
      </header>
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </>
  )
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container row wrap">
        <Logo />
        <span className="spacer" />
        <div className="row" style={{ gap: '1.25rem', alignItems: 'center' }}>
          <span>© {new Date().getFullYear()} Smartcvmaker. Craft resumes that get read.</span>
          <Link to="/support" style={{ color: 'var(--muted)', fontSize: '0.82rem', textDecoration: 'none' }} title="Contact Customer Support">
            🎧 Help &amp; Support
          </Link>
        </div>
      </div>
    </footer>
  )
}

export function Aurora() {
  return <div className="aurora"><div className="grid-bg" /></div>
}
