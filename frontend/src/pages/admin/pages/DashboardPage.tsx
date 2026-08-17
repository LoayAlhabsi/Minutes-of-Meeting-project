import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchAdminStats } from '../../../api/adminApi'
import { t, type Locale } from '../../../localization'
import type { AdminStats } from '../../../types'
import { AdminStats as StatsCards } from '../components/AdminStats'

type Props = { locale: Locale }

export function DashboardPage({ locale }: Props) {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    void fetchAdminStats()
      .then(setStats)
      .catch((err) =>
        setError(err instanceof Error ? err.message : t(locale, 'errLoad')),
      )
  }, [locale])

  return (
    <div className="admin-page">
      <div className="admin-intro">
        <h1>{t(locale, 'adminDashboard')}</h1>
        <p>{t(locale, 'adminDashboardSub')}</p>
      </div>
      {error ? <p className="err">{error}</p> : null}
      <StatsCards locale={locale} stats={stats} />
      <section className="block admin-quick-links">
        <h2>{t(locale, 'quickLinks')}</h2>
        <div className="quick-link-row">
          <Link className="btn-light" to="/admin/users">
            {t(locale, 'navManageUsers')}
          </Link>
          <Link className="btn-light" to="/admin/meetings/create">
            {t(locale, 'navCreateMinute')}
          </Link>
          <Link className="btn-light" to="/admin/meetings">
            {t(locale, 'navListMinutes')}
          </Link>
          <Link className="btn-light" to="/admin/presentation-format">
            {t(locale, 'navPresentationFormat')}
          </Link>
          <Link className="btn-light" to="/admin/meeting-report">
            {t(locale, 'navMeetingReport')}
          </Link>
          <Link className="btn-light" to="/admin/document-format">
            {t(locale, 'navDocumentFormat')}
          </Link>
        </div>
      </section>
    </div>
  )
}
