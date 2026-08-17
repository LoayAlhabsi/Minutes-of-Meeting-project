import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { PASSWORD_SETUP_REQUIRED } from '../api/authApi'
import { t, type Locale } from '../localization'
import { useAuth } from './AuthContext'
import { PasswordField } from './PasswordField'

type Props = { locale: Locale }

export function LoginPage({ locale }: Props) {
  const { login, setupPassword, isAuthenticated, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [needsSetup, setNeedsSetup] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    return <Navigate to={isAdmin ? '/admin' : '/user'} replace />
  }

  function goAfterLogin(role: string) {
    navigate(role === 'A' ? '/admin' : '/user', { replace: true })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (needsSetup) {
        if (password !== confirmPassword) {
          setError(t(locale, 'errPasswordMismatch'))
          setLoading(false)
          return
        }
        const user = await setupPassword(email.trim(), password)
        goAfterLogin(user.role)
        return
      }

      const user = await login(email.trim(), password)
      goAfterLogin(user.role)
    } catch (err) {
      const message = err instanceof Error ? err.message : t(locale, 'errRequest')
      if (message === PASSWORD_SETUP_REQUIRED) {
        setNeedsSetup(true)
        setPassword('')
        setConfirmPassword('')
        setError('')
      } else {
        setError(message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>
          {needsSetup ? t(locale, 'setupPasswordTitle') : t(locale, 'loginTitle')}
        </h1>
        <p className="auth-sub">
          {needsSetup
            ? t(locale, 'setupPasswordSubtitle')
            : t(locale, 'loginSubtitle')}
        </p>
        <label>
          {t(locale, 'email')}
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (needsSetup) setNeedsSetup(false)
            }}
            autoComplete="email"
            required
            disabled={needsSetup}
          />
        </label>
        {needsSetup ? (
          <>
            <PasswordField
              locale={locale}
              label={t(locale, 'newPassword')}
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
          </>
        ) : (
          <PasswordField
            locale={locale}
            label={t(locale, 'password')}
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            required={false}
          />
        )}
        {error ? <p className="err">{error}</p> : null}
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading
            ? needsSetup
              ? t(locale, 'savingPassword')
              : t(locale, 'loggingIn')
            : needsSetup
              ? t(locale, 'savePassword')
              : t(locale, 'login')}
        </button>
        {!needsSetup ? (
          <p className="auth-switch">
            {t(locale, 'noAccount')}{' '}
            <Link to="/register">{t(locale, 'createAccount')}</Link>
          </p>
        ) : (
          <p className="muted">{t(locale, 'setupPasswordHint')}</p>
        )}
      </form>
    </div>
  )
}
