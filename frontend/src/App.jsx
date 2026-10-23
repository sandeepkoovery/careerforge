import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from './auth'
import { Aurora, Footer, Navbar } from './components/Layout'
import Landing from './pages/Landing'
import { Login, Register } from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Templates from './pages/Templates'
import Builder from './pages/Builder'
import AtsChecker from './pages/AtsChecker'
import CoverLetter from './pages/CoverLetter'
import JobMatch from './pages/JobMatch'
import LinkedIn from './pages/LinkedIn'

import AdminLogin from './pages/AdminLogin'
import AdminVuexy from './pages/AdminVuexy'

function Protected({ children }) {
  const { user, loading } = useAuth()
  const loc = useLocation()
  if (loading) return <div className="empty">Loading…</div>
  return user ? children : <Navigate to="/login" state={{ from: loc.pathname + loc.search }} replace />
}

function AdminProtected({ children }) {
  const { user, loading } = useAuth()
  const loc = useLocation()
  if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: '#6c757d' }}>Verifying Administrator Session…</div>
  if (!user || !user.is_admin) {
    return <Navigate to="/admin/login" state={{ from: loc.pathname }} replace />
  }
  return children
}

export default function App() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  const builder = pathname.startsWith('/builder')
  const isAdmin = pathname.startsWith('/admin')
  const hideChrome = builder || isAdmin

  return (
    <>
      {!isAdmin && <Aurora />}
      {!hideChrome && <Navbar />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/tools/ats" element={<AtsChecker />} />
        <Route path="/tools/job-match" element={<JobMatch />} />
        <Route path="/tools/cover-letter" element={<Protected><CoverLetter /></Protected>} />
        <Route path="/tools/linkedin" element={<Protected><LinkedIn /></Protected>} />
        <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminProtected><AdminVuexy /></AdminProtected>} />
        <Route path="/builder/:id" element={<Protected><Builder /></Protected>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {!hideChrome && <Footer />}
    </>
  )
}
