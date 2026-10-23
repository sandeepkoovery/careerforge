const BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

export const getToken = () => localStorage.getItem('cf_token')
export const setToken = (t) => (t ? localStorage.setItem('cf_token', t) : localStorage.removeItem('cf_token'))

export class ApiError extends Error {
  constructor(message, status, errors) {
    super(message)
    this.status = status
    this.errors = errors || {}
  }
}

let cachedClientIp = null
// Prefetch client public IP in background
if (typeof window !== 'undefined') {
  fetch('https://api.ipify.org?format=json')
    .then((r) => r.json())
    .then((d) => { if (d.ip) cachedClientIp = d.ip })
    .catch(() => {})
}

async function request(method, path, body) {
  const headers = { Accept: 'application/json' }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  if (cachedClientIp) headers['X-Client-IP'] = cachedClientIp
  let payload
  if (body instanceof FormData) payload = body
  else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  let res
  try {
    res = await fetch(`${BASE}${path}`, { method, headers, body: payload })
  } catch {
    throw new ApiError('Cannot reach the server. Make sure the Laravel API is running on port 8000.', 0)
  }
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    const firstError = json.errors && Object.values(json.errors)[0]?.[0]
    throw new ApiError(firstError || json.message || 'Something went wrong', res.status, json.errors)
  }
  return json
}

export const api = {
  get: (p) => request('GET', p),
  post: (p, b) => request('POST', p, b),
  put: (p, b) => request('PUT', p, b),
  del: (p) => request('DELETE', p),
}
