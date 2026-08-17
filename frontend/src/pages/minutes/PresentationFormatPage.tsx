import { useState, type FormEvent } from 'react'
import { useAuth } from '../../auth/AuthContext'
import {
  convertPresentationPpt,
  downloadDefaultPresentationFormat,
} from '../../presentationPpt'
import { t, type Locale } from '../../localization'

type Props = { locale: Locale }

export function PresentationFormatPage({ locale }: Props) {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [name, setName] = useState(() => user?.name ?? '')
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  async function handleConvert(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    setStatus('')
    try {
      if (!title.trim()) throw new Error(t(locale, 'pptErrTitle'))
      if (!name.trim()) throw new Error(t(locale, 'pptErrName'))
      await convertPresentationPpt({ title, name })
      setStatus(t(locale, 'pptConverted'))
    } catch (err) {
      setError(err instanceof Error ? err.message : t(locale, 'errRequest'))
    } finally {
      setBusy(false)
    }
  }

  async function handleDownloadDefault() {
    setBusy(true)
    setError('')
    setStatus('')
    try {
      await downloadDefaultPresentationFormat()
      setStatus(t(locale, 'pptDefaultDownloaded'))
    } catch (err) {
      setError(err instanceof Error ? err.message : t(locale, 'errRequest'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-intro">
        <h1>{t(locale, 'navPresentationFormat')}</h1>
        <p>{t(locale, 'pptFormatSub')}</p>
      </div>

      <form className="block document-format-form" onSubmit={handleConvert}>
        <h2>{t(locale, 'pptConvertSection')}</h2>
        <p className="muted">{t(locale, 'pptConvertHint')}</p>

        <label>
          {t(locale, 'pptTitle')} *
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              setStatus('')
              setError('')
            }}
            placeholder={t(locale, 'pptTitlePlaceholder')}
            required
            dir="auto"
          />
        </label>

        <label>
          {t(locale, 'pptName')} *
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setStatus('')
              setError('')
            }}
            placeholder={t(locale, 'pptNamePlaceholder')}
            required
            dir="auto"
          />
        </label>

        {error ? <p className="err">{error}</p> : null}
        {status ? <p className="ok">{status}</p> : null}

        <div className="filter-actions">
          <button type="submit" className="btn-primary" disabled={busy}>
            {busy ? t(locale, 'pptConverting') : t(locale, 'pptConvert')}
          </button>
          <button
            type="button"
            className="btn-light"
            disabled={busy}
            onClick={() => void handleDownloadDefault()}
          >
            {t(locale, 'pptDownloadDefault')}
          </button>
        </div>
      </form>
    </div>
  )
}
