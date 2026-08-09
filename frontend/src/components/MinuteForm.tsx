import type { FormEvent } from 'react'
import { t, type Locale } from '../localization'
import type { Attendee, Decision } from '../types'

type Props = {
  locale: Locale
  isEditing: boolean
  title: string
  location: string
  date: string
  dateMin: string
  discussion: string
  preparedBy: string
  attendees: Attendee[]
  decisions: Decision[]
  saving: boolean
  status: string
  error: string
  onTitleChange: (value: string) => void
  onLocationChange: (value: string) => void
  onDateChange: (value: string) => void
  onDiscussionChange: (value: string) => void
  onPreparedByChange: (value: string) => void
  onUpdateAttendee: (id: string, field: keyof Attendee, value: string) => void
  onAddAttendee: () => void
  onRemoveAttendee: (id: string) => void
  onUpdateDecision: (id: string, text: string) => void
  onAddDecision: () => void
  onRemoveDecision: (id: string) => void
  onReset: () => void
  onCancelUpdate: () => void
  onSubmit: (e: FormEvent) => void
  onMarkDirty: () => void
}

export function MinuteForm({
  locale,
  isEditing,
  title,
  location,
  date,
  dateMin,
  discussion,
  preparedBy,
  attendees,
  decisions,
  saving,
  status,
  error,
  onTitleChange,
  onLocationChange,
  onDateChange,
  onDiscussionChange,
  onPreparedByChange,
  onUpdateAttendee,
  onAddAttendee,
  onRemoveAttendee,
  onUpdateDecision,
  onAddDecision,
  onRemoveDecision,
  onReset,
  onCancelUpdate,
  onSubmit,
  onMarkDirty,
}: Props) {
  return (
    <form className="mom" onSubmit={onSubmit}>
      <section className="block">
        <h2>{t(locale, 'meeting')}</h2>
        <div className="grid-3">
          <label>
            {t(locale, 'meetingTitle')}
            <input
              value={title}
              onChange={(e) => {
                onTitleChange(e.target.value)
                onMarkDirty()
              }}
              placeholder={t(locale, 'titlePlaceholder')}
              required
            />
          </label>
          <label>
            {t(locale, 'meetingLocation')}
            <input
              value={location}
              onChange={(e) => {
                onLocationChange(e.target.value)
                onMarkDirty()
              }}
              placeholder={t(locale, 'locationPlaceholder')}
              required
            />
          </label>
          <label>
            {t(locale, 'meetingDate')}
            <input
              type="date"
              value={date}
              min={dateMin}
              onChange={(e) => {
                onDateChange(e.target.value)
                onMarkDirty()
              }}
              required
            />
          </label>
        </div>
      </section>

      <section className="block">
        <div className="block-head">
          <h2>{t(locale, 'attendance')}</h2>
          <button type="button" className="btn-light" onClick={onAddAttendee}>
            {t(locale, 'addRow')}
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>{t(locale, 'name')}</th>
                <th>{t(locale, 'designation')}</th>
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
                        onUpdateAttendee(row.id, 'name', e.target.value)
                      }
                      placeholder={t(locale, 'namePlaceholder')}
                      required
                    />
                  </td>
                  <td>
                    <input
                      value={row.designation}
                      onChange={(e) =>
                        onUpdateAttendee(row.id, 'designation', e.target.value)
                      }
                      placeholder={t(locale, 'designationPlaceholder')}
                      required
                    />
                  </td>
                  <td className="actions">
                    <button
                      type="button"
                      className="btn-text"
                      onClick={() => onRemoveAttendee(row.id)}
                      disabled={attendees.length === 1}
                    >
                      {t(locale, 'remove')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="block">
        <h2>{t(locale, 'discussion')}</h2>
        <textarea
          value={discussion}
          onChange={(e) => {
            onDiscussionChange(e.target.value)
            onMarkDirty()
          }}
          rows={5}
          placeholder={t(locale, 'discussionPlaceholder')}
          required
        />
      </section>

      <section className="block">
        <div className="block-head">
          <h2>{t(locale, 'decisions')}</h2>
          <button type="button" className="btn-light" onClick={onAddDecision}>
            {t(locale, 'addItem')}
          </button>
        </div>
        <ol className="decisions">
          {decisions.map((row, index) => (
            <li key={row.id}>
              <span className="decision-num">{index + 1}</span>
              <input
                value={row.text}
                onChange={(e) => onUpdateDecision(row.id, e.target.value)}
                placeholder={t(locale, 'decisionPlaceholder')}
                required
              />
              <button
                type="button"
                className="btn-text"
                onClick={() => onRemoveDecision(row.id)}
                disabled={decisions.length === 1}
              >
                {t(locale, 'remove')}
              </button>
            </li>
          ))}
        </ol>
      </section>

      <section className="block footer-row">
        <label>
          {t(locale, 'preparedBy')}
          <input
            value={preparedBy}
            onChange={(e) => {
              onPreparedByChange(e.target.value)
              onMarkDirty()
            }}
            placeholder={t(locale, 'preparedByPlaceholder')}
            required
          />
        </label>
        <div className="save-area">
          {isEditing ? (
            <>
              <button
                type="button"
                className="btn-light"
                onClick={onCancelUpdate}
                disabled={saving}
              >
                {t(locale, 'cancel')}
              </button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? t(locale, 'updating') : t(locale, 'update')}
              </button>
            </>
          ) : (
            <>
              <button type="button" className="btn-light" onClick={onReset}>
                {t(locale, 'new')}
              </button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? t(locale, 'saving') : t(locale, 'save')}
              </button>
            </>
          )}
          {status && <p className="ok">{status}</p>}
          {error && <p className="err">{error}</p>}
        </div>
      </section>
    </form>
  )
}
