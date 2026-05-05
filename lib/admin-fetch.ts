function getToken(): string | null {
  if (typeof window === 'undefined') return null
  const token = localStorage.getItem('admin_token')
  if (!token) return null
  try {
    const decoded = atob(token.replace(/-/g, '+').replace(/_/g, '/'))
    const expiry = parseInt(decoded.split('.')[0], 10)
    if (Date.now() >= expiry) {
      localStorage.removeItem('admin_token')
      window.location.href = '/admin/login'
      return null
    }
  } catch {
    localStorage.removeItem('admin_token')
    window.location.href = '/admin/login'
    return null
  }
  return token
}

export async function adminFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken()
  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { 'x-admin-token': token } : {}),
    },
  })
  if (res.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('admin_token')
    window.location.href = '/admin/login'
  }
  return res
}
