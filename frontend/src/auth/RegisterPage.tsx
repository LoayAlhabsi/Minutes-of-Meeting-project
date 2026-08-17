import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { t, type Locale } from '../localization'
import { useAuth } from './AuthContext'
import { PasswordField } from './PasswordField'

type Props = { locale: Locale }

export function RegisterPage({ locale }: Props) {
  const { register, isAuthenticated, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    return <Navigate to={isAdmin ? '/admin' : '/user'} replace />
  }

  function handleNameChange(value: string) {
    // Letters and spaces only (EN/AR); block numbers and symbols while typing
    setName(value.replace(/[^\p{L} ]/gu, ''))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const trimmedName = name.trim()
    if (!trimmedName || !/^[\p{L} ]+$/u.test(trimmedName)) {
      setError(t(locale, 'errNameLettersOnly'))
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError(t(locale, 'errPasswordMismatch'))
      setLoading(false)
      return
    }

    try {
      await register(trimmedName, email.trim(), password)
      navigate('/user', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : t(locale, 'errRequest'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>{t(locale, 'registerTitle')}</h1>
        <p className="auth-sub">{t(locale, 'registerSubtitle')}</p>
        <label>
          {t(locale, 'fullName')}
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            autoComplete="name"
            inputMode="text"
            title={t(locale, 'errNameLettersOnly')}
            required
          />
        </label>
        <label>
          {t(locale, 'email')}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>
        <PasswordField
          locale={locale}
          label={t(locale, 'password')}
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          minLength={6}
        />
        <PasswordField
          locale={locale}
          label={t(locale, 'confirmPassword')}
          value={confirmPassword}
          onChange={setConfirmPassword}
          autoComplete="new-password"
          minLength={6}
        />
        {error ? <p className="err">{error}</p> : null}
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? t(locale, 'creatingAccount') : t(locale, 'createAccount')}
        </button>
        <p className="auth-switch">
          {t(locale, 'haveAccount')}{' '}
          <Link to="/login">{t(locale, 'login')}</Link>
        </p>
      </form>
    </div>
  )
}
