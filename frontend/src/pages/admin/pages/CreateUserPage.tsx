import { useNavigate } from 'react-router-dom'
import { t, type Locale } from '../../../localization'
import { CreateUserForm } from '../components/CreateUserForm'

type Props = { locale: Locale }

export function CreateUserPage({ locale }: Props) {
  const navigate = useNavigate()

  return (
    <div className="admin-page">
      <div className="admin-intro">
        <h1>{t(locale, 'navCreateUser')}</h1>
        <p>{t(locale, 'createUserSub')}</p>
      </div>
      <CreateUserForm
        locale={locale}
        onCreated={() =>
          navigate('/admin/users', { state: { userCreated: true } })
        }
        onCancel={() => navigate('/admin/users')}
      />
    </div>
  )
}
