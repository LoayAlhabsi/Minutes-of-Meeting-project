import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  searchAdminUsers,
  updateUserEnabled,
  updateUserRole,
} from '../../../api/adminApi'
import { useAuth } from '../../../auth/AuthContext'
import { t, type Locale } from '../../../localization'
import type { AuthUser } from '../../../types'
import { AdminUsers } from '../components/AdminUsers'

type Props = { locale: Locale }
type RoleFilter = 'all' | 'U' | 'A'
type StatusFilter = 'all' | 'active' | 'disabled'

const PAGE_SIZE = 10

export function ManageUsersPage({ locale }: Props) {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [users, setUsers] = useState<AuthUser[]>([])
  const [query, setQuery] = useState('')
  const [role, setRole] = useState<RoleFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [page, setPage] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)

  const load = useCallback(
    async (pageOverride?: number) => {
      const nextPage = pageOverride ?? page
      setLoading(true)
      setError('')
      try {
        const result = await searchAdminUsers({
          query: query.trim() || undefined,
          role,
          status: statusFilter,
          sortKey: 'createdAt',
          sortDir: 'desc',
          page: nextPage,
          size: PAGE_SIZE,
        })
        setUsers(result.content)
        setPage(result.page)
        setTotalElements(result.totalElements)
        setTotalPages(result.totalPages)
      } catch (err) {
        setError(err instanceof Error ? err.message : t(locale, 'errLoad'))
      } finally {
        setLoading(false)
      }
    },
    [page, query, role, statusFilter, locale],
  )

  useEffect(() => {
    void load(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const userCreated = (location.state as { userCreated?: boolean } | null)
      ?.userCreated
    if (userCreated) {
      setNotice(t(locale, 'userCreatedNoPassword'))
      navigate('/admin/users', { replace: true, state: null })
    }
  }, [locale, location.state, navigate])

  async function handleSearch(e: FormEvent) {
    e.preventDefault()
    setPage(0)
    await load(0)
  }

  async function handleClear() {
    setQuery('')
    setRole('all')
    setStatusFilter('all')
    setPage(0)
    setLoading(true)
    setError('')
    try {
      const result = await searchAdminUsers({
        role: 'all',
        status: 'all',
        sortKey: 'createdAt',
        sortDir: 'desc',
        page: 0,
        size: PAGE_SIZE,
      })
      setUsers(result.content)
      setPage(result.page)
      setTotalElements(result.totalElements)
      setTotalPages(result.totalPages)
    } catch (err) {
      setError(err instanceof Error ? err.message : t(locale, 'errLoad'))
    } finally {
      setLoading(false)
    }
  }

  async function goToPage(next: number) {
    if (next < 0 || (totalPages > 0 && next >= totalPages)) return
    setPage(next)
    await load(next)
  }

  async function promote(u: AuthUser) {
    setError('')
    try {
      await updateUserRole(u.id, 'A')
      setNotice(t(locale, 'userPromoted'))
      await load(page)
    } catch (err) {
      setError(err instanceof Error ? err.message : t(locale, 'errRequest'))
    }
  }

  async function demote(u: AuthUser) {
    setError('')
    try {
      await updateUserRole(u.id, 'U')
      setNotice(t(locale, 'userDemoted'))
      await load(page)
    } catch (err) {
      setError(err instanceof Error ? err.message : t(locale, 'errRequest'))
    }
  }

  async function toggleEnabled(u: AuthUser) {
    setError('')
    try {
      await updateUserEnabled(u.id, !u.enabled)
      setNotice(u.enabled ? t(locale, 'userDisabled') : t(locale, 'userEnabled'))
      await load(page)
    } catch (err) {
      setError(err instanceof Error ? err.message : t(locale, 'errRequest'))
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-intro">
        <h1>{t(locale, 'navManageUsers')}</h1>
        <p>{t(locale, 'manageUsersSub')}</p>
      </div>
      {error ? <p className="err">{error}</p> : null}
      {notice ? <p className="ok">{notice}</p> : null}

      <section className="block">
        <div className="block-head">
          <h2>
            {t(locale, 'adminUsers')}
            <span className="muted result-count"> ({totalElements})</span>
          </h2>
          <div className="block-head-actions">
            <Link className="btn-primary" to="/admin/users/create">
              {t(locale, 'createAccount')}
            </Link>
            <button
              type="button"
              className="btn-light"
              onClick={() => void load(page)}
              disabled={loading}
            >
              {loading ? t(locale, 'loading') : t(locale, 'refresh')}
            </button>
          </div>
        </div>

        <form className="filter-row filter-row-users" onSubmit={(e) => void handleSearch(e)}>
          <label>
            {t(locale, 'filterUser')}
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t(locale, 'filterUserPlaceholder')}
            />
          </label>
          <label>
            {t(locale, 'filterRole')}
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as RoleFilter)}
            >
              <option value="all">{t(locale, 'filterRoleAll')}</option>
              <option value="U">{t(locale, 'roleUser')}</option>
              <option value="A">{t(locale, 'roleAdmin')}</option>
            </select>
          </label>
          <label>
            {t(locale, 'filterStatus')}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            >
              <option value="all">{t(locale, 'filterStatusAll')}</option>
              <option value="active">{t(locale, 'statusActive')}</option>
              <option value="disabled">{t(locale, 'statusDisabled')}</option>
            </select>
          </label>
          <div className="filter-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? t(locale, 'loading') : t(locale, 'search')}
            </button>
            <button type="button" className="btn-light" onClick={() => void handleClear()}>
              {t(locale, 'clear')}
            </button>
          </div>
        </form>

        {loading ? <p className="muted">{t(locale, 'loading')}</p> : null}
        <AdminUsers
          locale={locale}
          users={users}
          currentUserId={user?.id}
          onPromote={(u) => void promote(u)}
          onDemote={(u) => void demote(u)}
          onToggleEnabled={(u) => void toggleEnabled(u)}
        />
        {totalElements > 0 ? (
          <div className="pagination-bar">
            <button
              type="button"
              className="btn-light"
              disabled={loading || page <= 0}
              onClick={() => void goToPage(page - 1)}
            >
              {t(locale, 'prevPage')}
            </button>
            <span className="muted">
              {t(locale, 'pageOf')
                .replace('{page}', String(page + 1))
                .replace('{pages}', String(Math.max(totalPages, 1)))}
            </span>
            <button
              type="button"
              className="btn-light"
              disabled={loading || totalPages === 0 || page >= totalPages - 1}
              onClick={() => void goToPage(page + 1)}
            >
              {t(locale, 'nextPage')}
            </button>
          </div>
        ) : null}
      </section>
    </div>
  )
}
