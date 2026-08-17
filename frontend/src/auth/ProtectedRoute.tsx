import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'

type Props = {
  adminOnly?: boolean
}

export function ProtectedRoute({ adminOnly = false }: Props) {
  const { isAuthenticated, isAdmin } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  if (adminOnly && !isAdmin) {
    return <Navigate to="/user" replace />
  }
  return <Outlet />
}
