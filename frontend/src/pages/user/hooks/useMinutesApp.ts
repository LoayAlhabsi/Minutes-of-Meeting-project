import { useEffect, useState, type FormEvent } from 'react'
import { deleteMinute, saveMinute, searchMinutes } from '../../../api/minutesApi'
import { useAuth } from '../../../auth/AuthContext'
import { t, type Locale } from '../../../localization'
import type {
  Attendee,
  Decision,
  MinuteLanguage,
  SavedMinute,
} from '../../../types'
import {
  emptyForm,
  normalizeAttendees,
  normalizeDecisions,
  normalizeMinuteLanguage,
  todayIso,
  uid,
  validateForm,
} from '../../../formUtils'

const PAGE_SIZE = 10

export function useMinutesApp(locale: Locale) {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [date, setDate] = useState('')
  const [discussion, setDiscussion] = useState('')
  const [preparedBy, setPreparedBy] = useState(() => user?.name ?? '')
  const [approvedBy, setApprovedBy] = useState('')
  const [language, setLanguage] = useState<MinuteLanguage>('en')
  const [attendees, setAttendees] = useState<Attendee[]>([
    { id: uid(), name: '', designation: '' },
  ])
  const [decisions, setDecisions] = useState<Decision[]>([
    { id: uid(), text: '' },
    { id: uid(), text: '' },
  ])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [savedList, setSavedList] = useState<SavedMinute[]>([])
  const [filterTitle, setFilterTitle] = useState('')
  const [filterPerson, setFilterPerson] = useState('')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')
  const [filterLanguage, setFilterLanguage] = useState<'all' | MinuteLanguage>(
    'all',
  )
  const [page, setPage] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)

  const isEditing = editingId !== null

  useEffect(() => {
    if (!isEditing && user?.name) {
      setPreparedBy(user.name)
    }
  }, [isEditing, user?.name])

  useEffect(() => {
    void loadMinutes(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadMinutes(pageOverride?: number) {
    const nextPage = pageOverride ?? page
    setLoading(true)
    setError('')
    try {
      const result = await searchMinutes({
        title: filterTitle.trim() || undefined,
        person: filterPerson.trim() || undefined,
        dateFrom: filterDateFrom || undefined,
        dateTo: filterDateTo || undefined,
        language: filterLanguage === 'all' ? undefined : filterLanguage,
        sortKey: 'date',
        sortDir: 'desc',
        page: nextPage,
        size: PAGE_SIZE,
      })
      setSavedList(result.content)
      setPage(result.page)
      setTotalElements(result.totalElements)
      setTotalPages(result.totalPages)
    } catch (err) {
      setError(err instanceof Error ? err.message : t(locale, 'errLoad'))
    } finally {
      setLoading(false)
    }
  }

  async function handleSearch(e: FormEvent) {
    e.preventDefault()
    setPage(0)
    await loadMinutes(0)
  }

  async function handleClearFilters() {
    setFilterTitle('')
    setFilterPerson('')
    setFilterDateFrom('')
    setFilterDateTo('')
    setFilterLanguage('all')
    setPage(0)
    setLoading(true)
    setError('')
    try {
      const result = await searchMinutes({
        sortKey: 'date',
        sortDir: 'desc',
        page: 0,
        size: PAGE_SIZE,
      })
      setSavedList(result.content)
      setPage(result.page)
      setTotalElements(result.totalElements)
      setTotalPages(result.totalPages)
    } catch (err) {
      setError(err instanceof Error ? err.message : t(locale, 'errLoad'))
    } finally {
      setLoading(false)
    }
  }

  async function goToPage(next: number) {
    if (next < 0 || (totalPages > 0 && next >= totalPages)) return
    setPage(next)
    await loadMinutes(next)
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
    setApprovedBy(next.approvedBy)
    setLanguage(next.language)
    setAttendees(next.attendees)
    setDecisions(next.decisions)
  }

  function resetForm() {
    applyForm(emptyForm())
    setPreparedBy(user?.name ?? '')
    setApprovedBy('')
    setEditingId(null)
    markDirty()
  }

  function startUpdate(row: SavedMinute) {
    setTitle(row.title)
    setLocation(row.location)
    setDate(row.date)
    setDiscussion(row.discussion)
    setPreparedBy(row.preparedBy)
    setApprovedBy(row.approvedBy || '')
    setLanguage(normalizeMinuteLanguage(row.language))
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

  async function handleDelete(row: SavedMinute) {
    if (!window.confirm(t(locale, 'confirmDelete'))) return
    setError('')
    try {
      await deleteMinute(row.id)
      if (editingId === row.id) resetForm()
      setStatus(t(locale, 'deleted'))
      await loadMinutes(page)
    } catch (err) {
      setError(err instanceof Error ? err.message : t(locale, 'errRequest'))
    }
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
      preparedBy: user?.name || preparedBy.trim(),
      approvedBy: approvedBy.trim(),
      language,
      attendees,
      decisions,
    }

    const validationError = validateForm(language, formData, isEditing)
    if (validationError) {
      setError(validationError)
      setSaving(false)
      return
    }

    try {
      await saveMinute(formData, editingId)
      applyForm(emptyForm())
      setPreparedBy(user?.name ?? '')
      setApprovedBy('')
      setEditingId(null)
      setStatus(isEditing ? t(locale, 'updated') : t(locale, 'saved'))
      setError('')
      await loadMinutes(0)
    } catch (err) {
      setError(err instanceof Error ? err.message : t(locale, 'errRequest'))
    } finally {
      setSaving(false)
    }
  }

  const dateMax = todayIso()

  return {
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
    approvedBy,
    setApprovedBy,
    language,
    setLanguage,
    attendees,
    decisions,
    editingId,
    savedList,
    filterTitle,
    setFilterTitle,
    filterPerson,
    setFilterPerson,
    filterDateFrom,
    setFilterDateFrom,
    filterDateTo,
    setFilterDateTo,
    filterLanguage,
    setFilterLanguage,
    page,
    totalElements,
    totalPages,
    status,
    error,
    saving,
    loading,
    isEditing,
    dateMax,
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
    handleDelete,
    handleSearch,
    handleClearFilters,
    goToPage,
    loadMinutes,
  }
}
