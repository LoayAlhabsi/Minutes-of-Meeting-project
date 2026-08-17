import { apiFetch } from './http'
import type {
  AdminStats,
  AuthUser,
  MinuteSearchRequest,
  PageResponse,
  SavedMinute,
  UserSearchRequest,
} from '../types'

export type MinuteFilters = {
  title?: string
  user?: string
  dateFrom?: string
  dateTo?: string
}

export async function fetchAdminStats(): Promise<AdminStats> {
  return apiFetch<AdminStats>('/admin/stats')
}

export async function fetchAdminUsers(): Promise<AuthUser[]> {
  return apiFetch<AuthUser[]>('/admin/users')
}

export async function searchAdminUsers(
  request: UserSearchRequest,
): Promise<PageResponse<AuthUser>> {
  return apiFetch<PageResponse<AuthUser>>('/admin/users/search', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export async function createAdminUser(payload: {
  name: string
  email: string
  role: 'U' | 'A'
}): Promise<AuthUser> {
  return apiFetch<AuthUser>('/admin/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateUserRole(
  id: string,
  role: 'U' | 'A',
): Promise<AuthUser> {
  return apiFetch<AuthUser>(`/admin/users/${id}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  })
}

export async function updateUserEnabled(
  id: string,
  enabled: boolean,
): Promise<AuthUser> {
  return apiFetch<AuthUser>(`/admin/users/${id}/enabled`, {
    method: 'PUT',
    body: JSON.stringify({ enabled }),
  })
}

export async function fetchAdminMinutes(
  filters: MinuteFilters = {},
): Promise<SavedMinute[]> {
  const params = new URLSearchParams()
  if (filters.title) params.set('title', filters.title)
  if (filters.user) params.set('user', filters.user)
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
  if (filters.dateTo) params.set('dateTo', filters.dateTo)
  const query = params.toString()
  return apiFetch<SavedMinute[]>(`/admin/minutes${query ? `?${query}` : ''}`)
}

export async function searchAdminMinutes(
  request: MinuteSearchRequest,
): Promise<PageResponse<SavedMinute>> {
  return apiFetch<PageResponse<SavedMinute>>('/admin/minutes/search', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}
