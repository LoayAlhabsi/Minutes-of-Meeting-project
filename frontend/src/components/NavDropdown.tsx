import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { t, type Locale } from '../localization'

type DropdownItem = {
  to: string
  end?: boolean
  key: Parameters<typeof t>[1]
}

type Props = {
  locale: Locale
  labelKey: Parameters<typeof t>[1]
  items: DropdownItem[]
}

export function NavDropdown({ locale, labelKey, items }: Props) {
  const location = useLocation()
  const isChildActive = items.some((item) =>
    item.end
      ? location.pathname === item.to
      : location.pathname === item.to ||
        location.pathname.startsWith(`${item.to}/`),
  )
  const [open, setOpen] = useState(isChildActive)

  useEffect(() => {
    if (isChildActive) setOpen(true)
  }, [isChildActive])

  return (
    <div className={`nav-dropdown${isChildActive ? ' active-group' : ''}`}>
      <button
        type="button"
        className={`nav-dropdown-toggle${open ? ' open' : ''}`}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span>{t(locale, labelKey)}</span>
        <span className="nav-dropdown-chevron" aria-hidden>
          ▾
        </span>
      </button>
      {open ? (
        <div className="nav-dropdown-menu">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                isActive ? 'nav-dropdown-link active' : 'nav-dropdown-link'
              }
            >
              {t(locale, item.key)}
            </NavLink>
          ))}
        </div>
      ) : null}
    </div>
  )
}
