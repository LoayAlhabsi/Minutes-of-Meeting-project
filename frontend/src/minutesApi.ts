import type { MinuteFormData, SavedMinute } from './types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

export async function fetchMinutes(): Promise<SavedMinute[]> {
  const res = await fetch(`${API_URL}/minutes`)
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.message || `Load failed (${res.status})`)
  }
  return (await res.json()) as SavedMinute[]
}

export async function saveMinute(
  payload: MinuteFormData,
  editingId: string | null,
  failLabel: string,
): Promise<void> {
  const isEditing = editingId !== null
  const res = await fetch(
    isEditing ? `${API_URL}/minutes/${editingId}` : `${API_URL}/minutes`,
    {
      method: isEditing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
  )
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.message || `${failLabel} (${res.status})`)
  }
}
