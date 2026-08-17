import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchAdminUsers, searchAdminMinutes } from '../../../api/adminApi'
import { deleteMinute } from '../../../api/minutesApi'
import { useAuth } from '../../../auth/AuthContext'
import { downloadPdf, downloadWord } from '../../../pdfWordConverter'
import { todayIso, minuteExportLocale } from '../../../formUtils'
import { t, type Locale } from '../../../localization'
import { PersonNameCell } from '../../user/components/PersonNameCell'
import { EditIcon } from '../../../components/icons/EditIcon'
import type { AuthUser, MinuteLanguage, SavedMinute } from '../../../types'

type Props = { locale: Locale }
type SortKey = 'title' | 'date' | 'preparedBy'
type SortDir = 'asc' | 'desc'
type CreatorFilter = 'all' | 'mine' | 'users'

const PAGE_SIZE = 10

export function ManageMeetingsPage({ locale }: Props) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [minutes, setMinutes] = useState<SavedMinute[]>([])
  const [users, setUsers] = useState<AuthUser[]>([])
  const [title, setTitle] = useState('')
  const [person, setPerson] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [languageFilter, setLanguageFilter] = useState<'all' | MinuteLanguage>(
    'all',
  )
  const [creatorFilter, setCreatorFilter] = useState<CreatorFilter>('all')
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [page, setPage] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [allCount, setAllCount] = useState(0)
  const [mineCount, setMineCount] = useState(0)
  const [userCount, setUserCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const roleByUserId = useMemo(
    () => new Map(users.map((account) => [account.id, account.role])),
    [users],
  )

  const load = useCallback(
    async (pageOverride?: number) => {
      const nextPage = pageOverride ?? page
      setLoading(true)
      setError('')
      try {
        const [result, userRows] = await Promise.all([
          searchAdminMinutes({
            title: title.trim() || undefined,
            person: person.trim() || undefined,
            dateFrom: dateFrom || undefined,
            dateTo: dateTo || undefined,
            language: languageFilter === 'all' ? undefined : languageFilter,
            creatorFilter,
            sortKey,
            sortDir,
            page: nextPage,
            size: PAGE_SIZE,
          }),
          users.length === 0 ? fetchAdminUsers() : Promise.resolve(users),
        ])
        setMinutes(result.content)
        setPage(result.page)
        setTotalElements(result.totalElements)
        setTotalPages(result.totalPages)
        setAllCount(result.allCount ?? result.totalElements)
        setMineCount(result.mineCount ?? 0)
        setUserCount(result.userCount ?? 0)
        if (users.length === 0) setUsers(userRows)
      } catch (err) {
        setError(err instanceof Error ? err.message : t(locale, 'errLoad'))
      } finally {
        setLoading(false)
      }
    },
    [
      page,
      title,
      person,
      dateFrom,
      dateTo,
      languageFilter,
      creatorFilter,
      sortKey,
      sortDir,
      users,
      locale,
    ],
  )

  useEffect(() => {
    void load(0)
    // Initial load only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function clearFilters() {
    setTitle('')
    setPerson('')
    setDateFrom('')
    setDateTo('')
    setLanguageFilter('all')
    setCreatorFilter('all')
    setPage(0)
  }

  async function handleSearch(e: FormEvent) {
    e.preventDefault()
    setPage(0)
    await load(0)
  }

  async function handleClear() {
    clearFilters()
    setLoading(true)
    setError('')
    try {
      const result = await searchAdminMinutes({
        creatorFilter: 'all',
        sortKey,
        sortDir,
        page: 0,
        size: PAGE_SIZE,
      })
      setMinutes(result.content)
      setPage(result.page)
      setTotalElements(result.totalElements)
      setTotalPages(result.totalPages)
      setAllCount(result.allCount ?? result.totalElements)
      setMineCount(result.mineCount ?? 0)
      setUserCount(result.userCount ?? 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : t(locale, 'errLoad'))
    } finally {
      setLoading(false)
    }
  }

  function toggleSort(key: SortKey) {
    const nextDir: SortDir =
      sortKey === key ? (sortDir === 'asc' ? 'desc' : 'asc') : 'asc'
    setSortKey(key)
    setSortDir(nextDir)
    setPage(0)
    void (async () => {
      setLoading(true)
      setError('')
      try {
        const result = await searchAdminMinutes({
          title: title.trim() || undefined,
          person: person.trim() || undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          language: languageFilter === 'all' ? undefined : languageFilter,
          creatorFilter,
          sortKey: key,
          sortDir: nextDir,
          page: 0,
          size: PAGE_SIZE,
        })
        setMinutes(result.content)
        setPage(result.page)
        setTotalElements(result.totalElements)
        setTotalPages(result.totalPages)
        setAllCount(result.allCount ?? result.totalElements)
        setMineCount(result.mineCount ?? 0)
        setUserCount(result.userCount ?? 0)
      } catch (err) {
        setError(err instanceof Error ? err.message : t(locale, 'errLoad'))
      } finally {
        setLoading(false)
      }
    })()
  }

  function sortLabel(key: SortKey) {
    if (sortKey !== key) return ''
    return sortDir === 'asc' ? ' ↑' : ' ↓'
  }

  function creatorBadge(row: SavedMinute) {
    const isMine = row.createdByUserId === user?.id
    const creatorRole = row.createdByUserId
      ? roleByUserId.get(row.createdByUserId)
      : undefined

    if (isMine) {
      return <span className="creator-badge mine">{t(locale, 'createdByYou')}</span>
    }
    if (creatorRole === 'U') {
      return <span className="creator-badge user">{t(locale, 'roleUser')}</span>
    }
    if (creatorRole === 'A') {
      return <span className="creator-badge admin">{t(locale, 'roleAdmin')}</span>
    }
    return null
  }

  function canEditRow(row: SavedMinute) {
    return Boolean(user?.id && row.createdByUserId === user.id)
  }

  function handleUpdate(row: SavedMinute) {
    navigate('/admin/meetings/create', { state: { editMinute: row } })
  }

  async function handleDelete(row: SavedMinute) {
    if (!window.confirm(t(locale, 'confirmDelete'))) return
    setError('')
    try {
      await deleteMinute(row.id)
      await load(page)
    } catch (err) {
      setError(err instanceof Error ? err.message : t(locale, 'errRequest'))
    }
  }

  async function goToPage(next: number) {
    if (next < 0 || (totalPages > 0 && next >= totalPages)) return
    setPage(next)
    await load(next)
  }

  return (
    <div className="admin-page">
      <div className="admin-intro">
        <h1>{t(locale, 'navListMinutes')}</h1>
        <p>{t(locale, 'manageMeetingsSub')}</p>
      </div>
      {error ? <p className="err">{error}</p> : null}

      <section className="block">
        <div className="block-head">
          <h2>
            {t(locale, 'adminMinutes')}
            <span className="muted result-count"> ({totalElements})</span>
          </h2>
          <button
            type="button"
            className="btn-light"
            onClick={() => void load(page)}
            disabled={loading}
          >
            {loading ? t(locale, 'loading') : t(locale, 'refresh')}
          </button>
        </div>

        <form className="filter-row" onSubmit={(e) => void handleSearch(e)}>
          <label>
            {t(locale, 'filterCreator')}
            <select
              value={creatorFilter}
              onChange={(e) =>
                setCreatorFilter(e.target.value as CreatorFilter)
              }
            >
              <option value="all">
                {t(locale, 'filterCreatorAll')} ({allCount})
              </option>
              <option value="mine">
                {t(locale, 'filterCreatorMine')} ({mineCount})
              </option>
              <option value="users">
                {t(locale, 'filterCreatorUsers')} ({userCount})
              </option>
            </select>
          </label>
          <label>
            {t(locale, 'filterTitle')}
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t(locale, 'titlePlaceholder')}
            />
          </label>
          <label>
            {t(locale, 'filterPerson')}
            <input
              value={person}
              onChange={(e) => setPerson(e.target.value)}
              placeholder={t(locale, 'filterPersonPlaceholder')}
            />
          </label>
          <label>
            {t(locale, 'filterLanguage')}
            <select
              value={languageFilter}
              onChange={(e) =>
                setLanguageFilter(e.target.value as 'all' | MinuteLanguage)
              }
            >
              <option value="all">{t(locale, 'filterLanguageAll')}</option>
              <option value="en">{t(locale, 'langEnglish')}</option>
              <option value="ar">{t(locale, 'langArabic')}</option>
            </select>
          </label>
          <label>
            {t(locale, 'filterDateFrom')}
            <input
              type="date"
              value={dateFrom}
              max={dateTo || todayIso()}
              onChange={(e) => {
                const next = e.target.value
                setDateFrom(next)
                if (next && dateTo && next > dateTo) {
                  setDateTo(next)
                }
              }}
            />
          </label>
          <label>
            {t(locale, 'filterDateTo')}
            <input
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              max={todayIso()}
              onChange={(e) => {
                const next = e.target.value
                setDateTo(next)
                if (next && dateFrom && next < dateFrom) {
                  setDateFrom(next)
                }
              }}
            />
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

        {minutes.length === 0 ? (
          <p className="empty">{t(locale, 'emptyList')}</p>
        ) : (
          <>
            <div className="minutes-grid" role="table" aria-label={t(locale, 'adminMinutes')}>
              <div className="minutes-grid-header" role="row">
                <div role="columnheader">
                  <button
                    type="button"
                    className="sort-btn"
                    onClick={() => toggleSort('title')}
                  >
                    {t(locale, 'colTitle')}
                    {sortLabel('title')}
                  </button>
                </div>
                <div className="col-date" role="columnheader">
                  <button
                    type="button"
                    className="sort-btn"
                    onClick={() => toggleSort('date')}
                  >
                    {t(locale, 'colDate')}
                    {sortLabel('date')}
                  </button>
                </div>
                <div role="columnheader">{t(locale, 'colLocation')}</div>
                <div className="col-person" role="columnheader">
                  <button
                    type="button"
                    className="sort-btn"
                    onClick={() => toggleSort('preparedBy')}
                  >
                    {t(locale, 'colPreparedBy')}
                    {sortLabel('preparedBy')}
                  </button>
                </div>
                <div className="col-actions" role="columnheader">
                  {t(locale, 'colActions')}
                </div>
              </div>
              {minutes.map((row) => (
                <div key={row.id} className="minutes-grid-row" role="row">
                  <div
                    className="grid-cell cell-ellipsis"
                    role="cell"
                    data-label={t(locale, 'colTitle')}
                    title={row.title || undefined}
                  >
                    {row.title || '—'}
                  </div>
                  <div
                    className="grid-cell col-date"
                    role="cell"
                    data-label={t(locale, 'colDate')}
                  >
                    {row.date || '—'}
                  </div>
                  <div
                    className="grid-cell cell-ellipsis"
                    role="cell"
                    data-label={t(locale, 'colLocation')}
                    title={row.location || undefined}
                  >
                    {row.location || '—'}
                  </div>
                  <div
                    className="grid-cell col-person"
                    role="cell"
                    data-label={t(locale, 'colPreparedBy')}
                  >
                    <PersonNameCell
                      name={row.preparedBy}
                      email={row.createdByEmail}
                      extra={creatorBadge(row)}
                    />
                  </div>
                  <div
                    className="grid-cell actions-cell col-actions"
                    role="cell"
                    data-label={t(locale, 'colActions')}
                  >
                    {canEditRow(row) ? (
                      <button
                        type="button"
                        className="btn-light btn-icon"
                        onClick={() => handleUpdate(row)}
                        title={t(locale, 'update')}
                        aria-label={t(locale, 'update')}
                      >
                        <EditIcon />
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="btn-light"
                      onClick={() =>
                        void downloadPdf(row, minuteExportLocale(row.language))
                      }
                    >
                      {t(locale, 'pdf')}
                    </button>
                    <button
                      type="button"
                      className="btn-light"
                      onClick={() =>
                        void downloadWord(row, minuteExportLocale(row.language))
                      }
                    >
                      {t(locale, 'word')}
                    </button>
                    {canEditRow(row) ? (
                      <button
                        type="button"
                        className="btn-danger"
                        onClick={() => void handleDelete(row)}
                      >
                        {t(locale, 'delete')}
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
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
          </>
        )}
      </section>
    </div>
  )
}
