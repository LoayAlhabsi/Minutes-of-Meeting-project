import { useState, type FormEvent } from 'react'
import {
  convertMeetingReport,
  downloadDefaultMeetingReport,
} from '../../meetingReportWord'
import { t, type Locale } from '../../localization'

type Props = { locale: Locale }

export function MeetingReportPage({ locale }: Props) {
  const [title, setTitle] = useState('')
  const [discussion, setDiscussion] = useState('')
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  function clearMessages() {
    setStatus('')
    setError('')
  }

  async function handleConvert(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    clearMessages()
    try {
      if (!title.trim()) throw new Error(t(locale, 'errTitle'))
      if (!discussion.trim()) throw new Error(t(locale, 'errDiscussion'))
      await convertMeetingReport({ title, discussion })
      setStatus(t(locale, 'reportConverted'))
    } catch (err) {
      setError(err instanceof Error ? err.message : t(locale, 'errRequest'))
    } finally {
      setBusy(false)
    }
  }

  async function handleDownloadDefault() {
    setBusy(true)
    clearMessages()
    try {
      await downloadDefaultMeetingReport()
      setStatus(t(locale, 'reportDefaultDownloaded'))
    } catch (err) {
      setError(err instanceof Error ? err.message : t(locale, 'errRequest'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-intro">
        <h1>{t(locale, 'navMeetingReport')}</h1>
        <p>{t(locale, 'reportFormatSub')}</p>
      </div>

      <div className="block document-format-form">
        <div className="filter-actions" style={{ marginBottom: '1rem' }}>
          <button
            type="button"
            className="btn-primary"
            disabled={busy}
            onClick={() => void handleDownloadDefault()}
          >
            {t(locale, 'reportDownloadDefault')}
          </button>
        </div>

        <form onSubmit={handleConvert}>
          <h2>{t(locale, 'reportConvertSection')}</h2>
          <p className="muted">{t(locale, 'reportConvertHint')}</p>

          <label>
            {t(locale, 'reportTitle')} *
            <input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                clearMessages()
              }}
              placeholder={t(locale, 'reportTitlePlaceholder')}
              required
              dir="auto"
            />
          </label>

          <label>
            {t(locale, 'reportDiscussion')} *
            <textarea
              rows={8}
              value={discussion}
              onChange={(e) => {
                setDiscussion(e.target.value)
                clearMessages()
              }}
              placeholder={t(locale, 'reportDiscussionPlaceholder')}
              required
              dir="auto"
            />
          </label>

          {error ? <p className="err">{error}</p> : null}
          {status ? <p className="ok">{status}</p> : null}

          <div className="filter-actions">
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? t(locale, 'reportConverting') : t(locale, 'reportConvert')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
