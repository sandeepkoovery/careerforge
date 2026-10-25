import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../auth'

function AuthForm({ mode }) {
  const { login, register } = useAuth()
  const nav = useNavigate()
  const loc = useLocation()
  const [f, setF] = useState({ name: '', email: '', password: '' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const isReg = mode === 'register'
  const dest = loc.state?.from || '/dashboard'

  const submit = async (e) => {
    e.preventDefault()
    setErr(''); setBusy(true)
    try {
      let r
      if (isReg) r = await register(f.name, f.email, f.password)
      else r = await login(f.email, f.password)
      const loggedUser = r?.user
      const isUserAdmin = Boolean(loggedUser?.is_admin && loggedUser.is_admin !== '0' && loggedUser.is_admin !== 0)
      const targetDest = (!isUserAdmin && dest.startsWith('/admin')) ? '/dashboard' : dest
      nav(targetDest, { replace: true })
    } catch (ex) {
      setErr(ex.message)
    } finally { setBusy(false) }
  }

  return (
    <main className="auth-wrap">
      <form className="card auth-card fade-in" onSubmit={submit}>
        <h1 style={{ fontSize: '1.9rem', marginBottom: 6 }}>{isReg ? 'Create your account' : 'Welcome back'}</h1>
        <p className="muted" style={{ marginBottom: 24 }}>{isReg ? 'Start building ATS-friendly resumes for free.' : 'Log in to continue to your dashboard.'}</p>
        {err && <div className="alert alert-error" style={{ marginBottom: 16 }}>{err}</div>}
        {isReg && (
          <div className="field"><label className="label" htmlFor="name">Full name</label>
            <input id="name" className="input" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Jane Doe" /></div>
        )}
        <div className="field"><label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" className="input" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="you@example.com" /></div>
        <div className="field"><label className="label" htmlFor="password">Password</label>
          <input id="password" type="password" className="input" required minLength={isReg ? 8 : 1} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} placeholder={isReg ? 'At least 8 characters' : '••••••••'} /></div>
        <button id="auth-submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 8 }} disabled={busy}>
          {busy && <Loader2 size={18} className="spin" />} {isReg ? 'Create account' : 'Log in'}
        </button>
        <p className="muted small center" style={{ marginTop: 20 }}>
          {isReg ? <>Already have an account? <Link to="/login" state={loc.state} style={{ color: '#c4b5fd' }}>Log in</Link></>
            : <>New here? <Link to="/register" state={loc.state} style={{ color: '#c4b5fd' }}>Create an account</Link></>}
        </p>
        <div style={{ textAlign: 'center', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
          <Link to="/admin/login" style={{ color: 'var(--muted)', fontSize: '0.8rem', textDecoration: 'none' }}>
            🛡️ Administrator Portal Login &rarr;
          </Link>
        </div>
      </form>
    </main>
  )
}

export const Login = () => <AuthForm mode="login" />
export const Register = () => <AuthForm mode="register" />
