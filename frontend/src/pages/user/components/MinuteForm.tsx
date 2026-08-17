import type { FormEvent } from 'react'
import { t, type Locale } from '../../../localization'
import type { Attendee, Decision, MinuteLanguage } from '../../../types'

type Props = {
  locale: Locale
  isEditing: boolean
  language: MinuteLanguage
  title: string
  location: string
  date: string
  dateMax: string
  discussion: string
  preparedBy: string
  approvedBy: string
  attendees: Attendee[]
  decisions: Decision[]
  saving: boolean
  status: string
  error: string
  onLanguageChange: (value: MinuteLanguage) => void
  onTitleChange: (value: string) => void
  onLocationChange: (value: string) => void
  onDateChange: (value: string) => void
  onDiscussionChange: (value: string) => void
  onPreparedByChange: (value: string) => void
  onApprovedByChange: (value: string) => void
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
  language,
  title,
  location,
  date,
  dateMax,
  discussion,
  preparedBy,
  approvedBy,
  attendees,
  decisions,
  saving,
  status,
  error,
  onLanguageChange,
  onTitleChange,
  onLocationChange,
  onDateChange,
  onDiscussionChange,
  onPreparedByChange,
  onApprovedByChange,
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
    <form
      className="mom"
      onSubmit={onSubmit}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      lang={locale}
    >
      <section className="block">
        <h2>{t(locale, 'meeting')}</h2>
        <label>
          {t(locale, 'docLanguage')}
          <select
            value={language}
            onChange={(e) => {
              onLanguageChange(e.target.value as MinuteLanguage)
              onMarkDirty()
            }}
            disabled={isEditing}
          >
            <option value="en">{t(locale, 'langEnglish')}</option>
            <option value="ar">{t(locale, 'langArabic')}</option>
          </select>
          {isEditing ? (
            <span className="muted">{t(locale, 'docLanguageLocked')}</span>
          ) : (
            <span className="muted">{t(locale, 'docLanguageHint')}</span>
          )}
        </label>
        <label className="meeting-title">
          {t(locale, 'meetingTitle')}
          <textarea
            value={title}
            onChange={(e) => {
              onTitleChange(e.target.value)
              onMarkDirty()
            }}
            placeholder={t(locale, 'titlePlaceholder')}
            rows={2}
            required
          />
        </label>
        <div className="grid-2">
          <label>
            {t(locale, 'meetingLocation')}
            <textarea
              value={location}
              onChange={(e) => {
                onLocationChange(e.target.value)
                onMarkDirty()
              }}
              placeholder={t(locale, 'locationPlaceholder')}
              rows={2}
              required
            />
          </label>
          <label>
            {t(locale, 'meetingDate')}
            <input
              type="date"
              value={date}
              max={dateMax}
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
          <h2>
            {t(locale, 'attendance')}
            <span className="muted result-count"> ({attendees.length})</span>
          </h2>
          <button type="button" className="btn-light" onClick={onAddAttendee}>
            {t(locale, 'addRow')}
          </button>
        </div>
        <div className="table-wrap table-wrap-scroll">
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
          className="discussion-field"
          value={discussion}
          onChange={(e) => {
            onDiscussionChange(e.target.value)
            onMarkDirty()
          }}
          rows={10}
          placeholder={t(locale, 'discussionPlaceholder')}
          required
        />
      </section>

      <section className="block">
        <div className="block-head">
          <h2>
            {t(locale, 'decisions')}
            <span className="muted result-count"> ({decisions.length})</span>
          </h2>
          <button type="button" className="btn-light" onClick={onAddDecision}>
            {t(locale, 'addItem')}
          </button>
        </div>
        <ol className="decisions decisions-scroll">
          {decisions.map((row, index) => (
            <li key={row.id}>
              <span className="decision-num">{index + 1}</span>
              <textarea
                value={row.text}
                onChange={(e) => onUpdateDecision(row.id, e.target.value)}
                placeholder={t(locale, 'decisionPlaceholder')}
                rows={2}
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
            readOnly
            aria-readonly="true"
            className="readonly-field"
          />
          <span className="muted">{t(locale, 'preparedByAutoHint')}</span>
        </label>
        <label>
          {t(locale, 'approvedBy')} *
          <input
            value={approvedBy}
            onChange={(e) => {
              onApprovedByChange(e.target.value)
              onMarkDirty()
            }}
            placeholder={t(locale, 'approvedByPlaceholder')}
            required
          />
          <span className="muted">{t(locale, 'approvedByHint')}</span>
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
