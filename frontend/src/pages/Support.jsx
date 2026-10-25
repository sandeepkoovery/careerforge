import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  LifeBuoy, MessageSquare, Plus, Send, Clock, CheckCircle2,
  AlertCircle, ShieldCheck, Crown, ArrowLeft, RefreshCw,
  FolderOpen, AlertTriangle, ChevronRight, X, User as UserIcon,
  HelpCircle, Sparkles
} from 'lucide-react'
import { useAuth } from '../auth'
import { api } from '../api'

const CATEGORY_MAP = {
  general: { label: 'General Inquiry', icon: '💬' },
  billing: { label: 'Billing & Pro Subscription', icon: '💳' },
  technical: { label: 'Technical & Export', icon: '⚙️' },
  templates: { label: 'Resume Templates', icon: '📄' },
  ai_tools: { label: 'ATS & AI Tools', icon: '✨' },
  account: { label: 'Account & Security', icon: '🔒' },
}

const PRIORITY_MAP = {
  low: { label: 'Low', color: '#64748b', bg: '#f1f5f9' },
  medium: { label: 'Medium', color: '#0284c7', bg: '#e0f2fe' },
  high: { label: 'High', color: '#ea580c', bg: '#ffedd5' },
  urgent: { label: 'Urgent', color: '#dc2626', bg: '#fee2e2' },
}

const STATUS_MAP = {
  open: { label: 'Open', color: '#2563eb', bg: '#dbeafe' },
  in_progress: { label: 'In Progress', color: '#d97706', bg: '#fef3c7' },
  answered: { label: 'Answered', color: '#7c3aed', bg: '#ede9fe' },
  waiting_user: { label: 'Waiting on You', color: '#ea580c', bg: '#ffedd5' },
  resolved: { label: 'Resolved', color: '#16a34a', bg: '#dcfce7' },
  closed: { label: 'Closed', color: '#64748b', bg: '#f1f5f9' },
}

export default function Support() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState([])
  const [counts, setCounts] = useState({ total: 0, active: 0, resolved: 0 })
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all') // all | active | resolved

  // Active Selected Ticket View
  const [selectedTicketId, setSelectedTicketId] = useState(null)
  const [ticketDetail, setTicketDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  // Reply Composer
  const [replyMessage, setReplyMessage] = useState('')
  const [replySending, setReplySending] = useState(false)
  const [replyError, setReplyError] = useState('')

  // New Ticket Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState({
    subject: '',
    category: 'general',
    priority: user?.is_pro ? 'high' : 'medium',
    message: '',
  })

  const messagesEndRef = useRef(null)

  const loadTickets = async (quiet = false) => {
    try {
      if (!quiet) setLoading(true)
      const res = await api.get('/support/tickets')
      setTickets(res.tickets || [])
      setCounts(res.counts || { total: 0, active: 0, resolved: 0 })
    } catch (err) {
      console.error('Failed to load tickets', err)
    } finally {
      if (!quiet) setLoading(false)
    }
  }

  const loadTicketDetail = async (id, scrollBottom = true) => {
    try {
      setDetailLoading(true)
      const res = await api.get(`/support/tickets/${id}`)
      setTicketDetail(res.ticket)
      setSelectedTicketId(id)
      if (scrollBottom) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      }
    } catch (err) {
      console.error('Failed to load ticket detail', err)
    } finally {
      setDetailLoading(false)
    }
  }

  useEffect(() => {
    loadTickets()
  }, [])

  const handleCreateTicket = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!form.subject.trim() || !form.message.trim()) {
      setFormError('Please fill in both the subject and the message details.')
      return
    }

    try {
      setCreating(true)
      const res = await api.post('/support/tickets', form)
      setModalOpen(false)
      setForm({
        subject: '',
        category: 'general',
        priority: user?.is_pro ? 'high' : 'medium',
        message: '',
      })
      await loadTickets(true)
      if (res.ticket?.id) {
        loadTicketDetail(res.ticket.id)
      }
    } catch (err) {
      setFormError(err.message || 'Failed to submit ticket. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  const handleSendReply = async (e) => {
    e.preventDefault()
    if (!replyMessage.trim() || !ticketDetail?.id) return

    try {
      setReplySending(true)
      setReplyError('')
      const res = await api.post(`/support/tickets/${ticketDetail.id}/reply`, {
        message: replyMessage.trim(),
      })
      setReplyMessage('')
      setTicketDetail(res.ticket)
      loadTickets(true)
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch (err) {
      setReplyError(err.message || 'Failed to send reply.')
    } finally {
      setReplySending(false)
    }
  }

  const handleCloseTicket = async () => {
    if (!ticketDetail?.id) return
    if (!window.confirm('Are you sure you want to mark this ticket as resolved/closed?')) return

    try {
      const res = await api.post(`/support/tickets/${ticketDetail.id}/close`)
      setTicketDetail(res.ticket)
      loadTickets(true)
    } catch (err) {
      alert(err.message || 'Failed to close ticket.')
    }
  }

  const filteredTickets = tickets.filter((t) => {
    if (activeFilter === 'active') {
      return ['open', 'in_progress', 'answered', 'waiting_user'].includes(t.status)
    }
    if (activeFilter === 'resolved') {
      return ['resolved', 'closed'].includes(t.status)
    }
    return true
  })

  return (
    <main className="section" style={{ minHeight: '85vh', paddingBottom: 80 }}>
      <div className="container" style={{ maxWidth: 1100 }}>
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: 20 }}>
          <Link to="/dashboard" className="row" style={{ gap: 8, color: 'var(--muted)', fontSize: '0.9rem', fontWeight: 500 }}>
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
        </div>

        {/* Hero Header */}
        <div className="card" style={{
          marginBottom: 28,
          padding: '28px 32px',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid var(--border)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: -40,
            right: -40,
            width: 220,
            height: 220,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          <div className="row wrap between" style={{ gap: 20, position: 'relative', zIndex: 2 }}>
            <div className="row" style={{ gap: 16 }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                color: '#fff',
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 8px 20px -4px rgba(99, 102, 241, 0.35)',
                flexShrink: 0
              }}>
                <LifeBuoy size={28} />
              </div>

              <div>
                <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
                  <h1 style={{ fontSize: '1.65rem', fontWeight: 800 }}>Customer Support & Helpdesk</h1>
                  {user?.is_pro ? (
                    <span className="badge-pro" style={{ padding: '3px 10px', fontSize: '0.78rem' }}>
                      <Crown size={13} /> VIP Pro Priority
                    </span>
                  ) : (
                    <span className="badge" style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.78rem', padding: '3px 8px', borderRadius: 6 }}>
                      Standard Support
                    </span>
                  )}
                </div>
                <p className="muted small" style={{ marginTop: 4 }}>
                  {user?.is_pro
                    ? '⚡ As a Smartcvmaker Pro member, your tickets receive accelerated 2-hour VIP priority response from our engineering team.'
                    : 'Need help with templates, ATS checking, or your account? Our support team is here to assist you.'}
                </p>
              </div>
            </div>

            <div className="row" style={{ gap: 10 }}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => loadTickets()}
                title="Refresh Tickets"
                style={{ height: 42, paddingInline: 14 }}
              >
                <RefreshCw size={15} className={loading ? 'spin' : ''} /> Refresh
              </button>
              <button
                id="btn-create-ticket"
                className="btn btn-primary"
                onClick={() => setModalOpen(true)}
                style={{ height: 42, paddingInline: 18, gap: 8 }}
              >
                <Plus size={18} /> Open New Ticket
              </button>
            </div>
          </div>
        </div>

        {/* Support Layout: Sidebar / Detail View */}
        <div className="grid" style={{ gridTemplateColumns: selectedTicketId ? '380px 1fr' : '1fr', gap: 24, alignItems: 'start' }}>
          
          {/* LEFT COLUMN: TICKET LIST */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Filter Tabs Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#fafafa'
            }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  className={`btn btn-sm ${activeFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setActiveFilter('all')}
                  style={{ fontSize: '0.8rem', padding: '5px 10px', height: 28 }}
                >
                  All ({counts.total})
                </button>
                <button
                  className={`btn btn-sm ${activeFilter === 'active' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setActiveFilter('active')}
                  style={{ fontSize: '0.8rem', padding: '5px 10px', height: 28 }}
                >
                  Active ({counts.active})
                </button>
                <button
                  className={`btn btn-sm ${activeFilter === 'resolved' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setActiveFilter('resolved')}
                  style={{ fontSize: '0.8rem', padding: '5px 10px', height: 28 }}
                >
                  Resolved ({counts.resolved})
                </button>
              </div>
            </div>

            {/* Ticket List Body */}
            <div style={{ maxHeight: '680px', overflowY: 'auto' }}>
              {loading && tickets.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
                  <RefreshCw size={24} className="spin" style={{ margin: '0 auto 12px' }} />
                  <p className="small">Loading your tickets…</p>
                </div>
              ) : filteredTickets.length === 0 ? (
                <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                  <div style={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    background: '#f1f5f9',
                    display: 'grid',
                    placeItems: 'center',
                    margin: '0 auto 14px',
                    color: 'var(--muted)'
                  }}>
                    <MessageSquare size={24} />
                  </div>
                  <h3 style={{ fontSize: '1.05rem', marginBottom: 6 }}>No tickets found</h3>
                  <p className="muted small" style={{ marginBottom: 18 }}>
                    {activeFilter !== 'all'
                      ? 'No tickets match the selected filter.'
                      : 'You do not have any support requests yet. If you ever have a question or encounter an issue, we are ready to assist!'}
                  </p>
                  <button className="btn btn-sm btn-primary" onClick={() => setModalOpen(true)}>
                    <Plus size={14} /> Open a Support Ticket
                  </button>
                </div>
              ) : (
                filteredTickets.map((t) => {
                  const isSelected = selectedTicketId === t.id
                  const statusInfo = STATUS_MAP[t.status] || STATUS_MAP.open
                  const priorityInfo = PRIORITY_MAP[t.priority] || PRIORITY_MAP.medium
                  const categoryInfo = CATEGORY_MAP[t.category] || CATEGORY_MAP.general

                  return (
                    <div
                      key={t.id}
                      onClick={() => loadTicketDetail(t.id)}
                      style={{
                        padding: '16px 20px',
                        borderBottom: '1px solid var(--border)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        background: isSelected ? 'rgba(99, 102, 241, 0.06)' : 'transparent',
                        borderLeft: isSelected ? '4px solid #6366f1' : '4px solid transparent',
                      }}
                    >
                      <div className="row between" style={{ marginBottom: 6 }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--muted)', letterSpacing: 0.5 }}>
                          {t.ticket_number}
                        </span>
                        <span style={{
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 6,
                          color: statusInfo.color,
                          background: statusInfo.bg
                        }}>
                          {statusInfo.label}
                        </span>
                      </div>

                      <h4 style={{
                        fontSize: '0.94rem',
                        fontWeight: 600,
                        color: 'var(--text)',
                        marginBottom: 6,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {t.subject}
                      </h4>

                      <div className="row wrap" style={{ gap: 8, fontSize: '0.76rem', color: 'var(--muted)' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          {categoryInfo.icon} {categoryInfo.label}
                        </span>
                        <span>•</span>
                        <span style={{ color: priorityInfo.color, fontWeight: 600 }}>
                          {priorityInfo.label} Priority
                        </span>
                        <span>•</span>
                        <span>{t.messages_count || 1} msg</span>
                      </div>

                      <div style={{ marginTop: 8, fontSize: '0.74rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={12} /> {new Date(t.updated_at).toLocaleDateString()} at {new Date(t.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: ACTIVE TICKET THREAD */}
          {selectedTicketId ? (
            <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 600 }}>
              {detailLoading && !ticketDetail ? (
                <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>
                  <RefreshCw size={28} className="spin" style={{ margin: '0 auto 12px' }} />
                  <p>Loading ticket discussion…</p>
                </div>
              ) : ticketDetail ? (
                <>
                  {/* Thread Header */}
                  <div style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid var(--border)',
                    background: '#ffffff',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 16
                  }}>
                    <div>
                      <div className="row wrap" style={{ gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--brand)', letterSpacing: 0.5 }}>
                          {ticketDetail.ticket_number}
                        </span>
                        <span style={{
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 6,
                          color: (STATUS_MAP[ticketDetail.status] || STATUS_MAP.open).color,
                          background: (STATUS_MAP[ticketDetail.status] || STATUS_MAP.open).bg
                        }}>
                          {(STATUS_MAP[ticketDetail.status] || STATUS_MAP.open).label}
                        </span>
                        <span style={{
                          fontSize: '0.76rem',
                          fontWeight: 600,
                          padding: '3px 8px',
                          borderRadius: 6,
                          color: (PRIORITY_MAP[ticketDetail.priority] || PRIORITY_MAP.medium).color,
                          background: (PRIORITY_MAP[ticketDetail.priority] || PRIORITY_MAP.medium).bg
                        }}>
                          {(PRIORITY_MAP[ticketDetail.priority] || PRIORITY_MAP.medium).label} Priority
                        </span>
                        <span style={{
                          fontSize: '0.76rem',
                          color: 'var(--muted)',
                          padding: '3px 8px',
                          background: '#f1f5f9',
                          borderRadius: 6
                        }}>
                          {(CATEGORY_MAP[ticketDetail.category] || CATEGORY_MAP.general).icon} {(CATEGORY_MAP[ticketDetail.category] || CATEGORY_MAP.general).label}
                        </span>
                      </div>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{ticketDetail.subject}</h2>
                    </div>

                    <div className="row" style={{ gap: 8 }}>
                      {['open', 'in_progress', 'answered', 'waiting_user'].includes(ticketDetail.status) && (
                        <button
                          className="btn btn-sm btn-ghost"
                          onClick={handleCloseTicket}
                          style={{ color: '#16a34a', borderColor: '#bbf7d0', background: '#f0fdf4', fontSize: '0.8rem' }}
                          title="Mark this issue as solved"
                        >
                          <CheckCircle2 size={14} /> Mark as Solved
                        </button>
                      )}
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => setSelectedTicketId(null)}
                        title="Close detail view"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Thread Messages Timeline */}
                  <div style={{
                    padding: '24px',
                    flex: 1,
                    overflowY: 'auto',
                    background: '#f8fafc',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 18,
                    maxHeight: '440px'
                  }}>
                    {ticketDetail.messages && ticketDetail.messages.map((msg, index) => {
                      const isAdmin = msg.is_admin_reply

                      return (
                        <div
                          key={msg.id || index}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: isAdmin ? 'flex-start' : 'flex-end',
                            width: '100%'
                          }}
                        >
                          {/* Sender Info Badge */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            marginBottom: 4,
                            fontSize: '0.75rem',
                            color: 'var(--muted)'
                          }}>
                            {isAdmin ? (
                              <>
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  fontWeight: 700,
                                  color: '#6d28d9',
                                  background: '#ede9fe',
                                  padding: '2px 6px',
                                  borderRadius: 4
                                }}>
                                  <ShieldCheck size={13} /> Smartcvmaker Support Specialist
                                </span>
                                <span>• {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </>
                            ) : (
                              <>
                                <span>You ({user?.name || 'User'})</span>
                                <span>• {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </>
                            )}
                          </div>

                          {/* Message Bubble */}
                          <div style={{
                            maxWidth: '82%',
                            padding: '14px 18px',
                            borderRadius: 14,
                            fontSize: '0.92rem',
                            lineHeight: 1.55,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            background: isAdmin ? '#ffffff' : 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                            color: isAdmin ? '#0f172a' : '#ffffff',
                            border: isAdmin ? '1px solid #e2e8f0' : 'none',
                            boxShadow: isAdmin ? '0 2px 5px rgba(0,0,0,0.04)' : '0 4px 12px rgba(79, 70, 229, 0.25)',
                          }}>
                            {msg.message}
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Reply Composer Form */}
                  <div style={{
                    padding: '16px 20px',
                    borderTop: '1px solid var(--border)',
                    background: '#ffffff'
                  }}>
                    {ticketDetail.status === 'closed' ? (
                      <div className="row between" style={{ padding: '8px 12px', background: '#f1f5f9', borderRadius: 8 }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                          This ticket is closed. Sending a reply will automatically reopen it for our team.
                        </span>
                      </div>
                    ) : null}

                    {replyError && (
                      <div className="alert alert-error" style={{ marginBottom: 12, padding: '8px 12px', fontSize: '0.84rem' }}>
                        {replyError}
                      </div>
                    )}

                    <form onSubmit={handleSendReply}>
                      <div style={{ position: 'relative' }}>
                        <textarea
                          id="ticket-reply-textarea"
                          rows={3}
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          placeholder="Type your response to support here…"
                          disabled={replySending}
                          style={{
                            width: '100%',
                            padding: '12px 14px',
                            borderRadius: 10,
                            border: '1px solid var(--border-strong)',
                            fontSize: '0.92rem',
                            fontFamily: 'inherit',
                            resize: 'none',
                            outline: 'none',
                            transition: 'border-color 0.2s',
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                              handleSendReply(e)
                            }
                          }}
                        />
                      </div>

                      <div className="row between" style={{ marginTop: 10 }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                          Press <kbd style={{ padding: '1px 5px', background: '#e2e8f0', borderRadius: 4, fontSize: '0.75rem' }}>Ctrl</kbd> + <kbd style={{ padding: '1px 5px', background: '#e2e8f0', borderRadius: 4, fontSize: '0.75rem' }}>Enter</kbd> to send
                        </span>

                        <button
                          type="submit"
                          id="btn-send-ticket-reply"
                          className="btn btn-primary btn-sm"
                          disabled={replySending || !replyMessage.trim()}
                          style={{ gap: 6, height: 36, paddingInline: 18 }}
                        >
                          {replySending ? <RefreshCw size={14} className="spin" /> : <Send size={14} />}
                          Send Reply
                        </button>
                      </div>
                    </form>
                  </div>
                </>
              ) : null}
            </div>
          ) : (
            /* PLACEHOLDER WHEN NO TICKET SELECTED */
            <div className="card" style={{ padding: '48px 36px', textAlign: 'center', background: '#ffffff' }}>
              <div style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
                color: 'var(--brand)',
                display: 'grid',
                placeItems: 'center',
                margin: '0 auto 18px'
              }}>
                <LifeBuoy size={32} />
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: 8 }}>Help Center & Technical Assistance</h2>
              <p className="muted" style={{ maxWidth: 480, margin: '0 auto 24px', fontSize: '0.92rem' }}>
                Select a ticket from the left to view the reply thread, or click below to submit a new question or technical inquiry to our team.
              </p>
              <div className="row center" style={{ gap: 12 }}>
                <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
                  <Plus size={16} /> Open a Support Ticket
                </button>
              </div>

              {/* FAQ Quick Cards */}
              <div style={{ marginTop: 40, borderTop: '1px solid var(--border)', paddingTop: 30, textAlign: 'left' }}>
                <h4 style={{ fontSize: '0.92rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 16 }}>
                  Frequently Asked Questions
                </h4>
                <div className="grid grid-2" style={{ gap: 16 }}>
                  <div style={{ padding: '16px', background: '#f8fafc', borderRadius: 10, border: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>How does ATS checking work?</div>
                    <div className="muted small">Our ATS checker parses your resume against industry standards and matches target keywords directly.</div>
                  </div>
                  <div style={{ padding: '16px', background: '#f8fafc', borderRadius: 10, border: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>Can I export in PDF and Word?</div>
                    <div className="muted small">All 35+ templates support pixel-perfect vector PDF downloads and instant ATS format preservation.</div>
                  </div>
                  <div style={{ padding: '16px', background: '#f8fafc', borderRadius: 10, border: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>How fast does support respond?</div>
                    <div className="muted small">Pro users receive responses in under 2 hours; standard tickets are usually resolved within 1 business day.</div>
                  </div>
                  <div style={{ padding: '16px', background: '#f8fafc', borderRadius: 10, border: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>Can I upgrade or cancel anytime?</div>
                    <div className="muted small">Yes, manage your plan directly in Account Settings with instant activation or cancellation.</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CREATE TICKET MODAL */}
      {modalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 9999,
          padding: 20
        }}>
          <div className="card" style={{
            width: 'min(620px, 100%)',
            background: '#ffffff',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            padding: '28px 32px',
            borderRadius: 18,
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div className="row between" style={{ marginBottom: 20 }}>
              <div className="row" style={{ gap: 12 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  color: '#fff',
                  display: 'grid',
                  placeItems: 'center'
                }}>
                  <LifeBuoy size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Open Support Ticket</h3>
                  <p className="muted small">Our support engineering team will reply as soon as possible.</p>
                </div>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setModalOpen(false)}
                style={{ padding: 6 }}
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="alert alert-error" style={{ marginBottom: 16 }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateTicket} className="stack" style={{ '--gap': '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
                  Subject / Summary <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  id="ticket-subject-input"
                  type="text"
                  placeholder="e.g. Question about ATS score calculation or PDF export"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: '1px solid var(--border-strong)',
                    fontSize: '0.92rem'
                  }}
                />
              </div>

              <div className="grid grid-2" style={{ gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
                    Category
                  </label>
                  <select
                    id="ticket-category-select"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: '1px solid var(--border-strong)',
                      fontSize: '0.92rem',
                      background: '#fff'
                    }}
                  >
                    <option value="general">💬 General Inquiry</option>
                    <option value="billing">💳 Billing & Pro Subscription</option>
                    <option value="technical">⚙️ Technical & PDF Export</option>
                    <option value="templates">📄 Resume Templates</option>
                    <option value="ai_tools">✨ ATS & AI Tools</option>
                    <option value="account">🔒 Account & Security</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
                    Priority
                  </label>
                  <select
                    id="ticket-priority-select"
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: '1px solid var(--border-strong)',
                      fontSize: '0.92rem',
                      background: '#fff'
                    }}
                  >
                    <option value="low">Low — General question</option>
                    <option value="medium">Medium — Normal inquiry</option>
                    <option value="high">High — Urgent feature or tool issue</option>
                    <option value="urgent">Urgent — Account or payment blocker</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
                  Detailed Description <span style={{ color: 'red' }}>*</span>
                </label>
                <textarea
                  id="ticket-message-input"
                  rows={5}
                  placeholder="Please provide details about what happened, steps to reproduce, or what you need help with…"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: '1px solid var(--border-strong)',
                    fontSize: '0.92rem',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>

              {user?.is_pro && (
                <div style={{
                  padding: '10px 14px',
                  background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.08) 0%, rgba(217, 70, 239, 0.08) 100%)',
                  borderRadius: 8,
                  border: '1px solid #ddd6fe',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10
                }}>
                  <Crown size={16} color="#7c3aed" />
                  <span style={{ fontSize: '0.82rem', color: '#6d28d9', fontWeight: 600 }}>
                    Smartcvmaker Pro Member: Your ticket will be routed directly to senior support with 2-hour SLA response.
                  </span>
                </div>
              )}

              <div className="row end" style={{ gap: 12, marginTop: 12 }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-submit-new-ticket"
                  className="btn btn-primary"
                  disabled={creating}
                  style={{ gap: 8 }}
                >
                  {creating ? <RefreshCw size={15} className="spin" /> : <Send size={15} />}
                  Submit Support Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
