import { NavLink, Outlet } from 'react-router-dom'
import { NavDropdown } from '../../components/NavDropdown'
import { t, type Locale } from '../../localization'

type Props = { locale: Locale }

export function UserLayout({ locale }: Props) {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-title">{t(locale, 'userPanel')}</div>
        <nav className="admin-nav">
          <NavLink
            to="/user"
            end
            className={({ isActive }) =>
              isActive ? 'admin-nav-link active' : 'admin-nav-link'
            }
          >
            {t(locale, 'userHome')}
          </NavLink>
          <NavDropdown
            locale={locale}
            labelKey="navMinutesOfMeeting"
            items={[
              { to: '/user/minutes/create', key: 'navCreateMinute' },
              { to: '/user/minutes', end: true, key: 'navListMinutes' },
              { to: '/user/presentation-format', key: 'navPresentationFormat' },
              { to: '/user/meeting-report', key: 'navMeetingReport' },
            ]}
          />
        </nav>
      </aside>
      <div className="admin-main">
        <Outlet />
      </div>
    </div>
  )
}
