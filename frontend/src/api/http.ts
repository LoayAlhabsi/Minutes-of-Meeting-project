const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const TOKEN_KEY = 'mom-token'

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* ignore */
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }
  const token = getToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers })
  if (res.status === 204) {
    return undefined as T
  }
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(
        body?.message ||
          'API not found (404). Restart Spring Boot so the latest API endpoints are loaded.',
      )
    }
    throw new Error(body?.message || `Request failed (${res.status})`)
  }
  return body as T
}
