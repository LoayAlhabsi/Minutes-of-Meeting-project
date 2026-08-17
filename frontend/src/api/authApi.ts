import { apiFetch, setToken } from './http'
import type { AuthUser } from '../types'

export const PASSWORD_SETUP_REQUIRED = 'PASSWORD_SETUP_REQUIRED'

export type AuthResponse = {
  token: string
  user: AuthUser
}

export async function login(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const data = await apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  setToken(data.token)
  return data
}

export async function setupPassword(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const data = await apiFetch<AuthResponse>('/auth/setup-password', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  setToken(data.token)
  return data
}

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
  const data = await apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  })
  setToken(data.token)
  return data
}

export function logout() {
  setToken(null)
}

export async function fetchMe(): Promise<AuthUser> {
  return apiFetch<AuthUser>('/auth/me')
}
