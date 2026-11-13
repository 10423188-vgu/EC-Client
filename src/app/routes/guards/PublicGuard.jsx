import { Navigate, Outlet } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import { useAuthStore } from '../../../entities/user/model/auth.store'
export const PublicGuard = () => {
  const { user, isInitialized } = useAuthStore(
    useShallow((s) => ({
      user: s.user,
      isInitialized: s.isInitialized,
    })),
  )
  if (!isInitialized) return <div role="status">Loading...</div>
  if (user) return <Navigate to="/" replace />
  return <Outlet />
}
