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
import Profile from './pages/Profile'
import Support from './pages/Support'

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
  if (!user) {
    return <Navigate to="/admin/login" state={{ from: loc.pathname }} replace />
  }
  const isAdmin = Boolean(user.is_admin && user.is_admin !== '0' && user.is_admin !== 0)
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />
  }
  return children
}

const ROUTE_META = {
  '/': {
    title: 'Smartcvmaker — AI Resume Builder, ATS Checker & Cover Letter Generator',
    desc: 'Build ATS-friendly resumes in minutes. Score your resume against job descriptions, generate tailored cover letters, and optimize your LinkedIn profile with Smartcvmaker.',
  },
  '/templates': {
    title: '10+ Free ATS-Optimized Resume Templates | Smartcvmaker',
    desc: 'Browse our collection of recruiter-approved, ATS-friendly resume templates. Switch templates in one click without losing your content.',
  },
  '/tools/ats': {
    title: 'Free ATS Resume Checker & Compatibility Score | Smartcvmaker',
    desc: 'Check your resume ATS compatibility score for free. Identify missing keywords, formatting errors, and get instant recommendations to pass applicant tracking systems.',
  },
  '/tools/job-match': {
    title: 'AI Resume Job Description Match & Keyword Scanner | Smartcvmaker',
    desc: 'Match your resume against any job description. Uncover missing hard skills, qualifications, and keyword gaps to maximize interview callbacks.',
  },
  '/tools/cover-letter': {
    title: 'AI Cover Letter Generator | Smartcvmaker',
    desc: 'Generate tailored, professional cover letters matched to your target job in 30 seconds using advanced AI.',
  },
  '/tools/linkedin': {
    title: 'LinkedIn Headline & Profile Optimizer | Smartcvmaker',
    desc: 'Transform your LinkedIn profile into a recruiter magnet with AI-generated headlines, summaries, and experience bullet points.',
  },
  '/dashboard': {
    title: 'My Resumes & Career Hub | Smartcvmaker',
    desc: 'Manage your resumes, track ATS scores, and launch resume building tools.',
  },
  '/profile': {
    title: 'My Profile & Account Settings | Smartcvmaker',
    desc: 'Edit your profile details, password, and manage your Smartcvmaker subscription.',
  },
  '/support': {
    title: 'Customer Support & Helpdesk | Smartcvmaker',
    desc: 'Get technical help, template assistance, and talk with our customer support specialists.',
  },
  '/login': {
    title: 'Sign In | Smartcvmaker',
    desc: 'Sign in to access your resumes, ATS reports, and tailored job applications on Smartcvmaker.',
  },
  '/register': {
    title: 'Create Your Free Account | Smartcvmaker',
    desc: 'Start building professional ATS-optimized resumes for free with Smartcvmaker.',
  },
}

export default function App() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
    const meta = ROUTE_META[pathname] || (pathname.startsWith('/builder') ? {
      title: 'Resume Builder | Smartcvmaker',
      desc: 'Edit, customize, and export your resume in real time with Smartcvmaker.'
    } : {
      title: 'Smartcvmaker — AI Resume Builder & Career Suite',
      desc: 'Build ATS-friendly resumes and pass recruiter screens with Smartcvmaker.'
    })
    document.title = meta.title
    const descEl = document.querySelector('meta[name="description"]')
    if (descEl) descEl.setAttribute('content', meta.desc)

    if (typeof window.gtag === 'function') {
      window.gtag('config', 'G-T1VFX38ZZ0', {
        page_title: meta.title,
        page_path: pathname + window.location.search,
      })
    }
  }, [pathname])
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
        <Route path="/profile" element={<Protected><Profile /></Protected>} />
        <Route path="/support" element={<Protected><Support /></Protected>} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminProtected><AdminVuexy /></AdminProtected>} />
        <Route path="/builder/:id" element={<Protected><Builder /></Protected>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {!hideChrome && <Footer />}
    </>
  )
}
