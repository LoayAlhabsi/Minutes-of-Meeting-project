import { useEffect, useState, type FormEvent } from 'react'
import { downloadPdf, downloadWord } from './exportMinute'
import './App.css'

type Attendee = { id: string; name: string; designation: string }
type Decision = { id: string; text: string }

type SavedMinute = {
  id: string
  title: string
  location: string
  date: string
  discussion: string
  preparedBy: string
  attendees: Attendee[]
  decisions: Decision[]
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

function uid() {
  return crypto.randomUUID()
}

function todayIso() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function emptyForm() {
  return {
    title: '',
    location: '',
    date: '',
    discussion: '',
    preparedBy: '',
    attendees: [{ id: uid(), name: '', designation: '' }] as Attendee[],
    decisions: [
      { id: uid(), text: '' },
      { id: uid(), text: '' },
    ] as Decision[],
  }
}

function validateForm(
  data: {
    title: string
    location: string
    date: string
    discussion: string
    preparedBy: string
    attendees: Attendee[]
    decisions: Decision[]
  },
  isUpdate: boolean,
) {
  if (!data.title.trim()) return 'Meeting Title is required'
  if (!data.location.trim()) return 'Meeting Location is required'
  if (!data.date) return 'Meeting Date is required'
  if (!isUpdate && data.date < todayIso()) {
    return 'Meeting date cannot be in the past'
  }
  if (!data.discussion.trim()) return 'Discussion and Summary is required'
  if (!data.preparedBy.trim()) return 'Prepared by is required'
  if (
    data.attendees.length === 0 ||
    data.attendees.some((a) => !a.name.trim() || !a.designation.trim())
  ) {
    return 'Please fill Name and Designation for every attendance row'
  }
  if (
    data.decisions.length === 0 ||
    data.decisions.some((d) => !d.text.trim())
  ) {
    return 'Please fill every Recommendation / Decision'
  }
  return ''
}

export default function App() {
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

  async function loadMinutes() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_URL}/minutes`)
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.message || `Load failed (${res.status})`)
      }
      const rows = (await res.json()) as SavedMinute[]
      setSavedList(rows)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load minutes. Is Spring Boot running on port 8080?',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadMinutes()
  }, [])

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

  function resetForm() {
    const next = emptyForm()
    setTitle(next.title)
    setLocation(next.location)
    setDate(next.date)
    setDiscussion(next.discussion)
    setPreparedBy(next.preparedBy)
    setAttendees(next.attendees)
    setDecisions(next.decisions)
    setEditingId(null)
    markDirty()
  }

  function startUpdate(row: SavedMinute) {
    setTitle(row.title)
    setLocation(row.location)
    setDate(row.date)
    setDiscussion(row.discussion)
    setPreparedBy(row.preparedBy)
    setAttendees(
      row.attendees?.length
        ? row.attendees.map((a) => ({
            id: a.id || uid(),
            name: a.name || '',
            designation: a.designation || '',
          }))
        : [{ id: uid(), name: '', designation: '' }],
    )
    setDecisions(
      row.decisions?.length
        ? row.decisions.map((d) => ({
            id: d.id || uid(),
            text: d.text || '',
          }))
        : [{ id: uid(), text: '' }],
    )
    setEditingId(row.id)
    setStatus('Editing — make changes, then Update or Cancel')
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelUpdate() {
    resetForm()
    setStatus('Update cancelled')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setStatus('')

    const validationError = validateForm(
      {
        title,
        location,
        date,
        discussion,
        preparedBy,
        attendees,
        decisions,
      },
      isEditing,
    )
    if (validationError) {
      setError(validationError)
      setSaving(false)
      return
    }

    const payload = {
      title,
      location,
      date,
      discussion,
      preparedBy,
      attendees,
      decisions,
    }

    try {
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
        throw new Error(
          body?.message ||
            `${isEditing ? 'Update' : 'Save'} failed (${res.status})`,
        )
      }
      const doneMessage = isEditing ? 'Updated' : 'Saved'
      const next = emptyForm()
      setTitle(next.title)
      setLocation(next.location)
      setDate(next.date)
      setDiscussion(next.discussion)
      setPreparedBy(next.preparedBy)
      setAttendees(next.attendees)
      setDecisions(next.decisions)
      setEditingId(null)
      setStatus(doneMessage)
      setError('')
      await loadMinutes()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Request failed. Is Spring Boot running on port 8080?',
      )
    } finally {
      setSaving(false)
    }
  }

  const dateMin =
    isEditing && date && date < todayIso() ? date : todayIso()

  return (
    <div className="app">
      <header className="topbar">
        <img
          src="/brand/moh-logo-light.png"
          alt="Ministry of Health"
          className="logo"
        />
        <div className="topbar-title">
          <strong>Minutes of Meeting</strong>
          <span className="ar">محضر الاجتماع</span>
        </div>
      </header>

      <main className="content">
        {isEditing && (
          <div className="banner edit">
            Editing saved minutes. Change the fields below, then press{' '}
            <strong>Update</strong> or <strong>Cancel</strong>.
          </div>
        )}

        <form className="mom" onSubmit={handleSubmit}>
          <section className="block">
            <h2>Meeting</h2>
            <div className="grid-3">
              <label>
                Meeting Title *
                <input
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value)
                    markDirty()
                  }}
                  placeholder="Enter meeting title"
                  required
                />
              </label>
              <label>
                Meeting Location *
                <input
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value)
                    markDirty()
                  }}
                  placeholder="Enter location"
                  required
                />
              </label>
              <label>
                Meeting Date *
                <input
                  type="date"
                  value={date}
                  min={dateMin}
                  onChange={(e) => {
                    setDate(e.target.value)
                    markDirty()
                  }}
                  required
                />
              </label>
            </div>
          </section>

          <section className="block">
            <div className="block-head">
              <h2>Attendance *</h2>
              <button type="button" className="btn-light" onClick={addAttendee}>
                + Add row
              </button>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Designation</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {attendees.map((row, index) => (
                    <tr key={row.id}>
                      <td className="num">{index + 1}</td>
                      <td>
                        <input
                          value={row.name}
                          onChange={(e) =>
                            updateAttendee(row.id, 'name', e.target.value)
                          }
                          placeholder="Full name"
                          required
                        />
                      </td>
                      <td>
                        <input
                          value={row.designation}
                          onChange={(e) =>
                            updateAttendee(
                              row.id,
                              'designation',
                              e.target.value,
                            )
                          }
                          placeholder="Job title"
                          required
                        />
                      </td>
                      <td className="actions">
                        <button
                          type="button"
                          className="btn-text"
                          onClick={() => removeAttendee(row.id)}
                          disabled={attendees.length === 1}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="block">
            <h2>Discussion and Summary *</h2>
            <textarea
              value={discussion}
              onChange={(e) => {
                setDiscussion(e.target.value)
                markDirty()
              }}
              rows={5}
              placeholder="Enter discussion points and summary"
              required
            />
          </section>

          <section className="block">
            <div className="block-head">
              <h2>Recommendations and Decisions *</h2>
              <button type="button" className="btn-light" onClick={addDecision}>
                + Add item
              </button>
            </div>
            <ol className="decisions">
              {decisions.map((row, index) => (
                <li key={row.id}>
                  <span className="decision-num">{index + 1}</span>
                  <input
                    value={row.text}
                    onChange={(e) => updateDecision(row.id, e.target.value)}
                    placeholder="Recommendation or decision"
                    required
                  />
                  <button
                    type="button"
                    className="btn-text"
                    onClick={() => removeDecision(row.id)}
                    disabled={decisions.length === 1}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ol>
          </section>

          <section className="block footer-row">
            <label>
              Prepared by *
              <input
                value={preparedBy}
                onChange={(e) => {
                  setPreparedBy(e.target.value)
                  markDirty()
                }}
                placeholder="Name"
                required
              />
            </label>
            <div className="save-area">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    className="btn-light"
                    onClick={cancelUpdate}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? 'Updating...' : 'Update'}
                  </button>
                </>
              ) : (
                <>
                  <button type="button" className="btn-light" onClick={resetForm}>
                    New
                  </button>
                  <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </>
              )}
              {status && <p className="ok">{status}</p>}
              {error && <p className="err">{error}</p>}
            </div>
          </section>
        </form>

        <section className="block saved-block">
          <div className="block-head">
            <h2>Saved minutes</h2>
            <button
              type="button"
              className="btn-light"
              onClick={() => void loadMinutes()}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
          {savedList.length === 0 ? (
            <p className="empty">No saved minutes yet.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Date</th>
                    <th>Location</th>
                    <th>Prepared by</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {savedList.map((row) => (
                    <tr
                      key={row.id}
                      className={editingId === row.id ? 'row-editing' : undefined}
                    >
                      <td>{row.title || '—'}</td>
                      <td>{row.date || '—'}</td>
                      <td>{row.location || '—'}</td>
                      <td>{row.preparedBy || '—'}</td>
                      <td className="actions-cell">
                        <button
                          type="button"
                          className="btn-light"
                          onClick={() => startUpdate(row)}
                        >
                          Update
                        </button>
                        <button
                          type="button"
                          className="btn-light"
                          onClick={() => void downloadPdf(row)}
                        >
                          PDF
                        </button>
                        <button
                          type="button"
                          className="btn-light"
                          onClick={() => void downloadWord(row)}
                        >
                          Word
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
