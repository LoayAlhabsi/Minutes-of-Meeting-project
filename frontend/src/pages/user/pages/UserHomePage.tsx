import { Link } from 'react-router-dom'
import { t, type Locale } from '../../../localization'

type Props = { locale: Locale }

const options = [
  {
    to: '/user/minutes/create',
    titleKey: 'navCreateMinute' as const,
    descKey: 'createMinuteBoxSub' as const,
  },
  {
    to: '/user/minutes',
    titleKey: 'navListMinutes' as const,
    descKey: 'listMinutesBoxSub' as const,
  },
  {
    to: '/user/presentation-format',
    titleKey: 'navPresentationFormat' as const,
    descKey: 'pptFormatBoxSub' as const,
  },
  {
    to: '/user/meeting-report',
    titleKey: 'navMeetingReport' as const,
    descKey: 'reportFormatBoxSub' as const,
  },
]

export function UserHomePage({ locale }: Props) {
  return (
    <div className="admin-page">
      <div className="admin-intro">
        <h1>{t(locale, 'userHome')}</h1>
        <p>{t(locale, 'userHomeSub')}</p>
      </div>

      <section className="home-options">
        {options.map((option) => (
          <Link key={option.to} to={option.to} className="home-option-card">
            <h2>{t(locale, option.titleKey)}</h2>
            <p>{t(locale, option.descKey)}</p>
          </Link>
        ))}
      </section>
    </div>
  )
}
