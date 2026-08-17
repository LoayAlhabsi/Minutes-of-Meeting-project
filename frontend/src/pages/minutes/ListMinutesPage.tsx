import { useNavigate } from 'react-router-dom'
import { SavedMinutesList } from '../user/components/SavedMinutesList'
import { useMinutesApp } from '../user/hooks/useMinutesApp'
import { t, type Locale } from '../../localization'
import type { SavedMinute } from '../../types'

type Props = {
  locale: Locale
  createPath: string
}

export function ListMinutesPage({ locale, createPath }: Props) {
  const app = useMinutesApp(locale)
  const navigate = useNavigate()

  function handleUpdate(row: SavedMinute) {
    navigate(createPath, { state: { editMinute: row } })
  }

  return (
    <div className="admin-page">
      <div className="admin-intro">
        <h1>{t(locale, 'listMinutesTitle')}</h1>
        <p>{t(locale, 'listMinutesSub')}</p>
      </div>
      {app.error ? <p className="err">{app.error}</p> : null}

      <SavedMinutesList
        locale={locale}
        savedList={app.savedList}
        editingId={app.editingId}
        loading={app.loading}
        filterTitle={app.filterTitle}
        filterPerson={app.filterPerson}
        filterDateFrom={app.filterDateFrom}
        filterDateTo={app.filterDateTo}
        filterLanguage={app.filterLanguage}
        page={app.page}
        totalElements={app.totalElements}
        totalPages={app.totalPages}
        onFilterTitle={app.setFilterTitle}
        onFilterPerson={app.setFilterPerson}
        onFilterDateFrom={app.setFilterDateFrom}
        onFilterDateTo={app.setFilterDateTo}
        onFilterLanguage={app.setFilterLanguage}
        onSearch={(e) => void app.handleSearch(e)}
        onClearFilters={() => void app.handleClearFilters()}
        onPrevPage={() => void app.goToPage(app.page - 1)}
        onNextPage={() => void app.goToPage(app.page + 1)}
        onRefresh={() => void app.loadMinutes()}
        onUpdate={handleUpdate}
        onDelete={(row) => void app.handleDelete(row)}
      />
    </div>
  )
}
