import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import '../vuexy.css'

export default function AdminLogin() {
  const { user, adminLogin } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [remember, setRemember] = useState(true)

  useEffect(() => {
    if (user && Boolean(user.is_admin && user.is_admin !== '0' && user.is_admin !== 0)) {
      nav('/admin', { replace: true })
    }
  }, [user, nav])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await adminLogin(email, password)
      nav('/admin', { replace: true })
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Authentication failed. Please verify credentials.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f7fa',
        fontFamily: "'Public Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '430px',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 4px 18px rgba(47, 43, 61, 0.12)',
          border: '1px solid rgba(47, 43, 61, 0.12)',
          padding: '2.25rem',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <svg width="34" height="24" viewBox="0 0 32 22" fill="none" xmlns="http://www.w3.org/2000/svg">
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
            <span style={{ fontSize: '1.6rem', fontWeight: 700, color: '#2f2b3d', letterSpacing: '-0.5px' }}>
              Smartcvmaker
            </span>
          </div>
          <h4 style={{ margin: '0 0 4px', fontSize: '1.25rem', fontWeight: 600, color: '#2f2b3d' }}>
            Administrator Portal 👋
          </h4>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#8b8893' }}>
            Please sign in with your administrator credentials
          </p>
        </div>

        {user && !user.is_admin && (
          <div
            style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: '#1e40af',
              padding: '10px 14px',
              borderRadius: '6px',
              fontSize: '0.84rem',
              marginBottom: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div>
              Signed in as <strong>{user.name}</strong> ({user.email}). Administrator privileges required below.
            </div>
            <div>
              <Link to="/dashboard" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'underline' }}>
                ← Return to your User Dashboard
              </Link>
            </div>
          </div>
        )}

        {error && (
          <div
            style={{
              backgroundColor: '#fee2e2',
              border: '1px solid rgba(234, 84, 85, 0.3)',
              color: '#ea5455',
              padding: '10px 14px',
              borderRadius: '6px',
              fontSize: '0.86rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} autoComplete="off">
          <div style={{ marginBottom: '1.15rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: '#2f2b3d',
                marginBottom: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.4px',
              }}
            >
              Admin Email
            </label>
            <input
              type="email"
              id="admin_email"
              name="admin_email"
              required
              autoComplete="off"
              placeholder="admin@smartcvmaker.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="vuexy-form-input"
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: '#2f2b3d',
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                }}
              >
                Password
              </label>
            </div>
            <input
              type="password"
              id="admin_password"
              name="admin_password"
              required
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="vuexy-form-input"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.875rem',
                color: '#8b8893',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                className="vuexy-checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Remember Me
            </label>

            <span style={{ fontSize: '0.78rem', color: '#28c76f', fontWeight: 600 }}>
              ● 256-bit Encrypted
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="vuexy-btn-add"
            style={{ width: '100%', height: '42px', justifyContent: 'center', fontSize: '0.95rem' }}
          >
            {loading ? 'Verifying Credentials…' : 'Sign In to Admin Console →'}
          </button>
        </form>

        <div style={{ borderTop: '1px solid rgba(47, 43, 61, 0.12)', marginTop: '1.75rem', paddingTop: '1.25rem', textAlign: 'center' }}>
          <Link to="/" style={{ color: '#7367f0', fontSize: '0.875rem', textDecoration: 'none', fontWeight: 500 }}>
            ← Return to Smartcvmaker
          </Link>
        </div>
      </div>
    </div>
  )
}
