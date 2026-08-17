import { t, type Locale } from '../../../localization'
import type { AuthUser } from '../../../types'

type Props = {
  locale: Locale
  users: AuthUser[]
  currentUserId?: string
  onPromote: (user: AuthUser) => void
  onDemote: (user: AuthUser) => void
  onToggleEnabled: (user: AuthUser) => void
}

export function AdminUsers({
  locale,
  users,
  currentUserId,
  onPromote,
  onDemote,
  onToggleEnabled,
}: Props) {
  if (users.length === 0) {
    return <p className="empty">{t(locale, 'emptyUsers')}</p>
  }

  return (
    <div className="users-grid" role="table" aria-label={t(locale, 'adminUsers')}>
      <div className="users-grid-header" role="row">
        <div role="columnheader">{t(locale, 'colName')}</div>
        <div role="columnheader">{t(locale, 'email')}</div>
        <div role="columnheader">{t(locale, 'colRole')}</div>
        <div role="columnheader">{t(locale, 'colCreated')}</div>
        <div role="columnheader">{t(locale, 'colStatus')}</div>
        <div className="col-actions" role="columnheader">
          {t(locale, 'colActions')}
        </div>
      </div>
      {users.map((user) => {
        const isSelf = user.id === currentUserId
        return (
          <div key={user.id} className="users-grid-row" role="row">
            <div
              className="grid-cell cell-ellipsis"
              role="cell"
              data-label={t(locale, 'colName')}
              title={user.name || undefined}
            >
              {user.name || '—'}
            </div>
            <div
              className="grid-cell cell-ellipsis"
              role="cell"
              data-label={t(locale, 'email')}
              title={user.email || undefined}
            >
              {user.email || '—'}
            </div>
            <div role="cell" data-label={t(locale, 'colRole')}>
              {user.role === 'A' ? t(locale, 'roleAdmin') : t(locale, 'roleUser')}
            </div>
            <div role="cell" data-label={t(locale, 'colCreated')}>
              {formatDate(user.createdAt)}
            </div>
            <div role="cell" data-label={t(locale, 'colStatus')}>
              {user.enabled
                ? t(locale, 'statusActive')
                : t(locale, 'statusDisabled')}
            </div>
            <div
              className="grid-cell actions-cell col-actions"
              role="cell"
              data-label={t(locale, 'colActions')}
            >
              {user.role === 'U' ? (
                <button
                  type="button"
                  className="btn-light"
                  onClick={() => onPromote(user)}
                >
                  {t(locale, 'promote')}
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-light"
                  disabled={isSelf}
                  onClick={() => onDemote(user)}
                >
                  {t(locale, 'demote')}
                </button>
              )}
              <button
                type="button"
                className="btn-text"
                disabled={isSelf}
                onClick={() => onToggleEnabled(user)}
              >
                {user.enabled ? t(locale, 'disable') : t(locale, 'enable')}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function formatDate(value?: string) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString()
}
