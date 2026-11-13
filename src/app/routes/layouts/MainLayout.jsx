import { Outlet } from 'react-router-dom'
import { Suspense } from 'react'
import { Header, Footer, CompareBar } from '../../../widgets'
import CartDrawer from '../../../features/cart/CartDrawer'
import { ScrollToTop } from '../../../shared/components'
import { useScrollRestoration } from '../../../shared/hooks/useScrollRestoration'
export default function MainLayout() {
  useScrollRestoration()
  return (
    <>
      <Header />
      <main>
        <Suspense fallback={<div role="status">Loading...</div>}>
          <Outlet />
        </Suspense>
      </main>
      <CompareBar />
      <CartDrawer />
      <Footer />
      <ScrollToTop />
    </>
  )
}
