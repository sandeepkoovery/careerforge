import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  User, Mail, Lock, Shield, Crown, Clock, Check, AlertTriangle,
  KeyRound, Globe, Smartphone, Save, ArrowLeft, LogOut, Loader2,
  Calendar, CheckCircle2, Sparkles, LifeBuoy, MessageSquare
} from 'lucide-react'
import { useAuth } from '../auth'
import UpgradeModal from '../components/UpgradeModal'

export default function Profile() {
  const { user, updateProfile, logout } = useAuth()
  const nav = useNavigate()
  const [upgradeOpen, setUpgradeOpen] = useState(false)

  // Profile Form state
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState('')
  const [profileError, setProfileError] = useState('')

  // Password Form state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [passwordError, setPasswordError] = useState('')

  // Active Tab
  const [activeTab, setActiveTab] = useState('general')

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setProfileSaving(true)
    setProfileSuccess('')
    setProfileError('')

    try {
      const res = await updateProfile({ name, email })
      setProfileSuccess(res.message || 'Profile updated successfully!')
      setTimeout(() => setProfileSuccess(''), 4000)
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile.')
    } finally {
      setProfileSaving(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPasswordSaving(true)
    setPasswordSuccess('')
    setPasswordError('')

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.')
      setPasswordSaving(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation password do not match.')
      setPasswordSaving(false)
      return
    }

    try {
      const res = await updateProfile({
        name: user?.name,
        email: user?.email,
        current_password: currentPassword,
        new_password: newPassword,
      })
      setPasswordSuccess('Password changed successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPasswordSuccess(''), 4000)
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password. Please verify current password.')
    } finally {
      setPasswordSaving(false)
    }
  }

  // Generate initials
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U'

  // Format joined date
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently'

  return (
    <main className="page">
      <div className="container" style={{ maxWidth: 1000 }}>
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: 24 }}>
          <Link to="/dashboard" className="row" style={{ gap: 8, color: 'var(--muted)', fontSize: '0.9rem', fontWeight: 500 }}>
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
        </div>

        {/* Profile Hero Header Card */}
        <div className="card" style={{ marginBottom: 32, padding: '32px 36px', background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -50, right: -50, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div className="row wrap between" style={{ gap: 24, position: 'relative', zIndex: 2 }}>
            <div className="row" style={{ gap: 20 }}>
              {/* Avatar Squircle */}
              <div style={{
                width: 76,
                height: 76,
                borderRadius: 20,
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #0284c7 100%)',
                color: '#ffffff',
                display: 'grid',
                placeItems: 'center',
                fontSize: '1.8rem',
                fontWeight: 800,
                letterSpacing: 1,
                boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.4)',
                flexShrink: 0
              }}>
                {initials}
              </div>

              <div>
                <div className="row" style={{ gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                  <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{user?.name}</h1>
                  {user?.is_admin && (
                    <span className="chip" style={{ background: '#ede9fe', color: '#6d28d9', borderColor: '#ddd6fe', fontWeight: 700 }}>
                      <Shield size={13} /> Administrator
                    </span>
                  )}
                  {user?.is_pro ? (
                    <span className="badge-pro" style={{ padding: '4px 10px' }}>
                      <Crown size={14} /> PRO MEMBER
                    </span>
                  ) : user?.is_trial ? (
                    <span className="chip" style={{ background: '#e0f2fe', color: '#0369a1', borderColor: '#bae6fd', fontWeight: 600 }}>
                      <Clock size={13} /> Trial ({user.trial_days_left}d left)
                    </span>
                  ) : user?.is_trial_expired ? (
                    <span className="chip bad" style={{ fontWeight: 700 }}>
                      <AlertTriangle size={13} /> Trial Expired
                    </span>
                  ) : (
                    <span className="badge-free">Free Plan</span>
                  )}
                </div>

                <div className="row wrap" style={{ gap: 16, color: 'var(--muted)', fontSize: '0.88rem' }}>
                  <span className="row" style={{ gap: 6 }}><Mail size={14} /> {user?.email}</span>
                  <span className="row" style={{ gap: 6 }}><Calendar size={14} /> Member since {memberSince}</span>
                </div>
              </div>
            </div>

            {/* Header Right Action */}
            <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
              <Link
                to="/support"
                id="profile-header-support-btn"
                className="btn btn-sm btn-ghost row"
                style={{ gap: 6, border: '1px solid var(--border)' }}
                title="Open Support & Helpdesk"
              >
                <LifeBuoy size={15} /> Help &amp; Support
              </Link>
              {!user?.is_pro && (
                <button
                  id="profile-upgrade-btn"
                  className="btn btn-primary btn-sm row"
                  style={{ gap: 6 }}
                  onClick={() => setUpgradeOpen(true)}
                >
                  <Crown size={14} /> Upgrade to Pro
                </button>
              )}
              <button
                className="btn btn-sm btn-ghost row"
                style={{ gap: 6, color: '#ef4444' }}
                onClick={async () => { await logout(); nav('/') }}
                title="Log out of your account"
              >
                <LogOut size={15} /> Log out
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ marginBottom: 24, display: 'flex', gap: 8, borderBottom: '1px solid var(--border)', paddingBottom: 12, flexWrap: 'wrap' }}>
          <button
            id="tab-profile-general"
            className={`tab ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <User size={16} /> Personal Info
          </button>
          <button
            id="tab-profile-security"
            className={`tab ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <KeyRound size={16} /> Password & Security
          </button>
          <button
            id="tab-profile-plan"
            className={`tab ${activeTab === 'plan' ? 'active' : ''}`}
            onClick={() => setActiveTab('plan')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <Crown size={16} /> Subscription & Plan
          </button>
          <button
            id="tab-profile-support"
            className={`tab ${activeTab === 'support' ? 'active' : ''}`}
            onClick={() => setActiveTab('support')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <LifeBuoy size={16} /> Help &amp; Support
          </button>
        </div>

        {/* TAB 1: GENERAL INFO */}
        {activeTab === 'general' && (
          <div className="grid grid-2" style={{ gap: 24 }}>
            {/* Edit Form */}
            <div className="card">
              <h2 style={{ fontSize: '1.25rem', marginBottom: 6 }}>Edit Profile Details</h2>
              <p className="muted small" style={{ marginBottom: 20 }}>Update your account display name and primary email address.</p>

              {profileSuccess && (
                <div className="alert alert-info row" style={{ gap: 8, marginBottom: 18, background: '#f0fdf4', color: '#15803d', borderColor: '#bbf7d0' }}>
                  <CheckCircle2 size={18} color="#16a34a" /> {profileSuccess}
                </div>
              )}
              {profileError && (
                <div className="alert alert-error" style={{ marginBottom: 18 }}>
                  {profileError}
                </div>
              )}

              <form onSubmit={handleSaveProfile}>
                <div className="field">
                  <label className="label" htmlFor="profile-name">Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="profile-name"
                      type="text"
                      className="input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="e.g. Alex Morgan"
                      style={{ paddingLeft: 38 }}
                    />
                    <User size={16} style={{ position: 'absolute', left: 12, top: 13, color: '#94a3b8' }} />
                  </div>
                </div>

                <div className="field">
                  <label className="label" htmlFor="profile-email">Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="profile-email"
                      type="email"
                      className="input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="e.g. alex@example.com"
                      style={{ paddingLeft: 38 }}
                    />
                    <Mail size={16} style={{ position: 'absolute', left: 12, top: 13, color: '#94a3b8' }} />
                  </div>
                  <div className="small muted" style={{ marginTop: 4, fontSize: '0.78rem' }}>
                    Used for logging in and receiving resume tips.
                  </div>
                </div>

                <div style={{ marginTop: 24 }}>
                  <button
                    id="save-profile-btn"
                    type="submit"
                    className="btn btn-primary row"
                    style={{ gap: 8 }}
                    disabled={profileSaving}
                  >
                    {profileSaving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
                    {profileSaving ? 'Saving Changes…' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>

            {/* Quick Profile Summary Card */}
            <div className="card" style={{ background: '#f8fafc' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: 16 }}>Account Overview</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ padding: '12px 16px', background: '#ffffff', borderRadius: 12, border: '1px solid var(--border)' }}>
                  <div className="muted small">Account ID</div>
                  <div style={{ fontWeight: 600, fontSize: '0.94rem', fontFamily: 'monospace' }}>#{user?.id}</div>
                </div>

                <div style={{ padding: '12px 16px', background: '#ffffff', borderRadius: 12, border: '1px solid var(--border)' }}>
                  <div className="muted small">Plan Level</div>
                  <div style={{ fontWeight: 700, fontSize: '0.94rem', color: user?.is_pro ? '#7c3aed' : '#0369a1' }}>
                    {user?.is_pro ? 'Smartcvmaker Pro' : user?.is_trial ? '1-Month Free Trial' : 'Standard'}
                  </div>
                </div>

                <div style={{ padding: '12px 16px', background: '#ffffff', borderRadius: 12, border: '1px solid var(--border)' }}>
                  <div className="muted small">Last Activity Location</div>
                  <div style={{ fontWeight: 600, fontSize: '0.94rem' }}>
                    {user?.last_login_city ? `${user.last_login_city}, ${user.last_login_country || ''}` : 'Localhost / Dev'}
                  </div>
                  <div className="muted small" style={{ fontSize: '0.78rem' }}>IP: {user?.last_login_ip || '127.0.0.1'}</div>
                </div>

                <div style={{ padding: '12px 16px', background: '#ffffff', borderRadius: 12, border: '1px solid var(--border)' }}>
                  <div className="muted small">Last Device Used</div>
                  <div style={{ fontWeight: 600, fontSize: '0.94rem' }}>
                    {user?.last_device || 'Desktop Browser'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PASSWORD & SECURITY */}
        {activeTab === 'security' && (
          <div className="card" style={{ maxWidth: 580 }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: 6 }}>Change Your Password</h2>
            <p className="muted small" style={{ marginBottom: 20 }}>
              Ensure your account is using a long, random password to stay secure.
            </p>

            {passwordSuccess && (
              <div className="alert alert-info row" style={{ gap: 8, marginBottom: 18, background: '#f0fdf4', color: '#15803d', borderColor: '#bbf7d0' }}>
                <CheckCircle2 size={18} color="#16a34a" /> {passwordSuccess}
              </div>
            )}
            {passwordError && (
              <div className="alert alert-error" style={{ marginBottom: 18 }}>
                {passwordError}
              </div>
            )}

            <form onSubmit={handleChangePassword}>
              <div className="field">
                <label className="label" htmlFor="current-password">Current Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="current-password"
                    type="password"
                    className="input"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    placeholder="Enter current password"
                    style={{ paddingLeft: 38 }}
                  />
                  <Lock size={16} style={{ position: 'absolute', left: 12, top: 13, color: '#94a3b8' }} />
                </div>
              </div>

              <div className="field">
                <label className="label" htmlFor="new-password">New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="new-password"
                    type="password"
                    className="input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="Minimum 8 characters"
                    style={{ paddingLeft: 38 }}
                  />
                  <KeyRound size={16} style={{ position: 'absolute', left: 12, top: 13, color: '#94a3b8' }} />
                </div>
              </div>

              <div className="field">
                <label className="label" htmlFor="confirm-password">Confirm New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="confirm-password"
                    type="password"
                    className="input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="Re-enter new password"
                    style={{ paddingLeft: 38 }}
                  />
                  <KeyRound size={16} style={{ position: 'absolute', left: 12, top: 13, color: '#94a3b8' }} />
                </div>
              </div>

              <div style={{ marginTop: 24 }}>
                <button
                  id="update-password-btn"
                  type="submit"
                  className="btn btn-primary row"
                  style={{ gap: 8 }}
                  disabled={passwordSaving}
                >
                  {passwordSaving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
                  {passwordSaving ? 'Updating Password…' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: SUBSCRIPTION & PLAN */}
        {activeTab === 'plan' && (
          <div className="card" style={{ padding: '32px 36px' }}>
            <div className="row wrap between" style={{ marginBottom: 24, gap: 16 }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Your Smartcvmaker Plan</h2>
                <p className="muted small">Manage your resume creation limits, premium templates, and features.</p>
              </div>
              <div>
                {user?.is_pro ? (
                  <span className="badge-pro" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
                    <Crown size={15} /> PRO ACTIVATED
                  </span>
                ) : user?.is_trial ? (
                  <span className="chip" style={{ background: '#e0f2fe', color: '#0369a1', borderColor: '#bae6fd', fontWeight: 700, padding: '6px 12px' }}>
                    <Clock size={15} /> 1-Month Free Trial ({user.trial_days_left} Days Remaining)
                  </span>
                ) : (
                  <span className="chip bad" style={{ padding: '6px 12px', fontWeight: 700 }}>
                    <AlertTriangle size={15} /> Trial Expired
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-3" style={{ marginBottom: 32, gap: 18 }}>
              <div style={{ padding: 18, background: '#f8fafc', borderRadius: 14, border: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 6 }}>Resume Templates</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--brand)' }}>
                  {user?.is_pro || user?.is_trial ? '35' : '10'}
                </div>
                <div className="muted small">{user?.is_pro || user?.is_trial ? 'All premium templates unlocked' : 'Standard templates only'}</div>
              </div>

              <div style={{ padding: 18, background: '#f8fafc', borderRadius: 14, border: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 6 }}>Power Tools</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#059669' }}>Unlimited</div>
                <div className="muted small">ATS Checker, Job Match & Cover Letters</div>
              </div>

              <div style={{ padding: 18, background: '#f8fafc', borderRadius: 14, border: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 6 }}>PDF & Exports</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#d946ef' }}>High-Res</div>
                <div className="muted small">Clean vectors with instant printing</div>
              </div>
            </div>

            {/* Upgrade CTA if not pro */}
            {!user?.is_pro && (
              <div style={{ padding: '24px 28px', borderRadius: 18, background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(217, 70, 239, 0.06) 100%)', border: '1px solid rgba(99, 102, 241, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: '1.15rem', color: '#4338ca', marginBottom: 4 }}>
                    <Sparkles size={18} /> Upgrade to Smartcvmaker Pro
                  </div>
                  <div className="muted small">
                    Unlock lifetime access to all 35 templates, priority AI suggestions, and remove any watermark.
                  </div>
                </div>
                <button
                  id="profile-plan-upgrade-btn"
                  className="btn btn-primary row"
                  style={{ gap: 8 }}
                  onClick={() => setUpgradeOpen(true)}
                >
                  <Crown size={16} /> Upgrade via Razorpay
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: HELP & SUPPORT */}
        {activeTab === 'support' && (
          <div className="card" style={{ padding: '32px 36px' }}>
            <div className="row wrap between" style={{ marginBottom: 24, gap: 16 }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Customer Support &amp; Helpdesk</h2>
                <p className="muted small">Submit tickets, report template issues, or get direct assistance with your account.</p>
              </div>
              <div className="row" style={{ gap: 10 }}>
                <Link
                  to="/support"
                  id="profile-open-support-desk-btn"
                  className="btn btn-primary btn-sm row"
                  style={{ gap: 8 }}
                >
                  <LifeBuoy size={15} /> Open Support Desk &rarr;
                </Link>
              </div>
            </div>

            {/* Support Overview Grid */}
            <div className="grid grid-3" style={{ marginBottom: 32, gap: 18 }}>
              <div style={{ padding: 20, background: '#f8fafc', borderRadius: 14, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#ede9fe', color: '#7c3aed', display: 'grid', placeItems: 'center' }}>
                    <MessageSquare size={18} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>Support Tickets</div>
                </div>
                <p className="muted small" style={{ marginBottom: 14, lineHeight: 1.5 }}>
                  Create official tickets to track technical bugs, template design requests, or billing queries with live admin replies.
                </p>
                <Link to="/support" className="btn btn-sm btn-outline row" style={{ gap: 6, width: '100%', justifyContent: 'center' }}>
                  <MessageSquare size={14} /> View Your Tickets
                </Link>
              </div>

              <div style={{ padding: 20, background: '#f8fafc', borderRadius: 14, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#e0f2fe', color: '#0284c7', display: 'grid', placeItems: 'center' }}>
                    <Crown size={18} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>
                    {user?.is_pro ? 'Priority SLA Active' : 'Pro Fast-Track'}
                  </div>
                </div>
                <p className="muted small" style={{ marginBottom: 14, lineHeight: 1.5 }}>
                  {user?.is_pro
                    ? 'As a Pro member, your support tickets are routed directly to our priority queue with fast turnaround.'
                    : 'Upgrade to Pro to receive fast priority turnaround times and dedicated specialist review.'}
                </p>
                {user?.is_pro ? (
                  <div className="chip" style={{ background: '#ede9fe', color: '#7c3aed', borderColor: '#ddd6fe', fontWeight: 600, justifyContent: 'center' }}>
                    ⚡ Priority Support Enabled
                  </div>
                ) : (
                  <button className="btn btn-sm btn-primary row" style={{ gap: 6, width: '100%', justifyContent: 'center' }} onClick={() => setUpgradeOpen(true)}>
                    <Crown size={14} /> Upgrade for Priority SLA
                  </button>
                )}
              </div>

              <div style={{ padding: 20, background: '#f8fafc', borderRadius: 14, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#ecfdf5', color: '#059669', display: 'grid', placeItems: 'center' }}>
                    <Mail size={18} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>Direct Email</div>
                </div>
                <p className="muted small" style={{ marginBottom: 14, lineHeight: 1.5 }}>
                  Need urgent corporate assistance or partner inquiries? Contact our team anytime via email.
                </p>
                <a href="mailto:support@smartcvmaker.com" className="btn btn-sm btn-ghost row" style={{ gap: 6, width: '100%', justifyContent: 'center', border: '1px solid var(--border)' }}>
                  support@smartcvmaker.com
                </a>
              </div>
            </div>

            {/* Common FAQs Section */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24 }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 16 }}>Frequently Asked Questions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ padding: '14px 18px', background: '#ffffff', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <strong style={{ fontSize: '0.94rem', display: 'block', marginBottom: 4 }}>How does ATS keyword scoring work?</strong>
                  <div className="muted small" style={{ lineHeight: 1.5 }}>
                    Our ATS checker compares your resume against target job descriptions and extracts required hard skills, formatting syntax, and structural standards used by leading systems like Workday, Greenhouse, and Taleo.
                  </div>
                </div>

                <div style={{ padding: '14px 18px', background: '#ffffff', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <strong style={{ fontSize: '0.94rem', display: 'block', marginBottom: 4 }}>Can I export in PDF with high vector quality?</strong>
                  <div className="muted small" style={{ lineHeight: 1.5 }}>
                    Yes! Both free and Pro members can generate print-ready vector PDFs directly from the builder.
                  </div>
                </div>

                <div style={{ padding: '14px 18px', background: '#ffffff', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <strong style={{ fontSize: '0.94rem', display: 'block', marginBottom: 4 }}>How do I track my active support tickets?</strong>
                  <div className="muted small" style={{ lineHeight: 1.5 }}>
                    Click on "Open Support Desk" above or navigate to the Support menu from the top navigation to view status updates and chat directly with support administrators.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </main>
  )
}
