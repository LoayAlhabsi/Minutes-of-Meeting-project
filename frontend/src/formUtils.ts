import { t, type Locale } from './localization'
import type { Attendee, Decision, MinuteFormData } from './types'

export function uid() {
  return crypto.randomUUID()
}

export function todayIso() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function emptyForm(): MinuteFormData {
  return {
    title: '',
    location: '',
    date: '',
    discussion: '',
    preparedBy: '',
    attendees: [{ id: uid(), name: '', designation: '' }],
    decisions: [
      { id: uid(), text: '' },
      { id: uid(), text: '' },
    ],
  }
}

export function validateForm(
  locale: Locale,
  data: MinuteFormData,
  isUpdate: boolean,
) {
  if (!data.title.trim()) return t(locale, 'errTitle')
  if (!data.location.trim()) return t(locale, 'errLocation')
  if (!data.date) return t(locale, 'errDate')
  if (!isUpdate && data.date < todayIso()) {
    return t(locale, 'errDatePast')
  }
  if (!data.discussion.trim()) return t(locale, 'errDiscussion')
  if (!data.preparedBy.trim()) return t(locale, 'errPreparedBy')
  if (
    data.attendees.length === 0 ||
    data.attendees.some((a) => !a.name.trim() || !a.designation.trim())
  ) {
    return t(locale, 'errAttendees')
  }
  if (
    data.decisions.length === 0 ||
    data.decisions.some((d) => !d.text.trim())
  ) {
    return t(locale, 'errDecisions')
  }
  return ''
}

export function normalizeAttendees(attendees?: Attendee[]): Attendee[] {
  return attendees?.length
    ? attendees.map((a) => ({
        id: a.id || uid(),
        name: a.name || '',
        designation: a.designation || '',
      }))
    : [{ id: uid(), name: '', designation: '' }]
}

export function normalizeDecisions(decisions?: Decision[]): Decision[] {
  return decisions?.length
    ? decisions.map((d) => ({
        id: d.id || uid(),
        text: d.text || '',
      }))
    : [{ id: uid(), text: '' }]
}
