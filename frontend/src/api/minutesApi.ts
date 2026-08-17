import { apiFetch } from './http'
import type {
  MinuteFormData,
  MinuteSearchRequest,
  PageResponse,
  SavedMinute,
} from '../types'

export async function fetchMinutes(): Promise<SavedMinute[]> {
  return apiFetch<SavedMinute[]>('/minutes')
}

export async function searchMinutes(
  request: MinuteSearchRequest,
): Promise<PageResponse<SavedMinute>> {
  return apiFetch<PageResponse<SavedMinute>>('/minutes/search', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export async function saveMinute(
  payload: MinuteFormData,
  editingId: string | null,
): Promise<void> {
  const isEditing = editingId !== null
  await apiFetch(isEditing ? `/minutes/${editingId}` : '/minutes', {
    method: isEditing ? 'PUT' : 'POST',
    body: JSON.stringify(payload),
  })
}

export async function deleteMinute(id: string): Promise<void> {
  await apiFetch<void>(`/minutes/${id}`, { method: 'DELETE' })
}
