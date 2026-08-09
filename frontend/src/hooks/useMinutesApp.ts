import { useEffect, useState, type FormEvent } from 'react'
import {
  applyDocumentLocale,
  getStoredLocale,
  storeLocale,
  t,
  type Locale,
} from '../localization'
import { fetchMinutes, saveMinute } from '../minutesApi'
import {
  emptyForm,
  normalizeAttendees,
  normalizeDecisions,
  todayIso,
  uid,
  validateForm,
} from '../formUtils'
import type { Attendee, Decision, SavedMinute } from '../types'

export function useMinutesApp() {
  const [locale, setLocale] = useState<Locale>(() => getStoredLocale())
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [date, setDate] = useState('')
  const [discussion, setDiscussion] = useState('')
  const [preparedBy, setPreparedBy] = useState('')
  const [attendees, setAttendees] = useState<Attendee[]>([
    { id: uid(), name: '', designation: '' },
  ])
  const [decisions, setDecisions] = useState<Decision[]>([
    { id: uid(), text: '' },
    { id: uid(), text: '' },
  ])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [savedList, setSavedList] = useState<SavedMinute[]>([])
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)

  const isEditing = editingId !== null

  useEffect(() => {
    applyDocumentLocale(locale)
    storeLocale(locale)
  }, [locale])

  useEffect(() => {
    void loadMinutes()
  }, [])

  function setLang(next: Locale) {
    setLocale(next)
    setStatus('')
    setError('')
  }

  async function loadMinutes() {
    setLoading(true)
    setError('')
    try {
      setSavedList(await fetchMinutes())
    } catch (err) {
      setError(err instanceof Error ? err.message : t(locale, 'errLoad'))
    } finally {
      setLoading(false)
    }
  }

  function markDirty() {
    setStatus('')
    setError('')
  }

  function updateAttendee(id: string, field: keyof Attendee, value: string) {
    setAttendees((rows) =>
      rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    )
    markDirty()
  }

  function addAttendee() {
    setAttendees((rows) => [...rows, { id: uid(), name: '', designation: '' }])
    markDirty()
  }

  function removeAttendee(id: string) {
    setAttendees((rows) =>
      rows.length === 1 ? rows : rows.filter((row) => row.id !== id),
    )
    markDirty()
  }

  function updateDecision(id: string, text: string) {
    setDecisions((rows) =>
      rows.map((row) => (row.id === id ? { ...row, text } : row)),
    )
    markDirty()
  }

  function addDecision() {
    setDecisions((rows) => [...rows, { id: uid(), text: '' }])
    markDirty()
  }

  function removeDecision(id: string) {
    setDecisions((rows) =>
      rows.length === 1 ? rows : rows.filter((row) => row.id !== id),
    )
    markDirty()
  }

  function applyForm(next: ReturnType<typeof emptyForm>) {
    setTitle(next.title)
    setLocation(next.location)
    setDate(next.date)
    setDiscussion(next.discussion)
    setPreparedBy(next.preparedBy)
    setAttendees(next.attendees)
    setDecisions(next.decisions)
  }

  function resetForm() {
    applyForm(emptyForm())
    setEditingId(null)
    markDirty()
  }

  function startUpdate(row: SavedMinute) {
    setTitle(row.title)
    setLocation(row.location)
    setDate(row.date)
    setDiscussion(row.discussion)
    setPreparedBy(row.preparedBy)
    setAttendees(normalizeAttendees(row.attendees))
    setDecisions(normalizeDecisions(row.decisions))
    setEditingId(row.id)
    setStatus(t(locale, 'editingStatus'))
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelUpdate() {
    resetForm()
    setStatus(t(locale, 'updateCancelled'))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setStatus('')

    const formData = {
      title,
      location,
      date,
      discussion,
      preparedBy,
      attendees,
      decisions,
    }

    const validationError = validateForm(locale, formData, isEditing)
    if (validationError) {
      setError(validationError)
      setSaving(false)
      return
    }

    try {
      await saveMinute(
        formData,
        editingId,
        isEditing ? t(locale, 'errUpdateFailed') : t(locale, 'errSaveFailed'),
      )
      applyForm(emptyForm())
      setEditingId(null)
      setStatus(isEditing ? t(locale, 'updated') : t(locale, 'saved'))
      setError('')
      await loadMinutes()
    } catch (err) {
      setError(err instanceof Error ? err.message : t(locale, 'errRequest'))
    } finally {
      setSaving(false)
    }
  }

  const dateMin =
    isEditing && date && date < todayIso() ? date : todayIso()

  return {
    locale,
    setLang,
    title,
    setTitle,
    location,
    setLocation,
    date,
    setDate,
    discussion,
    setDiscussion,
    preparedBy,
    setPreparedBy,
    attendees,
    decisions,
    editingId,
    savedList,
    status,
    error,
    saving,
    loading,
    isEditing,
    dateMin,
    markDirty,
    updateAttendee,
    addAttendee,
    removeAttendee,
    updateDecision,
    addDecision,
    removeDecision,
    resetForm,
    startUpdate,
    cancelUpdate,
    handleSubmit,
    loadMinutes,
  }
}
