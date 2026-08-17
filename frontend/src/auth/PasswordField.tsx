import { useState } from 'react'
import { t, type Locale } from '../localization'

type Props = {
  locale: Locale
  label: string
  value: string
  onChange: (value: string) => void
  autoComplete?: string
  minLength?: number
  required?: boolean
}

export function PasswordField({
  locale,
  label,
  value,
  onChange,
  autoComplete = 'current-password',
  minLength,
  required = true,
}: Props) {
  const [visible, setVisible] = useState(false)

  return (
    <label className="password-field">
      {label}
      <div className="password-input-wrap">
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          minLength={minLength}
          required={required}
        />
        <button
          type="button"
          className="password-toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? t(locale, 'hidePassword') : t(locale, 'showPassword')}
          title={visible ? t(locale, 'hidePassword') : t(locale, 'showPassword')}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </label>
  )
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 5c-5 0-9.27 3.11-11 7 1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-8a3 3 0 1 0 .001 6.001A3 3 0 0 0 12 9z"
      />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        fill="currentColor"
        d="M2.1 3.51 3.51 2.1l18.38 18.39-1.41 1.41-2.34-2.34A12.7 12.7 0 0 1 12 19c-5 0-9.27-3.11-11-7a13.3 13.3 0 0 1 4.2-5.16L2.1 3.51zM12 7a5 5 0 0 1 4.9 4.05l-1.57-1.57A3 3 0 0 0 12.5 8.2L12 7zm0-2c5 0 9.27 3.11 11 7a13.4 13.4 0 0 1-3.45 4.53l-1.45-1.45A11.4 11.4 0 0 0 21.17 12C19.5 8.56 15.96 6.3 12 6.3c-.7 0-1.38.07-2.04.2L8.4 4.94A12.7 12.7 0 0 1 12 5z"
      />
    </svg>
  )
}
