import { Outlet } from 'react-router-dom'
import { Suspense } from 'react'
import { useScrollRestoration } from '../../../shared/hooks/useScrollRestoration'
export default function AuthLayout() {
  useScrollRestoration()
  return (
    <Suspense fallback={<div role="status">Loading...</div>}>
      <Outlet />
    </Suspense>
  )
}
