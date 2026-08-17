import { downloadPdf, downloadWord } from '../../../pdfWordConverter'
import { todayIso, minuteExportLocale } from '../../../formUtils'
import { t, type Locale } from '../../../localization'
import type { MinuteLanguage, SavedMinute } from '../../../types'
import { PersonNameCell } from './PersonNameCell'
import { EditIcon } from '../../../components/icons/EditIcon'
import type { FormEvent } from 'react'

type Props = {
  locale: Locale
  savedList: SavedMinute[]
  editingId: string | null
  loading: boolean
  filterTitle: string
  filterPerson: string
  filterDateFrom: string
  filterDateTo: string
  filterLanguage: 'all' | MinuteLanguage
  page: number
  totalElements: number
  totalPages: number
  onFilterTitle: (value: string) => void
  onFilterPerson: (value: string) => void
  onFilterDateFrom: (value: string) => void
  onFilterDateTo: (value: string) => void
  onFilterLanguage: (value: 'all' | MinuteLanguage) => void
  onSearch: (e: FormEvent) => void
  onClearFilters: () => void
  onPrevPage: () => void
  onNextPage: () => void
  onRefresh: () => void
  onUpdate: (row: SavedMinute) => void
  onDelete?: (row: SavedMinute) => void
}

export function SavedMinutesList({
  locale,
  savedList,
  editingId,
  loading,
  filterTitle,
  filterPerson,
  filterDateFrom,
  filterDateTo,
  filterLanguage,
  page,
  totalElements,
  totalPages,
  onFilterTitle,
  onFilterPerson,
  onFilterDateFrom,
  onFilterDateTo,
  onFilterLanguage,
  onSearch,
  onClearFilters,
  onPrevPage,
  onNextPage,
  onRefresh,
  onUpdate,
  onDelete,
}: Props) {
  return (
    <section className="block saved-block">
      <div className="block-head">
        <h2>
          {t(locale, 'savedMinutes')}
          <span className="muted result-count"> ({totalElements})</span>
        </h2>
        <button
          type="button"
          className="btn-light"
          onClick={onRefresh}
          disabled={loading}
        >
          {loading ? t(locale, 'loading') : t(locale, 'refresh')}
        </button>
      </div>

      <form className="filter-row filter-row-user" onSubmit={onSearch}>
        <label>
          {t(locale, 'filterTitle')}
          <input
            value={filterTitle}
            onChange={(e) => onFilterTitle(e.target.value)}
            placeholder={t(locale, 'titlePlaceholder')}
          />
        </label>
        <label>
          {t(locale, 'filterPerson')}
          <input
            value={filterPerson}
            onChange={(e) => onFilterPerson(e.target.value)}
            placeholder={t(locale, 'filterPersonPlaceholder')}
          />
        </label>
        <label>
          {t(locale, 'filterLanguage')}
          <select
            value={filterLanguage}
            onChange={(e) =>
              onFilterLanguage(e.target.value as 'all' | MinuteLanguage)
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
            value={filterDateFrom}
            max={filterDateTo || todayIso()}
            onChange={(e) => {
              const next = e.target.value
              onFilterDateFrom(next)
              if (next && filterDateTo && next > filterDateTo) {
                onFilterDateTo(next)
              }
            }}
          />
        </label>
        <label>
          {t(locale, 'filterDateTo')}
          <input
            type="date"
            value={filterDateTo}
            min={filterDateFrom || undefined}
            max={todayIso()}
            onChange={(e) => {
              const next = e.target.value
              onFilterDateTo(next)
              if (next && filterDateFrom && next < filterDateFrom) {
                onFilterDateFrom(next)
              }
            }}
          />
        </label>
        <div className="filter-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? t(locale, 'loading') : t(locale, 'search')}
          </button>
          <button type="button" className="btn-light" onClick={onClearFilters}>
            {t(locale, 'clear')}
          </button>
        </div>
      </form>

      {savedList.length === 0 ? (
        <p className="empty">{t(locale, 'emptyList')}</p>
      ) : (
        <>
          <div className="minutes-grid" role="table" aria-label={t(locale, 'savedMinutes')}>
            <div className="minutes-grid-header" role="row">
              <div role="columnheader">{t(locale, 'colTitle')}</div>
              <div className="col-date" role="columnheader">
                {t(locale, 'colDate')}
              </div>
              <div role="columnheader">{t(locale, 'colLocation')}</div>
              <div className="col-person" role="columnheader">
                {t(locale, 'colPreparedBy')}
              </div>
              <div className="col-actions" role="columnheader">
                {t(locale, 'colActions')}
              </div>
            </div>
            {savedList.map((row) => (
              <div
                key={row.id}
                className={
                  editingId === row.id
                    ? 'minutes-grid-row row-editing'
                    : 'minutes-grid-row'
                }
                role="row"
              >
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
                  />
                </div>
                <div
                  className="grid-cell actions-cell col-actions"
                  role="cell"
                  data-label={t(locale, 'colActions')}
                >
                  <button
                    type="button"
                    className="btn-light btn-icon"
                    onClick={() => onUpdate(row)}
                    title={t(locale, 'update')}
                    aria-label={t(locale, 'update')}
                  >
                    <EditIcon />
                  </button>
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
                  {onDelete ? (
                    <button
                      type="button"
                      className="btn-danger"
                      onClick={() => onDelete(row)}
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
              onClick={onPrevPage}
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
              onClick={onNextPage}
            >
              {t(locale, 'nextPage')}
            </button>
          </div>
        </>
      )}
    </section>
  )
}
