import { useState, type FormEvent } from 'react'
import { createAdminUser } from '../../../api/adminApi'
import { t, type Locale } from '../../../localization'

type Props = {
  locale: Locale
  onCreated: () => void
  onCancel?: () => void
}

export function CreateUserForm({ locale, onCreated, onCancel }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'U' | 'A'>('U')
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  function handleNameChange(value: string) {
    setName(value.replace(/[^\p{L} ]/gu, ''))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setStatus('')

    const trimmedName = name.trim()
    if (!trimmedName || !/^[\p{L} ]+$/u.test(trimmedName)) {
      setError(t(locale, 'errNameLettersOnly'))
      setLoading(false)
      return
    }

    try {
      await createAdminUser({
        name: trimmedName,
        email: email.trim(),
        role,
      })
      setName('')
      setEmail('')
      setRole('U')
      onCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : t(locale, 'errRequest'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="mom create-user-form" onSubmit={handleSubmit}>
      <section className="block">
        <h2>{t(locale, 'createAccount')}</h2>
        <div className="grid-2">
          <label>
            {t(locale, 'fullName')}
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
            />
          </label>
          <label>
            {t(locale, 'email')}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
        </div>
        <fieldset className="role-fieldset">
          <legend>{t(locale, 'colRole')}</legend>
          <label className="role-option">
            <input
              type="radio"
              name="role"
              checked={role === 'U'}
              onChange={() => setRole('U')}
            />
            <span>{t(locale, 'roleUser')}</span>
          </label>
          <label className="role-option">
            <input
              type="radio"
              name="role"
              checked={role === 'A'}
              onChange={() => setRole('A')}
            />
            <span>{t(locale, 'roleAdmin')}</span>
          </label>
        </fieldset>
        <p className="muted">{t(locale, 'createUserPasswordHint')}</p>
      </section>

      <section className="block footer-row">
        <div>
          {error ? <p className="err">{error}</p> : null}
          {status ? <p className="ok">{status}</p> : null}
        </div>
        <div className="save-area">
          {onCancel ? (
            <button
              type="button"
              className="btn-light"
              onClick={onCancel}
              disabled={loading}
            >
              {t(locale, 'cancel')}
            </button>
          ) : null}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? t(locale, 'creatingAccount') : t(locale, 'createAccount')}
          </button>
        </div>
      </section>
    </form>
  )
}
