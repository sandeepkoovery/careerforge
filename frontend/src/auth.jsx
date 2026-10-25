import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api, getToken, setToken } from './api'

const AuthCtx = createContext(null)
export const useAuth = () => useContext(AuthCtx)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(!!getToken())

  useEffect(() => {
    if (!getToken()) return
    api.get('/auth/me')
      .then((r) => setUser(r.user))
      .catch(() => setToken(null))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const r = await api.post('/auth/login', { email, password })
    setToken(r.token)
    setUser(r.user)
  }, [])

  const adminLogin = useCallback(async (email, password) => {
    const r = await api.post('/admin/login', { email, password })
    setToken(r.token)
    setUser(r.user)
    return r
  }, [])

  const register = useCallback(async (name, email, password) => {
    const r = await api.post('/auth/register', { name, email, password })
    setToken(r.token)
    setUser(r.user)
  }, [])

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout') } catch { /* token already invalid */ }
    setToken(null)
    setUser(null)
  }, [])

  const upgrade = useCallback(async (isPro = true) => {
    const r = await api.post('/user/upgrade', { is_pro: isPro })
    setUser(r.user)
    return r
  }, [])

  const updateProfile = useCallback(async (data) => {
    const r = await api.put('/user/profile', data)
    setUser(r.user)
    return r
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const r = await api.get('/auth/me')
      setUser(r.user)
      return r.user
    } catch {
      return null
    }
  }, [])

  return (
    <AuthCtx.Provider value={{ user, setUser, loading, login, adminLogin, register, logout, upgrade, updateProfile, refreshUser }}>
      {children}
    </AuthCtx.Provider>
  )
}
