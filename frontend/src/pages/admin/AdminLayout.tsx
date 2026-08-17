import { NavLink, Outlet } from 'react-router-dom'
import { NavDropdown } from '../../components/NavDropdown'
import { t, type Locale } from '../../localization'

type Props = { locale: Locale }

const links = [
  { to: '/admin/users', end: true, key: 'navManageUsers' as const },
  { to: '/admin/document-format', end: true, key: 'navDocumentFormat' as const },
]

export function AdminLayout({ locale }: Props) {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-title">{t(locale, 'adminPanel')}</div>
        <nav className="admin-nav">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              isActive ? 'admin-nav-link active' : 'admin-nav-link'
            }
          >
            {t(locale, 'navDashboard')}
          </NavLink>
          <NavDropdown
            locale={locale}
            labelKey="navMinutesOfMeeting"
            items={[
              { to: '/admin/meetings/create', key: 'navCreateMinute' },
              { to: '/admin/meetings', end: true, key: 'navListMinutes' },
              { to: '/admin/presentation-format', key: 'navPresentationFormat' },
              { to: '/admin/meeting-report', key: 'navMeetingReport' },
            ]}
          />
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                isActive ? 'admin-nav-link active' : 'admin-nav-link'
              }
            >
              {t(locale, link.key)}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="admin-main">
        <Outlet />
      </div>
    </div>
  )
}
