import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Shield, Users, Crown, Clock, AlertTriangle, ArrowUpRight, ArrowDownRight,
  Plus, Search, RefreshCw, CheckCircle2, AlertCircle, FileText, IndianRupee,
  Calendar, Check, X, ShieldAlert, Sparkles, UserCheck, UserX, Trash2
} from 'lucide-react'
import { api } from '../api'
import { useAuth } from '../auth'

export default function Admin() {
  const { user } = useAuth()
  const nav = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('all')
  const [viewTab, setViewTab] = useState('users') // 'users' or 'payments'
  const [actionBusy, setActionBusy] = useState(null)
  const [toast, setToast] = useState('')

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 4000)
  }

  const loadData = async () => {
    setLoading(true)
    setErr('')
    try {
      const res = await api.get('/admin/users')
      setData(res)
    } catch (e) {
      setErr(e.message || 'Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.is_admin) {
      loadData()
    }
  }, [user?.is_admin])

  if (!user?.is_admin) {
    return (
      <main className="page">
        <div className="container" style={{ maxWidth: 600, textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
            <ShieldAlert size={32} />
          </div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: 8 }}>Admin Access Required</h1>
          <p className="muted" style={{ marginBottom: 24 }}>
            This page is restricted to Smartcvmaker administrators. Please sign in with an administrator account to view the user console.
          </p>
          <div className="row center" style={{ gap: 12 }}>
            <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
            <Link to="/" className="btn btn-outline">Home</Link>
          </div>
        </div>
      </main>
    )
  }

  const handleUpgrade = async (userId) => {
    setActionBusy(userId)
    try {
      const res = await api.post(`/admin/users/${userId}/upgrade`)
      showToast(res.message)
      await loadData()
    } catch (e) {
      alert(e.message)
    } finally {
      setActionBusy(null)
    }
  }

  const handleDowngrade = async (userId) => {
    if (!window.confirm('Downgrade this user to the Free plan?')) return
    setActionBusy(userId)
    try {
      const res = await api.post(`/admin/users/${userId}/downgrade`)
      showToast(res.message)
      await loadData()
    } catch (e) {
      alert(e.message)
    } finally {
      setActionBusy(null)
    }
  }

  const handleExtendTrial = async (userId) => {
    setActionBusy(userId)
    try {
      const res = await api.post(`/admin/users/${userId}/extend-trial`)
      showToast(res.message)
      await loadData()
    } catch (e) {
      alert(e.message)
    } finally {
      setActionBusy(null)
    }
  }

  const handleToggleAdmin = async (userId) => {
    if (!window.confirm('Change admin privileges for this user?')) return
    setActionBusy(userId)
    try {
      const res = await api.post(`/admin/users/${userId}/toggle-admin`)
      showToast(res.message)
      await loadData()
    } catch (e) {
      alert(e.message)
    } finally {
      setActionBusy(null)
    }
  }

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Permanently delete user "${userName}" and all their resumes? This cannot be undone.`)) return
    setActionBusy(userId)
    try {
      const res = await api.del(`/admin/users/${userId}`)
      showToast(res.message)
      await loadData()
    } catch (e) {
      alert(e.message)
    } finally {
      setActionBusy(null)
    }
  }

  const users = data?.users || []
  const metrics = data?.metrics || {}
  const payments = data?.recent_payments || []

  const filteredUsers = users.filter((u) => {
    if (tab === 'pro' && !u.is_pro) return false
    if (tab === 'trial' && !u.is_trial) return false
    if (tab === 'expired' && !u.is_trial_expired) return false
    if (tab === 'admin' && !u.is_admin) return false

    if (search.trim()) {
      const q = search.toLowerCase()
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || String(u.id) === q
    }
    return true
  })

  return (
    <main className="page">
      <div className="container">
        {/* Header */}
        <div className="row between" style={{ marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div className="row" style={{ gap: 8, alignItems: 'center', marginBottom: 4 }}>
              <span className="badge-pro" style={{ background: '#e0e7ff', color: '#4338ca', border: '1px solid #c7d2fe' }}>
                <Shield size={13} /> Administrator Console
              </span>
              <span className="muted small">Live System Control</span>
            </div>
            <h1 className="page-title" style={{ fontSize: '2rem' }}>
              User Management & <span className="gradient-text">Plan Administration</span>
            </h1>
            <p className="muted">
              Monitor active 1-month trials, Pro memberships, Razorpay payments, and control user access.
            </p>
          </div>

          <div className="row" style={{ gap: 10 }}>
            <button className="btn btn-outline row" style={{ gap: 6 }} onClick={loadData} disabled={loading}>
              <RefreshCw size={15} className={loading ? 'spin' : ''} /> Refresh Data
            </button>
            <Link to="/dashboard" className="btn btn-primary">
              Back to App
            </Link>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div className="alert alert-info row fade-in" style={{ marginBottom: 20, background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }}>
            <CheckCircle2 size={16} color="#059669" />
            <span>{toast}</span>
          </div>
        )}
        {err && (
          <div className="alert alert-error row" style={{ marginBottom: 20 }}>
            <AlertCircle size={16} />
            <span>{err}</span>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-4" style={{ gap: 16, marginBottom: 32 }}>
          <div className="card" style={{ padding: '20px 22px', borderLeft: '4px solid #6366f1' }}>
            <div className="row between" style={{ color: '#64748b', marginBottom: 8, fontSize: '0.85rem', fontWeight: 600 }}>
              <span>Total Registered</span>
              <Users size={18} color="#6366f1" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
              {metrics.total_users ?? 0}
            </div>
            <div className="muted small" style={{ marginTop: 6 }}>All platform accounts</div>
          </div>

          <div className="card" style={{ padding: '20px 22px', borderLeft: '4px solid #eab308' }}>
            <div className="row between" style={{ color: '#64748b', marginBottom: 8, fontSize: '0.85rem', fontWeight: 600 }}>
              <span>Pro Subscribers</span>
              <Crown size={18} color="#eab308" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
              {metrics.pro_users ?? 0}
            </div>
            <div className="muted small" style={{ marginTop: 6 }}>All 35 templates unlocked</div>
          </div>

          <div className="card" style={{ padding: '20px 22px', borderLeft: '4px solid #0ea5e9' }}>
            <div className="row between" style={{ color: '#64748b', marginBottom: 8, fontSize: '0.85rem', fontWeight: 600 }}>
              <span>Active 30-Day Trials</span>
              <Clock size={18} color="#0ea5e9" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
              {metrics.trial_users ?? 0}
            </div>
            <div className="muted small" style={{ marginTop: 6 }}>Within 1-month trial window</div>
          </div>

          <div className="card" style={{ padding: '20px 22px', borderLeft: '4px solid #f97316' }}>
            <div className="row between" style={{ color: '#64748b', marginBottom: 8, fontSize: '0.85rem', fontWeight: 600 }}>
              <span>Trials Expired</span>
              <AlertTriangle size={18} color="#f97316" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
              {metrics.expired_users ?? 0}
            </div>
            <div className="muted small" style={{ marginTop: 6 }}>Need Pro version to continue</div>
          </div>
        </div>

        {/* Navigation Tabs (Users vs Payments) */}
        <div className="tabs" style={{ marginBottom: 20 }}>
          <button className={`tab ${viewTab === 'users' ? 'active' : ''}`} onClick={() => setViewTab('users')}>
            <span className="row" style={{ gap: 6 }}><Users size={15} /> Registered Users ({users.length})</span>
          </button>
          <button className={`tab ${viewTab === 'payments' ? 'active' : ''}`} onClick={() => setViewTab('payments')}>
            <span className="row" style={{ gap: 6 }}><IndianRupee size={15} /> Razorpay Transactions ({payments.length})</span>
          </button>
        </div>

        {viewTab === 'users' ? (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Table Filters Toolbar */}
            <div className="row between" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: '#f8fafc', flexWrap: 'wrap', gap: 12 }}>
              <div className="row wrap" style={{ gap: 8 }}>
                <button className={`btn btn-sm ${tab === 'all' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('all')}>
                  All ({users.length})
                </button>
                <button className={`btn btn-sm ${tab === 'pro' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('pro')}>
                  ⭐ Pro ({metrics.pro_users ?? 0})
                </button>
                <button className={`btn btn-sm ${tab === 'trial' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('trial')}>
                  ⏳ Active Trial ({metrics.trial_users ?? 0})
                </button>
                <button className={`btn btn-sm ${tab === 'expired' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('expired')}>
                  ⚠️ Trial Expired ({metrics.expired_users ?? 0})
                </button>
                <button className={`btn btn-sm ${tab === 'admin' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('admin')}>
                  🛡️ Admins
                </button>
              </div>

              <div style={{ position: 'relative', width: 280 }}>
                <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  className="input"
                  style={{ paddingLeft: 32, fontSize: '0.86rem', height: 34 }}
                  placeholder="Search user name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Users Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '1px solid var(--border)', color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '12px 18px' }}>User Details</th>
                    <th style={{ padding: '12px 16px' }}>Status / Plan Type</th>
                    <th style={{ padding: '12px 16px' }}>1-Month Trial Status</th>
                    <th style={{ padding: '12px 16px' }}>Resumes</th>
                    <th style={{ padding: '12px 18px', textAlign: 'right' }}>Admin Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: 36, textAlign: 'center', color: '#64748b' }}>
                        No users found matching current filter or search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isBusy = actionBusy === u.id
                      const initials = (u.name || 'U').trim().slice(0, 2).toUpperCase()
                      return (
                        <tr key={u.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}>
                          {/* User Details */}
                          <td style={{ padding: '14px 18px' }}>
                            <div className="row" style={{ gap: 12 }}>
                              <div style={{ width: 38, height: 38, borderRadius: '50%', background: u.is_admin ? '#ede9fe' : u.is_pro ? '#fef3c7' : '#e0e7ff', color: u.is_admin ? '#6d28d9' : u.is_pro ? '#b45309' : '#4338ca', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: '0.85rem', flex: 'none' }}>
                                {initials}
                              </div>
                              <div>
                                <div className="row" style={{ gap: 6, alignItems: 'center' }}>
                                  <strong style={{ color: '#0f172a', fontSize: '0.92rem' }}>{u.name}</strong>
                                  {u.is_admin && <span className="badge" style={{ background: '#ede9fe', color: '#6d28d9', fontSize: '0.68rem', padding: '1px 6px' }}>ADMIN</span>}
                                </div>
                                <div className="muted small" style={{ fontSize: '0.8rem' }}>{u.email}</div>
                                <div className="muted small" style={{ fontSize: '0.74rem' }}>Joined: {new Date(u.created_at).toLocaleDateString()}</div>
                              </div>
                            </div>
                          </td>

                          {/* Plan Type Badge */}
                          <td style={{ padding: '14px 16px' }}>
                            {u.is_pro ? (
                              <span className="badge-pro" style={{ fontSize: '0.75rem', padding: '3px 8px' }}>
                                <Crown size={12} /> PRO MEMBER
                              </span>
                            ) : u.is_trial ? (
                              <span className="badge" style={{ background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', fontSize: '0.75rem', padding: '3px 8px', borderRadius: 6, fontWeight: 600 }}>
                                ⏳ 30-DAY TRIAL
                              </span>
                            ) : u.is_trial_expired ? (
                              <span className="badge" style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', fontSize: '0.75rem', padding: '3px 8px', borderRadius: 6, fontWeight: 600 }}>
                                ⚠️ TRIAL EXPIRED (Free)
                              </span>
                            ) : (
                              <span className="badge-free" style={{ fontSize: '0.75rem' }}>FREE TIER</span>
                            )}
                          </td>

                          {/* Trial Status */}
                          <td style={{ padding: '14px 16px' }}>
                            {u.is_pro ? (
                              <span className="small muted">Active Subscription (Unlimited)</span>
                            ) : u.is_trial ? (
                              <div>
                                <div style={{ fontWeight: 600, color: '#0284c7', fontSize: '0.85rem' }}>
                                  {u.trial_days_left} days remaining
                                </div>
                                <div className="muted small" style={{ fontSize: '0.75rem' }}>
                                  Ends: {u.trial_ends_at ? new Date(u.trial_ends_at).toLocaleDateString() : 'N/A'}
                                </div>
                              </div>
                            ) : u.is_trial_expired ? (
                              <div>
                                <div style={{ fontWeight: 600, color: '#dc2626', fontSize: '0.85rem' }}>
                                  Expired
                                </div>
                                <div className="muted small" style={{ fontSize: '0.75rem' }}>
                                  Ended: {u.trial_ends_at ? new Date(u.trial_ends_at).toLocaleDateString() : 'N/A'}
                                </div>
                              </div>
                            ) : (
                              <span className="muted small">No trial active</span>
                            )}
                          </td>

                          {/* Resumes */}
                          <td style={{ padding: '14px 16px' }}>
                            <div className="row" style={{ gap: 6 }}>
                              <FileText size={15} color="#6366f1" />
                              <strong style={{ fontSize: '0.9rem' }}>{u.resumes_count ?? 0}</strong>
                            </div>
                          </td>

                          {/* Actions */}
                          <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                            <div className="row" style={{ justifyContent: 'flex-end', gap: 6 }}>
                              {!u.is_pro ? (
                                <button
                                  id={`btn-upgrade-user-${u.id}`}
                                  className="btn btn-sm btn-primary row"
                                  style={{ padding: '4px 10px', fontSize: '0.78rem', gap: 4, background: 'linear-gradient(135deg, #7c3aed 0%, #d946ef 100%)' }}
                                  disabled={isBusy}
                                  onClick={() => handleUpgrade(u.id)}
                                  title="Upgrade user to Pro (unlock all 35 templates)"
                                >
                                  <Crown size={13} color="#fef08a" /> <span>Upgrade to Pro</span>
                                </button>
                              ) : (
                                <button
                                  id={`btn-downgrade-user-${u.id}`}
                                  className="btn btn-sm btn-outline row"
                                  style={{ padding: '4px 10px', fontSize: '0.78rem', gap: 4, color: '#475569' }}
                                  disabled={isBusy}
                                  onClick={() => handleDowngrade(u.id)}
                                  title="Downgrade user to Free plan"
                                >
                                  <ArrowDownRight size={13} /> <span>Downgrade</span>
                                </button>
                              )}

                              <button
                                id={`btn-extend-trial-${u.id}`}
                                className="btn btn-sm btn-ghost row"
                                style={{ padding: '4px 8px', fontSize: '0.78rem', gap: 4, color: '#0284c7', background: '#f0f9ff' }}
                                disabled={isBusy}
                                onClick={() => handleExtendTrial(u.id)}
                                title="Add 30 days to user's trial"
                              >
                                <Calendar size={13} /> <span>+30d Trial</span>
                              </button>

                              <button
                                className="btn btn-sm btn-ghost"
                                style={{ padding: '4px 8px', fontSize: '0.78rem', color: u.is_admin ? '#7c3aed' : '#64748b' }}
                                disabled={isBusy}
                                onClick={() => handleToggleAdmin(u.id)}
                                title={u.is_admin ? 'Revoke Admin' : 'Make Admin'}
                              >
                                <Shield size={13} />
                              </button>

                              <button
                                className="btn btn-sm btn-ghost btn-danger"
                                style={{ padding: '4px 8px' }}
                                disabled={isBusy}
                                onClick={() => handleDeleteUser(u.id, u.name)}
                                title="Delete User"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Razorpay Payments Table */
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: '#f8fafc' }}>
              <div className="row between">
                <div>
                  <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>Razorpay Payment Transactions</strong>
                  <div className="muted small">Verified payments collected via Razorpay payment gateway</div>
                </div>
                <div className="badge-pro" style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }}>
                  <IndianRupee size={13} /> Total Revenue: ₹{(metrics.total_revenue ?? 0).toLocaleString()}
                </div>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '1px solid var(--border)', color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '12px 18px' }}>User</th>
                    <th style={{ padding: '12px 16px' }}>Razorpay Payment ID</th>
                    <th style={{ padding: '12px 16px' }}>Order ID</th>
                    <th style={{ padding: '12px 16px' }}>Amount</th>
                    <th style={{ padding: '12px 16px' }}>Date</th>
                    <th style={{ padding: '12px 18px', textAlign: 'right' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: 36, textAlign: 'center', color: '#64748b' }}>
                        No Razorpay transactions recorded yet. When users upgrade via Razorpay, transaction logs appear here.
                      </td>
                    </tr>
                  ) : (
                    payments.map((p) => (
                      <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '14px 18px' }}>
                          <strong style={{ color: '#0f172a' }}>{p.user?.name || `User #${p.user_id}`}</strong>
                          <div className="muted small">{p.user?.email}</div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <code style={{ fontSize: '0.8rem', background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>
                            {p.razorpay_payment_id || 'N/A'}
                          </code>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <code style={{ fontSize: '0.78rem', color: '#64748b' }}>
                            {p.razorpay_order_id || 'N/A'}
                          </code>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <strong style={{ color: '#059669', fontSize: '0.95rem' }}>₹{Number(p.amount).toFixed(2)}</strong>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span className="small muted">{new Date(p.created_at).toLocaleString()}</span>
                        </td>
                        <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                          <span className="badge" style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', fontSize: '0.72rem', padding: '2px 8px' }}>
                            <Check size={11} /> Captured
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
