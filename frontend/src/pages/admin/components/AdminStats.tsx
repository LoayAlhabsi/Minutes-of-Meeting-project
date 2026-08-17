import { t, type Locale } from '../../../localization'
import type { AdminStats as Stats } from '../../../types'

type Props = {
  locale: Locale
  stats: Stats | null
}

export function AdminStats({ locale, stats }: Props) {
  return (
    <section className="block admin-stats">
      <h2>{t(locale, 'adminStats')}</h2>
      <div className="stats-grid">
        <div className="stat">
          <strong>{stats?.totalMinutes ?? '—'}</strong>
          <span>{t(locale, 'statTotalMinutes')}</span>
        </div>
        <div className="stat">
          <strong>{stats?.totalUsers ?? '—'}</strong>
          <span>{t(locale, 'statTotalUsers')}</span>
        </div>
        <div className="stat">
          <strong>{stats?.meetingsThisMonth ?? '—'}</strong>
          <span>{t(locale, 'statMeetingsMonth')}</span>
        </div>
      </div>
    </section>
  )
}
