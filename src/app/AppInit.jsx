import { useEffect } from 'react'
import { useCurrentUser } from '../entities/user/api'
import { useAuthStore } from '../entities/user/model/auth.store'
export default function AppInit() {
  useCurrentUser()
  useEffect(() => {
    // why: fired by the axios 401 interceptor (shared/api/axios.instance.js) when silent refresh fails
    const handleUnauthorized = () => {
      useAuthStore.getState().clearUser()
    }

    // why: the native "storage" event only fires in *other* tabs, so entities/user/api writes a
    // "logout" key on logout purely to trigger it there — the value itself is unused
    const handleStorage = (e) => {
      if (e.key === 'logout') useAuthStore.getState().clearUser()
    }
    window.addEventListener('auth:unauthorized', handleUnauthorized)
    window.addEventListener('storage', handleStorage)
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized)
      window.removeEventListener('storage', handleStorage)
    }
  }, [])
  return null
}
