import { Spin } from 'antd'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

type RequireRoleProps = {
  role: 'ADMIN' | 'PARTNER'
}

export const RequireRole = ({ role }: RequireRoleProps) => {
  const { userRole, isReady } = useAuth()

  if (!isReady) {
    return <Spin fullscreen tip="Загрузка сессии..." />
  }

  if (userRole !== role) {
    return <Navigate to={role === 'ADMIN' ? '/' : '/admin'} replace />
  }

  return <Outlet />
}
