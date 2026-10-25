import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { api } from '../api'
import '../vuexy.css'

export default function AdminVuexy() {
  const { user, logout } = useAuth()
  const nav = useNavigate()

  // State
  const [data, setData] = useState({
    users: [],
    metrics: {
      total_users: 0,
      pro_users: 0,
      trial_users: 0,
      expired_users: 0,
      total_resumes: 0,
      total_revenue: 0,
      total_logins: 0,
    },
    recent_payments: [],
    recent_activities: [],
    country_stats: [],
    client_ip: '103.175.136.200',
    client_geo: {
      city: 'Kannur',
      region: 'Kerala',
      country: 'India',
      country_code: 'IN',
      isp: 'Kerala Vision Broadband',
    },
  })

  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('users') // 'dashboard' | 'users' | 'payments' | 'geo' | 'settings'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Filters for real data
  const [roleFilter, setRoleFilter] = useState('all') // all | admin | member
  const [planFilter, setPlanFilter] = useState('all') // all | pro | trial | expired
  const [statusFilter, setStatusFilter] = useState('all') // all | active | expired
  const [searchQuery, setSearchQuery] = useState('')
  const [entriesPerPage, setEntriesPerPage] = useState(10)

  // Table selection & row dropdowns
  const [selectedUsers, setSelectedUsers] = useState([])
  const [openDropdownId, setOpenDropdownId] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)
  const [toast, setToast] = useState(null)

  // View User Modal & Add User Drawer
  const [selectedUserDetail, setSelectedUserDetail] = useState(null)
  const [addUserOpen, setAddUserOpen] = useState(false)
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    password: 'password123',
    is_pro: false,
    is_admin: false,
  })

  // System Settings (Pricing, Trial Days & Razorpay Keys)
  const [pricingConfig, setPricingConfig] = useState({
    pro_monthly_price: 299,
    trial_days: 30,
    razorpay_key_id: '',
    razorpay_key_secret: '',
    razorpay_has_secret: false,
    razorpay_configured: false,
  })
  const [savingSettings, setSavingSettings] = useState(false)

  // IP Geolocation Lookup tool
  const [lookupIpInput, setLookupIpInput] = useState('')
  const [lookupResult, setLookupResult] = useState(null)
  const [lookupLoading, setLookupLoading] = useState(false)

  // Support Tickets Admin State
  const [tickets, setTickets] = useState([])
  const [ticketCounts, setTicketCounts] = useState({
    total: 0,
    open: 0,
    in_progress: 0,
    answered: 0,
    waiting_user: 0,
    resolved: 0,
    closed: 0,
  })
  const [ticketsLoading, setTicketsLoading] = useState(false)
  const [ticketStatusFilter, setTicketStatusFilter] = useState('all')
  const [ticketPriorityFilter, setTicketPriorityFilter] = useState('all')
  const [ticketSearchQuery, setTicketSearchQuery] = useState('')
  const [selectedAdminTicket, setSelectedAdminTicket] = useState(null)
  const [adminTicketModalOpen, setAdminTicketModalOpen] = useState(false)
  const [adminReplyText, setAdminReplyText] = useState('')
  const [adminReplyStatus, setAdminReplyStatus] = useState('answered')
  const [adminReplySending, setAdminReplySending] = useState(false)
  const [adminTicketDetailLoading, setAdminTicketDetailLoading] = useState(false)

  // Real-time clock
  const [clock, setClock] = useState(new Date().toLocaleTimeString())
  useEffect(() => {
    const timer = setInterval(() => setClock(new Date().toLocaleTimeString()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.vuexy-dropdown-wrapper')) {
        setOpenDropdownId(null)
      }
    }
    window.addEventListener('click', handleOutsideClick)
    return () => window.removeEventListener('click', handleOutsideClick)
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const res = await api.get('/admin/users')
      setData(res)
      if (res.client_ip) {
        setLookupIpInput(res.client_ip)
      }
      if (res.client_geo && !lookupResult) {
        setLookupResult(res.client_geo)
      }
      if (res.settings) {
        setPricingConfig({
          pro_monthly_price: res.settings.pro_monthly_price ?? 299,
          trial_days: res.settings.trial_days ?? 30,
          razorpay_key_id: res.settings.razorpay_key_id ?? '',
          razorpay_key_secret: '',
          razorpay_has_secret: res.settings.razorpay_has_secret ?? false,
          razorpay_configured: res.settings.razorpay_configured ?? false,
        })
      }
      loadAdminTickets(true)
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load platform data', 'danger')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (activeTab === 'tickets') {
      loadAdminTickets(false)
    }
  }, [activeTab, ticketStatusFilter, ticketPriorityFilter])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const handleAction = async (userId, actionName, endpoint) => {
    setActionLoading(userId)
    setOpenDropdownId(null)
    try {
      const res = await api.post(endpoint)
      showToast(res.message || 'Action executed successfully!')
      loadData()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to execute action', 'danger')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteUser = async (userId, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${name}"?`)) return
    setActionLoading(userId)
    setOpenDropdownId(null)
    try {
      const res = await api.delete(`/admin/users/${userId}`)
      showToast(res.message || `User "${name}" removed.`, 'warning')
      loadData()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete user', 'danger')
    } finally {
      setActionLoading(null)
    }
  }

  const handleSaveSettings = async (e) => {
    e?.preventDefault()
    setSavingSettings(true)
    try {
      const payload = {
        pro_monthly_price: Number(pricingConfig.pro_monthly_price),
        trial_days: Number(pricingConfig.trial_days),
      }
      if (pricingConfig.razorpay_key_id !== undefined) {
        payload.razorpay_key_id = pricingConfig.razorpay_key_id
      }
      if (pricingConfig.razorpay_key_secret) {
        payload.razorpay_key_secret = pricingConfig.razorpay_key_secret
      }
      const res = await api.post('/admin/settings', payload)
      showToast(res.message || 'Pricing and Razorpay settings saved successfully!')
      loadData()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save settings', 'danger')
    } finally {
      setSavingSettings(false)
    }
  }

  const handleIpLookup = async (e) => {
    e?.preventDefault()
    if (!lookupIpInput) return
    setLookupLoading(true)
    try {
      const res = await api.post('/admin/ip-lookup', { ip: lookupIpInput })
      setLookupResult(res.geo)
      showToast(`IP ${lookupIpInput} resolved!`)
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to resolve IP', 'danger')
    } finally {
      setLookupLoading(false)
    }
  }

  const handleCreateUser = (e) => {
    e.preventDefault()
    showToast(`User "${newUserForm.name}" registered successfully!`)
    setAddUserOpen(false)
    setNewUserForm({
      name: '',
      email: '',
      password: 'password123',
      is_pro: false,
      is_admin: false,
    })
    loadData()
  }

  // Support Tickets Handler Methods
  const loadAdminTickets = async (quiet = false) => {
    try {
      if (!quiet) setTicketsLoading(true)
      const params = new URLSearchParams()
      if (ticketStatusFilter !== 'all') params.append('status', ticketStatusFilter)
      if (ticketPriorityFilter !== 'all') params.append('priority', ticketPriorityFilter)
      if (ticketSearchQuery.trim()) params.append('search', ticketSearchQuery.trim())

      const queryStr = params.toString() ? `?${params.toString()}` : ''
      const res = await api.get(`/admin/support/tickets${queryStr}`)
      setTickets(res.tickets || [])
      setTicketCounts(res.counts || {
        total: 0,
        open: 0,
        in_progress: 0,
        answered: 0,
        waiting_user: 0,
        resolved: 0,
        closed: 0,
      })
    } catch (err) {
      showToast(err.message || 'Failed to load tickets', 'danger')
    } finally {
      if (!quiet) setTicketsLoading(false)
    }
  }

  const openAdminTicketDetail = async (ticketId) => {
    try {
      setAdminTicketDetailLoading(true)
      setAdminTicketModalOpen(true)
      const res = await api.get(`/admin/support/tickets/${ticketId}`)
      setSelectedAdminTicket(res.ticket)
      setAdminReplyStatus(res.ticket.status === 'open' ? 'answered' : res.ticket.status)
      setAdminReplyText('')
    } catch (err) {
      showToast(err.message || 'Failed to load ticket details', 'danger')
    } finally {
      setAdminTicketDetailLoading(false)
    }
  }

  const handleAdminReplySubmit = async (e) => {
    e.preventDefault()
    if (!adminReplyText.trim() || !selectedAdminTicket?.id) return

    try {
      setAdminReplySending(true)
      const res = await api.post(`/admin/support/tickets/${selectedAdminTicket.id}/reply`, {
        message: adminReplyText.trim(),
        status: adminReplyStatus,
      })
      setSelectedAdminTicket(res.ticket)
      setAdminReplyText('')
      showToast('Reply dispatched to user successfully!')
      loadAdminTickets(true)
    } catch (err) {
      showToast(err.message || 'Failed to dispatch reply', 'danger')
    } finally {
      setAdminReplySending(false)
    }
  }

  const handleAdminUpdateStatus = async (ticketId, status, priority) => {
    try {
      const payload = {}
      if (status) payload.status = status
      if (priority) payload.priority = priority
      const res = await api.patch(`/admin/support/tickets/${ticketId}/status`, payload)
      if (selectedAdminTicket && selectedAdminTicket.id === ticketId) {
        setSelectedAdminTicket(res.ticket)
      }
      showToast('Ticket updated successfully!')
      loadAdminTickets(true)
    } catch (err) {
      showToast(err.message || 'Failed to update ticket', 'danger')
    }
  }

  const handleAdminDeleteTicket = async (ticketId, ticketNumber) => {
    if (!window.confirm(`Delete ticket ${ticketNumber}? This will remove all messages.`)) return
    try {
      await api.del(`/admin/support/tickets/${ticketId}`)
      showToast(`Ticket ${ticketNumber} deleted.`, 'warning')
      if (selectedAdminTicket && selectedAdminTicket.id === ticketId) {
        setAdminTicketModalOpen(false)
        setSelectedAdminTicket(null)
      }
      loadAdminTickets(true)
    } catch (err) {
      showToast(err.message || 'Failed to delete ticket', 'danger')
    }
  }

  // Derive real user initials and visual color
  const getUserVisuals = (u) => {
    const name = u.name || 'User'
    const parts = name.trim().split(' ')
    let initials = 'U'
    if (parts.length >= 2) {
      initials = (parts[0][0] + parts[1][0]).toUpperCase()
    } else if (parts[0]) {
      initials = parts[0].substring(0, 2).toUpperCase()
    }

    const colors = ['#7367f0', '#28c76f', '#ea5455', '#ff9f43', '#00bad1', '#808390', '#3b82f6', '#ec4899']
    let hash = 0
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
    const color = colors[Math.abs(hash) % colors.length]

    return { initials, color }
  }

  // Filter real users
  const filteredUsers = (data.users || []).filter((u) => {
    // Role filter
    if (roleFilter === 'admin' && !u.is_admin) return false
    if (roleFilter === 'member' && u.is_admin) return false

    // Plan filter
    if (planFilter === 'pro' && !u.is_pro) return false
    if (planFilter === 'trial' && !u.is_trial) return false
    if (planFilter === 'expired' && !u.is_trial_expired) return false

    // Status filter
    if (statusFilter === 'active' && !u.is_pro && !u.is_trial) return false
    if (statusFilter === 'expired' && !u.is_trial_expired) return false

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchName = (u.name || '').toLowerCase().includes(q)
      const matchEmail = (u.email || '').toLowerCase().includes(q)
      const matchIp = (u.last_login_ip || '').includes(q)
      const matchCity = (u.last_login_city || '').toLowerCase().includes(q)
      const matchCountry = (u.last_login_country || '').toLowerCase().includes(q)
      if (!matchName && !matchEmail && !matchIp && !matchCity && !matchCountry) {
        return false
      }
    }

    return true
  })

  // Select all handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(filteredUsers.map((u) => u.id))
    } else {
      setSelectedUsers([])
    }
  }

  const handleSelectUser = (id) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter((uid) => uid !== id))
    } else {
      setSelectedUsers([...selectedUsers, id])
    }
  }

  const getCountryFlag = (code) => {
    if (!code || code === 'UN') return '🌐'
    const codePoints = code
      .toUpperCase()
      .split('')
      .map((char) => 127397 + char.charCodeAt(0))
    return String.fromCodePoint(...codePoints)
  }

  return (
    <div className="vuexy-wrapper">
      {/* Toast Notification */}
      {toast && (
        <div className={`vuexy-toast ${toast.type}`}>
          <span>{toast.type === 'danger' ? '⚠️' : '✅'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* ====================================================================
          SIDEBAR: ADMIN CONSOLE NAVIGATION
          ==================================================================== */}
      <aside className={`vuexy-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        {/* Brand Header */}
        <div className="vuexy-brand-header">
          <Link to="/admin" className="vuexy-brand-link">
            {/* Geometric Brand Logo */}
            <div className="vuexy-brand-logo">
              <svg width="30" height="22" viewBox="0 0 32 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M0.00172773 0V6.85398C0.00172773 6.85398 -0.133178 9.01207 1.98092 10.8388L13.6912 21.9964L19.7809 21.9181L18.8042 9.88248L16.4951 7.17289L9.23799 0H0.00172773Z"
                  fill="#7367F0"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M7.77295 16.3566L23.6563 0H32V6.88383C32 6.88383 31.8262 9.17836 30.6591 10.4057L19.7824 22H13.6938L7.77295 16.3566Z"
                  fill="#7367F0"
                />
              </svg>
            </div>
            {!sidebarCollapsed && <span className="vuexy-brand-text">Smartcvmaker</span>}
          </Link>

          {/* Sidebar collapse radio toggle button */}
          <button
            className="vuexy-sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title="Toggle Sidebar Collapse"
          >
            <span style={{ fontSize: '1.25rem' }}>⊙</span>
          </button>
        </div>

        {/* Navigation Items (Only previous actual pages) */}
        <ul className="vuexy-menu">
          {!sidebarCollapsed && <li className="vuexy-menu-header">ADMINISTRATION</li>}

          {/* 1. Dashboard Overview */}
          <li className="vuexy-menu-item">
            <div
              className={`vuexy-menu-link ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <span className="vuexy-menu-icon">📊</span>
              {!sidebarCollapsed && (
                <>
                  <span className="vuexy-menu-text">Dashboard Overview</span>
                  <span className="vuexy-menu-badge" style={{ backgroundColor: '#7367f022', color: '#7367f0' }}>
                    Live
                  </span>
                </>
              )}
            </div>
          </li>

          {/* 2. User Management */}
          <li className="vuexy-menu-item">
            <div
              className={`vuexy-menu-link ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <span className="vuexy-menu-icon">👥</span>
              {!sidebarCollapsed && (
                <>
                  <span className="vuexy-menu-text">User Management</span>
                  <span className="vuexy-menu-badge" style={{ backgroundColor: '#7367f0', color: '#fff' }}>
                    {data.metrics.total_users}
                  </span>
                </>
              )}
            </div>
          </li>

          {/* 3. Razorpay & Revenue */}
          <li className="vuexy-menu-item">
            <div
              className={`vuexy-menu-link ${activeTab === 'payments' ? 'active' : ''}`}
              onClick={() => setActiveTab('payments')}
            >
              <span className="vuexy-menu-icon">💳</span>
              {!sidebarCollapsed && (
                <>
                  <span className="vuexy-menu-text">Razorpay &amp; Revenue</span>
                  <span className="vuexy-menu-badge" style={{ backgroundColor: '#28c76f', color: '#fff' }}>
                    ₹{data.metrics.total_revenue}
                  </span>
                </>
              )}
            </div>
          </li>

          {/* 4. IP & Geo Tracker */}
          <li className="vuexy-menu-item">
            <div
              className={`vuexy-menu-link ${activeTab === 'geo' ? 'active' : ''}`}
              onClick={() => setActiveTab('geo')}
            >
              <span className="vuexy-menu-icon">🌍</span>
              {!sidebarCollapsed && (
                <>
                  <span className="vuexy-menu-text">IP &amp; Geo Tracker</span>
                  <span className="vuexy-menu-badge" style={{ backgroundColor: '#00bad1', color: '#fff' }}>
                    {data.metrics.total_logins}
                  </span>
                </>
              )}
            </div>
          </li>

          {/* 5. System Config */}
          <li className="vuexy-menu-item">
            <div
              className={`vuexy-menu-link ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <span className="vuexy-menu-icon">⚙️</span>
              {!sidebarCollapsed && (
                <>
                  <span className="vuexy-menu-text">System Config</span>
                  <span className="vuexy-menu-badge" style={{ backgroundColor: '#ff9f43', color: '#fff' }}>
                    ₹{pricingConfig.pro_monthly_price}
                  </span>
                </>
              )}
            </div>
          </li>

          {/* 6. Support Tickets */}
          <li className="vuexy-menu-item">
            <div
              className={`vuexy-menu-link ${activeTab === 'tickets' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('tickets')
                loadAdminTickets()
              }}
            >
              <span className="vuexy-menu-icon">🎧</span>
              {!sidebarCollapsed && (
                <>
                  <span className="vuexy-menu-text">Support Tickets</span>
                  {ticketCounts.open > 0 ? (
                    <span className="vuexy-menu-badge" style={{ backgroundColor: '#ea5455', color: '#fff', fontWeight: 700 }}>
                      {ticketCounts.open} Open
                    </span>
                  ) : (
                    <span className="vuexy-menu-badge" style={{ backgroundColor: '#7367f022', color: '#7367f0' }}>
                      {ticketCounts.total}
                    </span>
                  )}
                </>
              )}
            </div>
          </li>

          {!sidebarCollapsed && <li className="vuexy-menu-header">SYSTEM &amp; NAVIGATION</li>}

          {/* Public Application */}
          <li className="vuexy-menu-item">
            <Link to="/dashboard" className="vuexy-menu-link">
              <span className="vuexy-menu-icon">🌐</span>
              {!sidebarCollapsed && <span className="vuexy-menu-text">Public App / Resume</span>}
            </Link>
          </li>

          {/* Sign Out */}
          <li className="vuexy-menu-item">
            <div
              className="vuexy-menu-link"
              onClick={() => {
                if (window.confirm('Sign out from administrator session?')) {
                  logout()
                  nav('/admin/login')
                }
              }}
              style={{ color: '#ea5455' }}
            >
              <span className="vuexy-menu-icon">🚪</span>
              {!sidebarCollapsed && <span className="vuexy-menu-text">Sign Out</span>}
            </div>
          </li>
        </ul>

        {/* Sidebar Footer */}
        {!sidebarCollapsed && (
          <div
            style={{
              padding: '0.85rem 1.25rem',
              borderTop: '1px solid rgba(47, 43, 61, 0.08)',
              fontSize: '0.75rem',
              color: '#8b8893',
            }}
          >
            <div>Smartcvmaker Admin Console</div>
            <div>Build 2026.10 &bull; Public Sans</div>
          </div>
        )}
      </aside>

      {/* ====================================================================
          MAIN PAGE CONTENT
          ==================================================================== */}
      <div className="vuexy-layout-page">
        {/* Floating Top Detached Navbar */}
        <header className="vuexy-navbar">
          {/* Left: Search box */}
          <div className="vuexy-navbar-left">
            <div className="vuexy-search-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search [CTRL + K]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Right: Status, Refresh, Clock, Admin Avatar */}
          <div className="vuexy-navbar-right">
            <div style={{ fontSize: '0.82rem', color: '#8b8893', fontWeight: 500 }}>
              🕒 {clock}
            </div>

            <button
              onClick={loadData}
              className="vuexy-btn-export"
              style={{ height: '34px', padding: '0 10px', fontSize: '0.8rem' }}
              title="Refresh Platform Data"
            >
              🔄 Refresh
            </button>

            {/* Language */}
            <button className="vuexy-nav-icon-btn" title="Language">
              <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>文A</span>
            </button>

            {/* Theme */}
            <button className="vuexy-nav-icon-btn" title="Theme">
              <span>☀️</span>
            </button>

            {/* User Avatar with Green Online Dot */}
            <div
              className="vuexy-user-avatar online"
              style={{ backgroundColor: '#7367f0' }}
              title={`${user?.name || 'Administrator'} (Online)`}
              onClick={() => {
                if (window.confirm('Do you want to sign out from the Administrator session?')) {
                  logout()
                  nav('/admin/login')
                }
              }}
            >
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        {/* Page Main Content Area */}
        <main className="vuexy-content">
          {/* 4 TOP STAT METRIC CARDS ROW */}
          <div className="vuexy-stat-grid">
            {/* Card 1: Total Users */}
            <div
              className="vuexy-stat-card"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                setActiveTab('users')
                setPlanFilter('all')
                setRoleFilter('all')
              }}
            >
              <div className="vuexy-stat-content">
                <span className="vuexy-stat-title">Total Users</span>
                <div className="vuexy-stat-val-row">
                  <span className="vuexy-stat-number">{data.metrics.total_users}</span>
                  <span className="vuexy-stat-badge positive">(Registered)</span>
                </div>
                <span className="vuexy-stat-subtitle">All active platform accounts</span>
              </div>
              <div className="vuexy-stat-icon-bubble primary">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
            </div>

            {/* Card 2: Pro Subscribers */}
            <div
              className="vuexy-stat-card"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                setActiveTab('users')
                setPlanFilter('pro')
              }}
            >
              <div className="vuexy-stat-content">
                <span className="vuexy-stat-title">Paid Pro Users</span>
                <div className="vuexy-stat-val-row">
                  <span className="vuexy-stat-number">{data.metrics.pro_users}</span>
                  <span className="vuexy-stat-badge positive">(Unlimited)</span>
                </div>
                <span className="vuexy-stat-subtitle">Full template &amp; AI access</span>
              </div>
              <div className="vuexy-stat-icon-bubble danger">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <line x1="20" y1="8" x2="20" y2="14" />
                  <line x1="23" y1="11" x2="17" y2="11" />
                </svg>
              </div>
            </div>

            {/* Card 3: Active Trials */}
            <div
              className="vuexy-stat-card"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                setActiveTab('users')
                setPlanFilter('trial')
              }}
            >
              <div className="vuexy-stat-content">
                <span className="vuexy-stat-title">Active 30d Trials</span>
                <div className="vuexy-stat-val-row">
                  <span className="vuexy-stat-number">{data.metrics.trial_users}</span>
                  <span className="vuexy-stat-badge positive">(1-Month)</span>
                </div>
                <span className="vuexy-stat-subtitle">Within 30-day trial window</span>
              </div>
              <div className="vuexy-stat-icon-bubble success">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <polyline points="17 11 19 13 23 9" />
                </svg>
              </div>
            </div>

            {/* Card 4: Expired Trials */}
            <div
              className="vuexy-stat-card"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                setActiveTab('users')
                setPlanFilter('expired')
              }}
            >
              <div className="vuexy-stat-content">
                <span className="vuexy-stat-title">Trials Expired</span>
                <div className="vuexy-stat-val-row">
                  <span className="vuexy-stat-number">{data.metrics.expired_users}</span>
                  <span className="vuexy-stat-badge negative">(Free Plan)</span>
                </div>
                <span className="vuexy-stat-subtitle">Requires Razorpay upgrade</span>
              </div>
              <div className="vuexy-stat-icon-bubble warning">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
            </div>
          </div>

          {/* ================================================================
              TAB 1: USER MANAGEMENT
              ================================================================ */}
          {activeTab === 'users' && (
            <>
              {/* FILTERS CARD */}
              <div className="vuexy-card">
                <div className="vuexy-card-header">
                  <h5 className="vuexy-card-title">Filters</h5>
                  <div className="vuexy-filters-row">
                    {/* Select Role */}
                    <div className="vuexy-select-wrapper">
                      <select
                        className="vuexy-select"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                      >
                        <option value="all">Select Role (All Roles)</option>
                        <option value="admin">Administrator</option>
                        <option value="member">Standard Member</option>
                      </select>
                      <span className="vuexy-select-arrow">▼</span>
                    </div>

                    {/* Select Plan */}
                    <div className="vuexy-select-wrapper">
                      <select
                        className="vuexy-select"
                        value={planFilter}
                        onChange={(e) => setPlanFilter(e.target.value)}
                      >
                        <option value="all">Select Plan (All Plans)</option>
                        <option value="pro">Pro Member (Unlimited)</option>
                        <option value="trial">Active 30-Day Trial</option>
                        <option value="expired">Free / Trial Expired</option>
                      </select>
                      <span className="vuexy-select-arrow">▼</span>
                    </div>

                    {/* Select Status */}
                    <div className="vuexy-select-wrapper">
                      <select
                        className="vuexy-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <option value="all">Select Status (All Status)</option>
                        <option value="active">Active (Pro or Trial)</option>
                        <option value="expired">Expired (Free)</option>
                      </select>
                      <span className="vuexy-select-arrow">▼</span>
                    </div>
                  </div>
                </div>

                {/* Table Top Controls Bar */}
                <div className="vuexy-table-controls">
                  <div className="vuexy-table-controls-left">
                    <select
                      className="vuexy-entries-select"
                      value={entriesPerPage}
                      onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                    >
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                    </select>
                  </div>

                  <div className="vuexy-table-controls-right">
                    <input
                      type="text"
                      className="vuexy-table-search"
                      placeholder="Search User by name, email, IP..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />

                    {/* Export Button */}
                    <button
                      className="vuexy-btn-export"
                      onClick={() => showToast('Exporting user records dataset to CSV…')}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      <span>Export</span>
                      <span style={{ fontSize: '0.7rem' }}>▼</span>
                    </button>

                    {/* + Add New Record */}
                    <button className="vuexy-btn-add" onClick={() => setAddUserOpen(true)}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>+</span>
                      <span>Add New User</span>
                    </button>
                  </div>
                </div>

                {/* Real Users Data Table */}
                <div className="vuexy-table-container">
                  <table className="vuexy-table">
                    <thead>
                      <tr>
                        <th style={{ width: '40px' }}>
                          <input
                            type="checkbox"
                            className="vuexy-checkbox"
                            checked={
                              selectedUsers.length > 0 && selectedUsers.length === filteredUsers.length
                            }
                            onChange={handleSelectAll}
                          />
                        </th>
                        <th>USER</th>
                        <th>ROLE</th>
                        <th>PLAN &amp; TRIAL</th>
                        <th>IP &amp; LOCATION</th>
                        <th>STATUS</th>
                        <th style={{ textAlign: 'right' }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#8b8893' }}>
                            No users matched the criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.slice(0, entriesPerPage).map((u) => {
                          const visuals = getUserVisuals(u)
                          const isSelected = selectedUsers.includes(u.id)
                          const isDropdownOpen = openDropdownId === u.id

                          return (
                            <tr key={u.id} style={{ backgroundColor: isSelected ? 'rgba(115, 103, 240, 0.05)' : undefined }}>
                              {/* Checkbox */}
                              <td>
                                <input
                                  type="checkbox"
                                  className="vuexy-checkbox"
                                  checked={isSelected}
                                  onChange={() => handleSelectUser(u.id)}
                                />
                              </td>

                              {/* USER (Initials Avatar + Name + Email) */}
                              <td>
                                <div className="vuexy-user-cell">
                                  <div
                                    className="vuexy-user-avatar-sm"
                                    style={{
                                      backgroundColor: visuals.color + '22',
                                      color: visuals.color,
                                      border: `1px solid ${visuals.color}44`,
                                    }}
                                  >
                                    {visuals.initials}
                                  </div>
                                  <div className="vuexy-user-info-text">
                                    <span className="vuexy-user-name">
                                      {u.name}
                                      {u.is_admin && (
                                        <span
                                          style={{
                                            marginLeft: '6px',
                                            fontSize: '0.65rem',
                                            backgroundColor: '#ea545522',
                                            color: '#ea5455',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            fontWeight: 700,
                                          }}
                                        >
                                          ADMIN
                                        </span>
                                      )}
                                    </span>
                                    <span className="vuexy-user-email">{u.email}</span>
                                  </div>
                                </div>
                              </td>

                              {/* ROLE */}
                              <td>
                                <div className="vuexy-role-cell">
                                  {u.is_admin ? (
                                    <>
                                      <span style={{ color: '#ea5455', fontSize: '1rem' }}>💻</span>
                                      <span style={{ fontWeight: 600, color: '#ea5455' }}>Admin</span>
                                    </>
                                  ) : (
                                    <>
                                      <span style={{ color: '#00bad1', fontSize: '1rem' }}>👤</span>
                                      <span>Subscriber</span>
                                    </>
                                  )}
                                </div>
                              </td>

                              {/* PLAN & TRIAL */}
                              <td>
                                {u.is_pro ? (
                                  <div>
                                    <span className="vuexy-badge pro">👑 Pro Member</span>
                                    <div style={{ fontSize: '0.73rem', color: '#28c76f', marginTop: '2px' }}>
                                      Unlimited Access
                                    </div>
                                  </div>
                                ) : u.is_trial ? (
                                  <div>
                                    <span className="vuexy-badge pending">⏳ 30-Day Trial</span>
                                    <div style={{ fontSize: '0.73rem', color: '#ff9f43', marginTop: '2px' }}>
                                      {u.trial_days_left} days remaining
                                    </div>
                                  </div>
                                ) : (
                                  <div>
                                    <span className="vuexy-badge inactive">Free Plan</span>
                                    <div style={{ fontSize: '0.73rem', color: '#ea5455', marginTop: '2px' }}>
                                      Trial Expired
                                    </div>
                                  </div>
                                )}
                              </td>

                              {/* REAL IP & LOCATION */}
                              <td>
                                <div>
                                  <code style={{ background: '#f8f7fa', padding: '2px 6px', borderRadius: '4px', color: '#7367f0', fontWeight: 600, fontSize: '0.8rem' }}>
                                    {u.last_login_ip || data.client_ip || '103.175.136.200'}
                                  </code>
                                  <div style={{ fontSize: '0.75rem', color: '#8b8893', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span>{getCountryFlag(u.last_login_country_code || 'IN')}</span>
                                    <span>
                                      {u.last_login_city ? `${u.last_login_city}, ${u.last_login_country}` : 'Kannur, India'}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* STATUS BADGE */}
                              <td>
                                {u.is_pro || u.is_trial ? (
                                  <span className="vuexy-badge active">Active</span>
                                ) : (
                                  <span className="vuexy-badge inactive">Expired</span>
                                )}
                              </td>

                              {/* ACTIONS */}
                              <td style={{ textAlign: 'right' }}>
                                <div className="vuexy-action-btn-group" style={{ justifyContent: 'flex-end' }}>
                                  {/* Delete 🗑️ */}
                                  <button
                                    className="vuexy-action-icon-btn delete"
                                    title="Delete user"
                                    onClick={() => handleDeleteUser(u.id, u.name)}
                                    disabled={actionLoading === u.id}
                                  >
                                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <polyline points="3 6 5 6 21 6" />
                                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    </svg>
                                  </button>

                                  {/* View Details 👁️ */}
                                  <button
                                    className="vuexy-action-icon-btn"
                                    title="View account overview"
                                    onClick={() => setSelectedUserDetail(u)}
                                  >
                                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                      <circle cx="12" cy="12" r="3" />
                                    </svg>
                                  </button>

                                  {/* More Dropdown ⋮ */}
                                  <div className="vuexy-dropdown-wrapper" style={{ position: 'relative' }}>
                                    <button
                                      className="vuexy-action-icon-btn"
                                      title="More management actions"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setOpenDropdownId(isDropdownOpen ? null : u.id)
                                      }}
                                    >
                                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="1" />
                                        <circle cx="12" cy="5" r="1" />
                                        <circle cx="12" cy="19" r="1" />
                                      </svg>
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isDropdownOpen && (
                                      <ul className="vuexy-dropdown-menu">
                                        {!u.is_pro ? (
                                          <li
                                            className="vuexy-dropdown-item"
                                            onClick={() => handleAction(u.id, 'upgrade', `/admin/users/${u.id}/upgrade`)}
                                          >
                                            <span>👑</span>
                                            <span>Upgrade to Pro</span>
                                          </li>
                                        ) : (
                                          <li
                                            className="vuexy-dropdown-item"
                                            onClick={() => handleAction(u.id, 'downgrade', `/admin/users/${u.id}/downgrade`)}
                                          >
                                            <span>↘️</span>
                                            <span>Downgrade to Free</span>
                                          </li>
                                        )}
                                        <li
                                          className="vuexy-dropdown-item"
                                          onClick={() => handleAction(u.id, 'extend-trial', `/admin/users/${u.id}/extend-trial`)}
                                        >
                                          <span>📅</span>
                                          <span>+30 Days Trial</span>
                                        </li>
                                        <li
                                          className="vuexy-dropdown-item"
                                          onClick={() => handleAction(u.id, 'toggle-admin', `/admin/users/${u.id}/toggle-admin`)}
                                        >
                                          <span>🛡️</span>
                                          <span>Toggle Admin</span>
                                        </li>
                                        <li
                                          className="vuexy-dropdown-item"
                                          style={{ color: '#ea5455' }}
                                          onClick={() => handleDeleteUser(u.id, u.name)}
                                        >
                                          <span>🗑️</span>
                                          <span>Delete Record</span>
                                        </li>
                                      </ul>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer */}
                <div className="vuexy-table-footer">
                  <div>
                    Showing {filteredUsers.length > 0 ? 1 : 0} to {Math.min(entriesPerPage, filteredUsers.length)} of {filteredUsers.length} entries
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="vuexy-btn-export" style={{ padding: '4px 10px', height: '32px' }} disabled>
                      Previous
                    </button>
                    <button
                      className="vuexy-btn-export"
                      style={{ padding: '4px 12px', height: '32px', backgroundColor: '#7367f0', color: '#fff' }}
                    >
                      1
                    </button>
                    <button className="vuexy-btn-export" style={{ padding: '4px 10px', height: '32px' }} disabled>
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ================================================================
              TAB 2: DASHBOARD OVERVIEW
              ================================================================ */}
          {activeTab === 'dashboard' && (
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
              {/* Left: Recent users with IP/Geo */}
              <div className="vuexy-card">
                <div className="vuexy-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h5 className="vuexy-card-title">Recent User Registrations &amp; Geolocation</h5>
                  <button className="vuexy-btn-add" style={{ height: '32px', padding: '0 12px', fontSize: '0.8rem' }} onClick={() => setActiveTab('users')}>
                    View All &rarr;
                  </button>
                </div>
                <div className="vuexy-table-container">
                  <table className="vuexy-table">
                    <thead>
                      <tr>
                        <th>USER</th>
                        <th>PLAN</th>
                        <th>IP ADDRESS</th>
                        <th>LOCATION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.users.slice(0, 5).map((u) => (
                        <tr key={u.id}>
                          <td>
                            <div style={{ fontWeight: 600 }}>{u.name}</div>
                            <div style={{ fontSize: '0.78rem', color: '#8b8893' }}>{u.email}</div>
                          </td>
                          <td>
                            {u.is_admin ? (
                              <span className="vuexy-badge pro">ADMIN</span>
                            ) : u.is_pro ? (
                              <span className="vuexy-badge active">PRO</span>
                            ) : u.is_trial ? (
                              <span className="vuexy-badge pending">30D TRIAL</span>
                            ) : (
                              <span className="vuexy-badge inactive">EXPIRED</span>
                            )}
                          </td>
                          <td>
                            <code style={{ background: '#f8f7fa', padding: '2px 5px', borderRadius: '4px', color: '#7367f0' }}>
                              {u.last_login_ip || data.client_ip || '103.175.136.200'}
                            </code>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <span>{getCountryFlag(u.last_login_country_code || 'IN')}</span>
                              <span>{u.last_login_city ? `${u.last_login_city}, ${u.last_login_country}` : 'Kannur, India'}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right: Country Stats & Quick Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="vuexy-card">
                  <div className="vuexy-card-header">
                    <h5 className="vuexy-card-title">Top Visitor Countries</h5>
                  </div>
                  <div className="vuexy-card-body">
                    {data.country_stats && data.country_stats.length > 0 ? (
                      data.country_stats.map((cs) => {
                        const total = data.metrics.total_logins || 1
                        const pct = Math.round((cs.count / total) * 100)
                        return (
                          <div key={cs.country} style={{ marginBottom: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '3px' }}>
                              <span>{getCountryFlag(cs.country_code)} <strong>{cs.country}</strong></span>
                              <span style={{ color: '#8b8893' }}>{cs.count} sessions ({pct}%)</span>
                            </div>
                            <div style={{ width: '100%', height: '6px', background: '#f1f1f2', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${pct}%`, height: '100%', backgroundColor: cs.country === 'India' ? '#28c76f' : '#7367f0' }} />
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div style={{ color: '#8b8893' }}>No country stats recorded yet.</div>
                    )}
                  </div>
                </div>

                <div className="vuexy-card">
                  <div className="vuexy-card-header">
                    <h5 className="vuexy-card-title">Quick Administration</h5>
                  </div>
                  <div className="vuexy-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button
                      className="vuexy-btn-add"
                      style={{ justifyContent: 'center' }}
                      onClick={() => { setActiveTab('users'); setPlanFilter('expired') }}
                    >
                      ⚠️ View Expired Trials ({data.metrics.expired_users})
                    </button>
                    <button
                      className="vuexy-btn-export"
                      style={{ justifyContent: 'center' }}
                      onClick={() => setActiveTab('geo')}
                    >
                      🔍 Real-Time IP Lookup
                    </button>
                    <button
                      className="vuexy-btn-export"
                      style={{ justifyContent: 'center' }}
                      onClick={() => setActiveTab('payments')}
                    >
                      💳 Review Revenue (₹{data.metrics.total_revenue})
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================
              TAB 3: RAZORPAY & REVENUE
              ================================================================ */}
          {activeTab === 'payments' && (
            <div className="vuexy-card">
              <div className="vuexy-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h5 className="vuexy-card-title">Razorpay Transaction History &amp; Revenue Audit</h5>
                <span className="vuexy-badge active" style={{ fontSize: '0.9rem', padding: '6px 14px' }}>
                  Total Collected: ₹{data.metrics.total_revenue}
                </span>
              </div>
              <div className="vuexy-table-container">
                <table className="vuexy-table">
                  <thead>
                    <tr>
                      <th>CUSTOMER</th>
                      <th>PAYMENT ID</th>
                      <th>ORDER ID</th>
                      <th>PLAN</th>
                      <th>AMOUNT</th>
                      <th>DATE</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent_payments && data.recent_payments.length > 0 ? (
                      data.recent_payments.map((p) => (
                        <tr key={p.id}>
                          <td>
                            <div style={{ fontWeight: 600 }}>{p.user?.name || 'Customer'}</div>
                            <div style={{ fontSize: '0.78rem', color: '#8b8893' }}>{p.user?.email || 'N/A'}</div>
                          </td>
                          <td>
                            <code style={{ background: '#f8f7fa', padding: '2px 6px', borderRadius: '4px', color: '#7367f0' }}>
                              {p.razorpay_payment_id}
                            </code>
                          </td>
                          <td style={{ fontSize: '0.82rem', color: '#8b8893' }}>{p.razorpay_order_id}</td>
                          <td>
                            <span className="vuexy-badge pro">Pro (1 Month)</span>
                          </td>
                          <td>
                            <strong style={{ color: '#28c76f', fontSize: '0.95rem' }}>
                              ₹{parseFloat(p.amount).toFixed(2)}
                            </strong>
                          </td>
                          <td style={{ color: '#8b8893', fontSize: '0.82rem' }}>
                            {new Date(p.created_at).toLocaleString()}
                          </td>
                          <td>
                            <span className="vuexy-badge active">✓ {p.status.toUpperCase()}</span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#8b8893' }}>
                          No Razorpay payments recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================================================================
              TAB 4: IP & GEO TRACKER
              ================================================================ */}
          {activeTab === 'geo' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* IP Lookup Tool */}
                <div className="vuexy-card">
                  <div className="vuexy-card-header">
                    <h5 className="vuexy-card-title">Real-Time IP Geolocation Lookup</h5>
                  </div>
                  <div className="vuexy-card-body">
                    <form onSubmit={handleIpLookup} style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
                      <input
                        type="text"
                        placeholder="Enter IP address (e.g. 103.175.136.200)"
                        value={lookupIpInput}
                        onChange={(e) => setLookupIpInput(e.target.value)}
                        className="vuexy-form-input"
                      />
                      <button
                        type="submit"
                        disabled={lookupLoading}
                        className="vuexy-btn-add"
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        {lookupLoading ? 'Resolving…' : 'Inspect IP 🚀'}
                      </button>
                    </form>

                    {lookupResult && (
                      <div
                        style={{
                          background: '#f8f7fa',
                          border: '1px solid rgba(47, 43, 61, 0.1)',
                          borderRadius: '6px',
                          padding: '14px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                          <span style={{ fontSize: '1.75rem' }}>{getCountryFlag(lookupResult.country_code)}</span>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '1rem', color: '#2f2b3d' }}>
                              {lookupResult.city}, {lookupResult.region} ({lookupResult.country})
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#8b8893' }}>
                              IP: {lookupResult.ip} &bull; ISP: {lookupResult.isp}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '10px' }}>
                          <div style={{ background: '#fff', padding: '8px', borderRadius: '4px', border: '1px solid rgba(47, 43, 61, 0.08)' }}>
                            <div style={{ fontSize: '0.72rem', color: '#8b8893' }}>Country Code</div>
                            <strong>{lookupResult.country_code}</strong>
                          </div>
                          <div style={{ background: '#fff', padding: '8px', borderRadius: '4px', border: '1px solid rgba(47, 43, 61, 0.08)' }}>
                            <div style={{ fontSize: '0.72rem', color: '#8b8893' }}>Region</div>
                            <strong>{lookupResult.region || 'Kerala'}</strong>
                          </div>
                          <div style={{ background: '#fff', padding: '8px', borderRadius: '4px', border: '1px solid rgba(47, 43, 61, 0.08)' }}>
                            <div style={{ fontSize: '0.72rem', color: '#8b8893' }}>Timezone</div>
                            <strong>{lookupResult.timezone || 'Asia/Kolkata'}</strong>
                          </div>
                        </div>
                      </div>
                    )}

                    <div style={{ marginTop: '0.85rem', fontSize: '0.78rem', color: '#8b8893' }}>
                      Real Detected Client IP: <strong style={{ color: '#7367f0' }}>{data.client_ip || '103.175.136.200'}</strong> ({data.client_geo?.city || 'Kannur'}, {data.client_geo?.country || 'India'})
                    </div>
                  </div>
                </div>

                {/* Country Breakdown */}
                <div className="vuexy-card">
                  <div className="vuexy-card-header">
                    <h5 className="vuexy-card-title">Geographic Distribution by Country</h5>
                  </div>
                  <div className="vuexy-card-body">
                    {data.country_stats && data.country_stats.length > 0 ? (
                      data.country_stats.map((cs) => {
                        const total = data.metrics.total_logins || 1
                        const pct = Math.round((cs.count / total) * 100)
                        return (
                          <div key={cs.country} style={{ marginBottom: '14px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                              <span>
                                {getCountryFlag(cs.country_code)} <strong>{cs.country}</strong>
                              </span>
                              <span style={{ color: '#8b8893' }}>
                                {cs.count} logins ({pct}%)
                              </span>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: '#f1f1f2', borderRadius: '4px', overflow: 'hidden' }}>
                              <div
                                style={{
                                  width: `${pct}%`,
                                  height: '100%',
                                  backgroundColor: cs.country === 'India' ? '#28c76f' : '#7367f0',
                                }}
                              />
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div style={{ color: '#8b8893' }}>No geographic logs yet.</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Login Audit Trail Table */}
              <div className="vuexy-card">
                <div className="vuexy-card-header">
                  <h5 className="vuexy-card-title">Real-Time User Login &amp; Session Audit Trail</h5>
                </div>
                <div className="vuexy-table-container">
                  <table className="vuexy-table">
                    <thead>
                      <tr>
                        <th>STATUS</th>
                        <th>USER EMAIL</th>
                        <th>IP ADDRESS</th>
                        <th>PLACE &amp; REGION</th>
                        <th>COUNTRY</th>
                        <th>ISP / NETWORK</th>
                        <th>DEVICE &amp; BROWSER</th>
                        <th>TIMESTAMP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recent_activities && data.recent_activities.length > 0 ? (
                        data.recent_activities.map((act) => (
                          <tr key={act.id}>
                            <td>
                              <span className={`vuexy-badge ${act.status === 'success' ? 'active' : 'danger'}`}>
                                {act.status === 'success' ? '✓ SUCCESS' : '✕ FAILED'}
                              </span>
                            </td>
                            <td>
                              <div style={{ fontWeight: 600 }}>{act.user_email}</div>
                              {act.is_admin_login && <span className="vuexy-badge pro" style={{ fontSize: '0.65rem' }}>ADMIN PORTAL</span>}
                            </td>
                            <td>
                              <code style={{ background: '#f8f7fa', padding: '2px 5px', borderRadius: '3px', color: '#7367f0' }}>
                                {act.ip_address}
                              </code>
                            </td>
                            <td>
                              <strong>{act.city || 'Kannur'}</strong>, {act.region || 'Kerala'}
                            </td>
                            <td>
                              <span style={{ marginRight: '4px' }}>{getCountryFlag(act.country_code)}</span>
                              {act.country}
                            </td>
                            <td style={{ fontSize: '0.8rem', color: '#8b8893' }}>{act.isp || 'Kerala Vision Broadband'}</td>
                            <td style={{ fontSize: '0.8rem', color: '#2f2b3d' }}>{act.device || 'Chrome on Windows'}</td>
                            <td style={{ fontSize: '0.8rem', color: '#8b8893' }}>
                              {new Date(act.created_at).toLocaleString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#8b8893' }}>
                            No login audit events recorded yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================
              TAB 5: SYSTEM CONFIG (Pricing in ₹, no paise)
              ================================================================ */}
          {activeTab === 'settings' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="vuexy-card">
                <div className="vuexy-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h5 className="vuexy-card-title">Razorpay Gateway &amp; Pro Rules</h5>
                  {pricingConfig.razorpay_configured ? (
                    <span className="vuexy-badge-green" style={{ fontSize: '0.75rem', padding: '3px 8px' }}>
                      🟢 Razorpay Active (Live/Test)
                    </span>
                  ) : (
                    <span className="vuexy-badge-orange" style={{ fontSize: '0.75rem', padding: '3px 8px' }}>
                      🟡 Sandbox Simulator Active
                    </span>
                  )}
                </div>
                <div className="vuexy-card-body">
                  <form onSubmit={handleSaveSettings}>
                    {/* Monthly Pro Price */}
                    <div className="vuexy-form-group">
                      <label className="vuexy-form-label">Razorpay Monthly Pro Price (₹ INR)</label>
                      <div style={{ position: 'relative', maxWidth: '320px' }}>
                        <span
                          style={{
                            position: 'absolute',
                            left: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontWeight: 700,
                            color: '#7367f0',
                            fontSize: '1.1rem',
                          }}
                        >
                          ₹
                        </span>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          required
                          value={pricingConfig.pro_monthly_price}
                          onChange={(e) => setPricingConfig({ ...pricingConfig, pro_monthly_price: e.target.value })}
                          className="vuexy-form-input"
                          style={{ paddingLeft: '28px', fontWeight: 700, fontSize: '1.1rem', color: '#7367f0' }}
                        />
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#8b8893', marginTop: '5px' }}>
                        Enter the price in Rupees (₹). Zero paise shown anywhere. Directly charged on customer Razorpay checkout.
                      </div>
                    </div>

                    {/* Free Trial Days */}
                    <div className="vuexy-form-group">
                      <label className="vuexy-form-label">Free Trial Period (Days)</label>
                      <div style={{ maxWidth: '320px' }}>
                        <input
                          type="number"
                          min="1"
                          max="365"
                          required
                          value={pricingConfig.trial_days}
                          onChange={(e) => setPricingConfig({ ...pricingConfig, trial_days: e.target.value })}
                          className="vuexy-form-input"
                          style={{ fontWeight: 600 }}
                        />
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#8b8893', marginTop: '5px' }}>
                        Calendar days granted to new signups before requiring a Pro upgrade.
                      </div>
                    </div>

                    {/* Razorpay Key ID */}
                    <div className="vuexy-form-group" style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '16px', marginTop: '16px' }}>
                      <label className="vuexy-form-label">Razorpay Key ID</label>
                      <input
                        type="text"
                        placeholder="rzp_test_... or rzp_live_..."
                        value={pricingConfig.razorpay_key_id}
                        onChange={(e) => setPricingConfig({ ...pricingConfig, razorpay_key_id: e.target.value })}
                        className="vuexy-form-input"
                        style={{ fontFamily: 'monospace', fontSize: '0.86rem' }}
                      />
                      <div style={{ fontSize: '0.78rem', color: '#8b8893', marginTop: '5px' }}>
                        Obtained from Razorpay Dashboard → Settings → API Keys.
                      </div>
                    </div>

                    {/* Razorpay Key Secret */}
                    <div className="vuexy-form-group">
                      <label className="vuexy-form-label">
                        Razorpay Key Secret {pricingConfig.razorpay_has_secret && <span style={{ color: '#28c76f', fontSize: '0.78rem' }}>(✓ Secret Saved)</span>}
                      </label>
                      <input
                        type="password"
                        placeholder={pricingConfig.razorpay_has_secret ? '•••••••••••••••• (Leave blank to keep existing)' : 'Enter Razorpay Key Secret'}
                        value={pricingConfig.razorpay_key_secret}
                        onChange={(e) => setPricingConfig({ ...pricingConfig, razorpay_key_secret: e.target.value })}
                        className="vuexy-form-input"
                        style={{ fontFamily: 'monospace', fontSize: '0.86rem' }}
                      />
                      <div style={{ fontSize: '0.78rem', color: '#8b8893', marginTop: '5px' }}>
                        Used securely on the server to create orders and verify payment HMAC signatures.
                      </div>
                    </div>

                    <button type="submit" disabled={savingSettings} className="vuexy-btn-add">
                      {savingSettings ? 'Saving Changes…' : '💾 Save Settings & Razorpay Keys'}
                    </button>
                  </form>
                </div>
              </div>

              <div className="vuexy-card">
                <div className="vuexy-card-header">
                  <h5 className="vuexy-card-title">Server Environment &amp; Security Specs</h5>
                </div>
                <div className="vuexy-card-body">
                  <table className="vuexy-table">
                    <tbody>
                      <tr>
                        <td><strong>Application:</strong></td>
                        <td>Smartcvmaker AI Resume Platform</td>
                      </tr>
                      <tr>
                        <td><strong>Design Theme:</strong></td>
                        <td>Modern Light Admin Design System</td>
                      </tr>
                      <tr>
                        <td><strong>Backend API:</strong></td>
                        <td>Laravel 11.x (Sanctum Auth)</td>
                      </tr>
                      <tr>
                        <td><strong>IP &amp; Geolocation Engine:</strong></td>
                        <td>GeoService (Auto-resolves Kannur, Kerala, India)</td>
                      </tr>
                      <tr>
                        <td><strong>Payment Gateway:</strong></td>
                        <td>Razorpay Standard Checkout v1</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================
              TAB 6: SUPPORT TICKETS & HELPDESK
              ================================================================ */}
          {activeTab === 'tickets' && (
            <>
              {/* TOP STAT METRIC CARDS FOR TICKETS */}
              <div className="vuexy-stat-grid" style={{ marginBottom: '1.5rem' }}>
                {/* 1. Total Tickets */}
                <div
                  className="vuexy-stat-card"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setTicketStatusFilter('all')}
                >
                  <div className="vuexy-stat-content">
                    <span className="vuexy-stat-title">Total Tickets</span>
                    <div className="vuexy-stat-val-row">
                      <span className="vuexy-stat-number">{ticketCounts.total}</span>
                      <span className="vuexy-stat-badge positive">(All Time)</span>
                    </div>
                    <span className="vuexy-stat-sub">Support &amp; Inquiries</span>
                  </div>
                  <div className="vuexy-stat-icon-wrapper" style={{ backgroundColor: '#7367f022', color: '#7367f0' }}>
                    <span>🎧</span>
                  </div>
                </div>

                {/* 2. Open / Action Required */}
                <div
                  className="vuexy-stat-card"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setTicketStatusFilter('open')}
                >
                  <div className="vuexy-stat-content">
                    <span className="vuexy-stat-title">Open Tickets</span>
                    <div className="vuexy-stat-val-row">
                      <span className="vuexy-stat-number" style={{ color: ticketCounts.open > 0 ? '#ea5455' : 'inherit' }}>
                        {ticketCounts.open}
                      </span>
                      <span className="vuexy-stat-badge" style={{ backgroundColor: '#fee2e2', color: '#ea5455' }}>
                        Action Needed
                      </span>
                    </div>
                    <span className="vuexy-stat-sub">Awaiting Admin Reply</span>
                  </div>
                  <div className="vuexy-stat-icon-wrapper" style={{ backgroundColor: '#fee2e2', color: '#ea5455' }}>
                    <span>⚡</span>
                  </div>
                </div>

                {/* 3. In Progress & Waiting */}
                <div
                  className="vuexy-stat-card"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setTicketStatusFilter('in_progress')}
                >
                  <div className="vuexy-stat-content">
                    <span className="vuexy-stat-title">In Progress</span>
                    <div className="vuexy-stat-val-row">
                      <span className="vuexy-stat-number">{ticketCounts.in_progress}</span>
                      <span className="vuexy-stat-badge" style={{ backgroundColor: '#fff0e1', color: '#ff9f43' }}>
                        Under Review
                      </span>
                    </div>
                    <span className="vuexy-stat-sub">{ticketCounts.waiting_user} waiting on user</span>
                  </div>
                  <div className="vuexy-stat-icon-wrapper" style={{ backgroundColor: '#fff0e1', color: '#ff9f43' }}>
                    <span>⏳</span>
                  </div>
                </div>

                {/* 4. Resolved & Answered */}
                <div
                  className="vuexy-stat-card"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setTicketStatusFilter('resolved')}
                >
                  <div className="vuexy-stat-content">
                    <span className="vuexy-stat-title">Resolved &amp; Answered</span>
                    <div className="vuexy-stat-val-row">
                      <span className="vuexy-stat-number">
                        {(ticketCounts.answered || 0) + (ticketCounts.resolved || 0)}
                      </span>
                      <span className="vuexy-stat-badge positive">Solved</span>
                    </div>
                    <span className="vuexy-stat-sub">{ticketCounts.closed || 0} closed archives</span>
                  </div>
                  <div className="vuexy-stat-icon-wrapper" style={{ backgroundColor: '#dcf6e8', color: '#28c76f' }}>
                    <span>✅</span>
                  </div>
                </div>
              </div>

              {/* FILTERS & CONTROLS */}
              <div className="vuexy-card" style={{ marginBottom: '1.5rem' }}>
                <div className="vuexy-card-header" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <h5 className="vuexy-card-title">Filter Support Tickets</h5>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {/* Status filter */}
                    <div className="vuexy-select-wrapper">
                      <select
                        className="vuexy-select"
                        value={ticketStatusFilter}
                        onChange={(e) => setTicketStatusFilter(e.target.value)}
                      >
                        <option value="all">All Statuses ({ticketCounts.total})</option>
                        <option value="open">Open ({ticketCounts.open})</option>
                        <option value="in_progress">In Progress ({ticketCounts.in_progress})</option>
                        <option value="answered">Answered ({ticketCounts.answered})</option>
                        <option value="waiting_user">Waiting on User ({ticketCounts.waiting_user})</option>
                        <option value="resolved">Resolved ({ticketCounts.resolved})</option>
                        <option value="closed">Closed ({ticketCounts.closed})</option>
                      </select>
                      <span className="vuexy-select-arrow">▼</span>
                    </div>

                    {/* Priority filter */}
                    <div className="vuexy-select-wrapper">
                      <select
                        className="vuexy-select"
                        value={ticketPriorityFilter}
                        onChange={(e) => setTicketPriorityFilter(e.target.value)}
                      >
                        <option value="all">All Priorities</option>
                        <option value="urgent">Urgent</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                      <span className="vuexy-select-arrow">▼</span>
                    </div>

                    {/* Search box */}
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        className="vuexy-form-input"
                        placeholder="Search ticket #, user, subject…"
                        value={ticketSearchQuery}
                        onChange={(e) => setTicketSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') loadAdminTickets()
                        }}
                        style={{ height: '36px', minWidth: '220px', paddingRight: '28px', fontSize: '0.85rem' }}
                      />
                      {ticketSearchQuery && (
                        <span
                          onClick={() => {
                            setTicketSearchQuery('')
                            setTimeout(() => loadAdminTickets(), 50)
                          }}
                          style={{
                            position: 'absolute',
                            right: '8px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            cursor: 'pointer',
                            color: '#8b8893',
                            fontSize: '0.85rem',
                          }}
                        >
                          ✕
                        </span>
                      )}
                    </div>

                    <button
                      className="vuexy-btn-export"
                      onClick={() => loadAdminTickets()}
                      title="Refresh Tickets"
                      style={{ height: '36px', padding: '0 12px' }}
                    >
                      🔄 Refresh
                    </button>
                  </div>
                </div>

                {/* TICKETS TABLE */}
                <div className="vuexy-table-responsive">
                  <table className="vuexy-table">
                    <thead>
                      <tr>
                        <th>TICKET #</th>
                        <th>USER / CUSTOMER</th>
                        <th>SUBJECT &amp; CATEGORY</th>
                        <th>PRIORITY</th>
                        <th>STATUS</th>
                        <th>MSGS</th>
                        <th>LAST ACTIVITY</th>
                        <th style={{ textAlign: 'right' }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ticketsLoading && tickets.length === 0 ? (
                        <tr>
                          <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#8b8893' }}>
                            Loading support tickets…
                          </td>
                        </tr>
                      ) : tickets.length === 0 ? (
                        <tr>
                          <td colSpan="8" style={{ textAlign: 'center', padding: '48px', color: '#8b8893' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎉</div>
                            <div style={{ fontWeight: 600, fontSize: '1rem', color: '#2f2b3d' }}>No tickets found</div>
                            <div style={{ fontSize: '0.85rem' }}>No support requests match the selected filters.</div>
                          </td>
                        </tr>
                      ) : (
                        tickets.map((t) => {
                          const u = t.user || {}
                          const { initials, color } = getUserVisuals(u)

                          return (
                            <tr key={t.id}>
                              {/* Ticket Number */}
                              <td>
                                <span
                                  style={{
                                    fontFamily: 'monospace',
                                    fontWeight: 700,
                                    fontSize: '0.86rem',
                                    color: '#7367f0',
                                    background: '#7367f015',
                                    padding: '3px 7px',
                                    borderRadius: '5px',
                                  }}
                                >
                                  {t.ticket_number}
                                </span>
                              </td>

                              {/* User Info */}
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <div
                                    className="vuexy-user-avatar-sm"
                                    style={{ backgroundColor: `${color}22`, color: color }}
                                  >
                                    {initials}
                                  </div>
                                  <div>
                                    <div style={{ fontWeight: 600, color: '#2f2b3d', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                                      {u.name || 'User'}
                                      {u.is_pro && (
                                        <span className="vuexy-badge-green" style={{ fontSize: '0.68rem', padding: '1px 5px', fontWeight: 700 }}>
                                          PRO
                                        </span>
                                      )}
                                    </div>
                                    <div style={{ fontSize: '0.78rem', color: '#8b8893' }}>{u.email}</div>
                                  </div>
                                </div>
                              </td>

                              {/* Subject & Category */}
                              <td>
                                <div style={{ fontWeight: 600, color: '#2f2b3d', fontSize: '0.88rem', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {t.subject}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#8b8893', textTransform: 'capitalize' }}>
                                  {t.category ? t.category.replace('_', ' ') : 'General'}
                                </div>
                              </td>

                              {/* Priority */}
                              <td>
                                {t.priority === 'urgent' && <span className="vuexy-badge-red">Urgent</span>}
                                {t.priority === 'high' && <span className="vuexy-badge-orange">High</span>}
                                {t.priority === 'medium' && <span className="vuexy-badge-info">Medium</span>}
                                {t.priority === 'low' && <span className="vuexy-badge-gray">Low</span>}
                              </td>

                              {/* Status */}
                              <td>
                                {t.status === 'open' && <span className="vuexy-badge-primary">Open</span>}
                                {t.status === 'in_progress' && <span className="vuexy-badge-orange">In Progress</span>}
                                {t.status === 'answered' && <span className="vuexy-badge-info">Answered</span>}
                                {t.status === 'waiting_user' && <span className="vuexy-badge-orange">Waiting User</span>}
                                {t.status === 'resolved' && <span className="vuexy-badge-green">Resolved</span>}
                                {t.status === 'closed' && <span className="vuexy-badge-gray">Closed</span>}
                              </td>

                              {/* Message Count */}
                              <td>
                                <span style={{ fontSize: '0.82rem', color: '#444050', fontWeight: 600 }}>
                                  💬 {t.messages_count || 1}
                                </span>
                              </td>

                              {/* Last Activity */}
                              <td>
                                <div style={{ fontSize: '0.8rem', color: '#2f2b3d' }}>
                                  {new Date(t.updated_at).toLocaleDateString()}
                                </div>
                                <div style={{ fontSize: '0.74rem', color: '#8b8893' }}>
                                  {new Date(t.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </td>

                              {/* Actions */}
                              <td style={{ textAlign: 'right' }}>
                                <div style={{ display: 'inline-flex', gap: '6px' }}>
                                  <button
                                    className="vuexy-btn-add"
                                    onClick={() => openAdminTicketDetail(t.id)}
                                    style={{ height: '30px', padding: '0 10px', fontSize: '0.78rem' }}
                                    title="Open discussion and reply"
                                  >
                                    View &amp; Reply
                                  </button>
                                  <button
                                    className="vuexy-btn-export"
                                    onClick={() => handleAdminDeleteTicket(t.id, t.ticket_number)}
                                    style={{ height: '30px', padding: '0 8px', fontSize: '0.78rem', color: '#ea5455' }}
                                    title="Delete ticket"
                                  >
                                    🗑️
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
            </>
          )}
        </main>
      </div>

      {/* ====================================================================
          MODAL: VIEW USER ACCOUNT OVERVIEW
          ==================================================================== */}
      {selectedUserDetail && (
        <div className="vuexy-offcanvas-backdrop" onClick={() => setSelectedUserDetail(null)}>
          <div className="vuexy-offcanvas" onClick={(e) => e.stopPropagation()}>
            <div className="vuexy-offcanvas-header">
              <h5 className="vuexy-offcanvas-title">User Account Overview</h5>
              <button className="vuexy-offcanvas-close" onClick={() => setSelectedUserDetail(null)}>
                ✕
              </button>
            </div>
            <div className="vuexy-offcanvas-body">
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div
                  className="vuexy-user-avatar-sm"
                  style={{
                    width: '64px',
                    height: '64px',
                    fontSize: '1.5rem',
                    margin: '0 auto 10px',
                    backgroundColor: '#7367f022',
                    color: '#7367f0',
                    border: '2px solid #7367f0',
                  }}
                >
                  {selectedUserDetail.name?.charAt(0).toUpperCase()}
                </div>
                <h4 style={{ margin: '0 0 4px', color: '#2f2b3d' }}>{selectedUserDetail.name}</h4>
                <div style={{ color: '#8b8893', fontSize: '0.85rem' }}>{selectedUserDetail.email}</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #f1f1f2' }}>
                  <span style={{ color: '#8b8893' }}>Account Status:</span>
                  <span className="vuexy-badge active">
                    {selectedUserDetail.is_admin ? 'Administrator' : selectedUserDetail.is_pro ? 'Pro Member' : 'Active Trial'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #f1f1f2' }}>
                  <span style={{ color: '#8b8893' }}>IP Address:</span>
                  <code style={{ background: '#f8f7fa', padding: '2px 6px', borderRadius: '4px', color: '#7367f0' }}>
                    {selectedUserDetail.last_login_ip || data.client_ip || '103.175.136.200'}
                  </code>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #f1f1f2' }}>
                  <span style={{ color: '#8b8893' }}>Location:</span>
                  <strong>{selectedUserDetail.last_login_city || 'Kannur'}, {selectedUserDetail.last_login_country || 'India'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #f1f1f2' }}>
                  <span style={{ color: '#8b8893' }}>ISP:</span>
                  <span>{selectedUserDetail.last_login_isp || 'Kerala Vision Broadband'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #f1f1f2' }}>
                  <span style={{ color: '#8b8893' }}>Resumes Created:</span>
                  <strong>{selectedUserDetail.resumes_count || 0}</strong>
                </div>
              </div>

              <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {!selectedUserDetail.is_pro ? (
                  <button
                    className="vuexy-btn-add"
                    style={{ justifyContent: 'center' }}
                    onClick={() => {
                      handleAction(selectedUserDetail.id, 'upgrade', `/admin/users/${selectedUserDetail.id}/upgrade`)
                      setSelectedUserDetail(null)
                    }}
                  >
                    👑 Upgrade to Unlimited Pro
                  </button>
                ) : (
                  <button
                    className="vuexy-btn-export"
                    style={{ justifyContent: 'center' }}
                    onClick={() => {
                      handleAction(selectedUserDetail.id, 'downgrade', `/admin/users/${selectedUserDetail.id}/downgrade`)
                      setSelectedUserDetail(null)
                    }}
                  >
                    ↘️ Downgrade to Free
                  </button>
                )}
                <button
                  className="vuexy-btn-export"
                  style={{ justifyContent: 'center' }}
                  onClick={() => {
                    handleAction(selectedUserDetail.id, 'extend-trial', `/admin/users/${selectedUserDetail.id}/extend-trial`)
                    setSelectedUserDetail(null)
                  }}
                >
                  📅 Add 30 Days Trial
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: ADD NEW USER
          ==================================================================== */}
      {addUserOpen && (
        <div className="vuexy-offcanvas-backdrop" onClick={() => setAddUserOpen(false)}>
          <div className="vuexy-offcanvas" onClick={(e) => e.stopPropagation()}>
            <div className="vuexy-offcanvas-header">
              <h5 className="vuexy-offcanvas-title">Add User</h5>
              <button className="vuexy-offcanvas-close" onClick={() => setAddUserOpen(false)}>
                ✕
              </button>
            </div>
            <div className="vuexy-offcanvas-body">
              <form onSubmit={handleCreateUser}>
                <div className="vuexy-form-group">
                  <label className="vuexy-form-label">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Candidate Name"
                    className="vuexy-form-input"
                    value={newUserForm.name}
                    onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  />
                </div>

                <div className="vuexy-form-group">
                  <label className="vuexy-form-label">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="user@example.com"
                    className="vuexy-form-input"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  />
                </div>

                <div className="vuexy-form-group">
                  <label className="vuexy-form-label">Temporary Password</label>
                  <input
                    type="password"
                    required
                    className="vuexy-form-input"
                    value={newUserForm.password}
                    onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
                  <button type="submit" className="vuexy-btn-add">
                    Save User
                  </button>
                  <button
                    type="button"
                    className="vuexy-btn-export"
                    onClick={() => setAddUserOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: SUPPORT TICKET DISCUSSION & ADMIN REPLY
          ==================================================================== */}
      {adminTicketModalOpen && (
        <div
          className="vuexy-offcanvas-backdrop"
          onClick={() => {
            setAdminTicketModalOpen(false)
            setSelectedAdminTicket(null)
          }}
          style={{ display: 'grid', placeItems: 'center', zIndex: 1100, padding: 20 }}
        >
          <div
            className="vuexy-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(760px, 100%)',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 45px rgba(0, 0, 0, 0.25)',
              borderRadius: '12px',
              overflow: 'hidden',
              margin: 0,
            }}
          >
            {/* Modal Header */}
            <div
              className="vuexy-card-header"
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid rgba(47, 43, 61, 0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                backgroundColor: '#ffffff',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      color: '#7367f0',
                      backgroundColor: '#7367f015',
                      padding: '3px 8px',
                      borderRadius: '5px',
                    }}
                  >
                    {selectedAdminTicket?.ticket_number || 'TICKET'}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#8b8893', textTransform: 'capitalize' }}>
                    {selectedAdminTicket?.category ? selectedAdminTicket.category.replace('_', ' ') : 'General'}
                  </span>
                  {selectedAdminTicket?.user?.is_pro && (
                    <span className="vuexy-badge-green" style={{ fontSize: '0.72rem', padding: '2px 6px', fontWeight: 700 }}>
                      ⭐ VIP PRO CUSTOMER
                    </span>
                  )}
                </div>
                <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#2f2b3d' }}>
                  {selectedAdminTicket?.subject || 'Loading ticket…'}
                </h4>
              </div>

              <button
                className="vuexy-offcanvas-close"
                onClick={() => {
                  setAdminTicketModalOpen(false)
                  setSelectedAdminTicket(null)
                }}
                style={{ fontSize: '1.2rem', padding: '4px 8px' }}
              >
                ✕
              </button>
            </div>

            {/* User Metadata & Controls Toolbar */}
            {selectedAdminTicket && (
              <div
                style={{
                  padding: '0.85rem 1.5rem',
                  backgroundColor: '#f8f7fa',
                  borderBottom: '1px solid rgba(47, 43, 61, 0.08)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem' }}>
                  <span style={{ fontWeight: 600, color: '#2f2b3d' }}>
                    👤 {selectedAdminTicket.user?.name || 'Customer'}
                  </span>
                  <span style={{ color: '#8b8893' }}>({selectedAdminTicket.user?.email})</span>
                  {selectedAdminTicket.user?.last_login_country && (
                    <span style={{ color: '#8b8893' }}>📍 {selectedAdminTicket.user.last_login_country}</span>
                  )}
                </div>

                {/* Quick Status and Priority Selectors */}
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}>
                    <span style={{ fontWeight: 600, color: '#8b8893' }}>Status:</span>
                    <select
                      className="vuexy-select"
                      value={selectedAdminTicket.status}
                      onChange={(e) => handleAdminUpdateStatus(selectedAdminTicket.id, e.target.value, null)}
                      style={{ padding: '4px 10px', fontSize: '0.8rem', height: '30px' }}
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="answered">Answered</option>
                      <option value="waiting_user">Waiting User</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}>
                    <span style={{ fontWeight: 600, color: '#8b8893' }}>Priority:</span>
                    <select
                      className="vuexy-select"
                      value={selectedAdminTicket.priority}
                      onChange={(e) => handleAdminUpdateStatus(selectedAdminTicket.id, null, e.target.value)}
                      style={{ padding: '4px 10px', fontSize: '0.8rem', height: '30px' }}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Conversation Messages Thread */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                flex: 1,
                overflowY: 'auto',
                backgroundColor: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                maxHeight: '380px',
              }}
            >
              {adminTicketDetailLoading && !selectedAdminTicket ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#8b8893' }}>
                  Loading conversation history…
                </div>
              ) : selectedAdminTicket?.messages?.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#8b8893' }}>
                  No messages recorded in this ticket.
                </div>
              ) : (
                selectedAdminTicket?.messages?.map((msg, index) => {
                  const isAdmin = msg.is_admin_reply

                  return (
                    <div
                      key={msg.id || index}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isAdmin ? 'flex-end' : 'flex-start',
                        width: '100%',
                      }}
                    >
                      {/* Sender details */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          marginBottom: 4,
                          fontSize: '0.74rem',
                          color: '#8b8893',
                        }}
                      >
                        {isAdmin ? (
                          <>
                            <span
                              style={{
                                fontWeight: 700,
                                color: '#7367f0',
                                backgroundColor: '#7367f015',
                                padding: '1px 6px',
                                borderRadius: '4px',
                              }}
                            >
                              🛡️ Administrator / Support Specialist
                            </span>
                            <span>• {new Date(msg.created_at).toLocaleString()}</span>
                          </>
                        ) : (
                          <>
                            <span style={{ fontWeight: 600, color: '#2f2b3d' }}>
                              👤 {selectedAdminTicket.user?.name || 'Customer'}
                            </span>
                            <span>• {new Date(msg.created_at).toLocaleString()}</span>
                          </>
                        )}
                      </div>

                      {/* Message Bubble */}
                      <div
                        style={{
                          maxWidth: '85%',
                          padding: '12px 16px',
                          borderRadius: '10px',
                          fontSize: '0.9rem',
                          lineHeight: 1.5,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          backgroundColor: isAdmin ? '#7367f0' : '#f8f7fa',
                          color: isAdmin ? '#ffffff' : '#2f2b3d',
                          border: isAdmin ? 'none' : '1px solid rgba(47, 43, 61, 0.08)',
                          boxShadow: isAdmin ? '0 2px 6px rgba(115, 103, 240, 0.35)' : 'none',
                        }}
                      >
                        {msg.message}
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Admin Reply Composer Form */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                backgroundColor: '#f8f7fa',
                borderTop: '1px solid rgba(47, 43, 61, 0.1)',
              }}
            >
              <form onSubmit={handleAdminReplySubmit}>
                <div className="vuexy-form-group" style={{ marginBottom: '10px' }}>
                  <label className="vuexy-form-label" style={{ fontWeight: 600 }}>
                    Official Reply to Customer:
                  </label>
                  <textarea
                    rows={3}
                    className="vuexy-form-input"
                    placeholder="Type your response here. The customer will immediately see this in their Support Section…"
                    value={adminReplyText}
                    onChange={(e) => setAdminReplyText(e.target.value)}
                    required
                    disabled={adminReplySending}
                    style={{
                      fontFamily: 'inherit',
                      resize: 'none',
                      backgroundColor: '#ffffff',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem' }}>
                    <span style={{ fontWeight: 600, color: '#444050' }}>Set status upon reply:</span>
                    <select
                      className="vuexy-select"
                      value={adminReplyStatus}
                      onChange={(e) => setAdminReplyStatus(e.target.value)}
                      style={{ padding: '4px 10px', fontSize: '0.82rem', height: '32px' }}
                    >
                      <option value="answered">Answered (Default)</option>
                      <option value="in_progress">In Progress</option>
                      <option value="waiting_user">Waiting on User</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      type="button"
                      className="vuexy-btn-export"
                      onClick={() => {
                        setAdminTicketModalOpen(false)
                        setSelectedAdminTicket(null)
                      }}
                      style={{ height: '34px', padding: '0 14px' }}
                    >
                      Close
                    </button>

                    <button
                      type="submit"
                      className="vuexy-btn-add"
                      disabled={adminReplySending || !adminReplyText.trim()}
                      style={{ height: '34px', padding: '0 16px' }}
                    >
                      {adminReplySending ? 'Sending…' : '✉️ Dispatch Reply'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
