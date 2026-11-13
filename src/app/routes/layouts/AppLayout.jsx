import { Outlet } from 'react-router-dom'
import { Suspense } from 'react'
import { Header } from '../../../widgets'
import { ScrollToTop } from '../../../shared/components'
import { useScrollRestoration } from '../../../shared/hooks/useScrollRestoration'
export default function AppLayout() {
  useScrollRestoration()
  return (
    <>
      <Header />
      <main>
        <Suspense fallback={<div role="status">Loading...</div>}>
          <Outlet />
        </Suspense>
      </main>
      <ScrollToTop />
    </>
  )
}
