import { lazy, Suspense } from 'react'
const Dashboard = lazy(() => import('../../../pages/dashboard/DashboardPage'))
const Profile = lazy(() => import('../../../pages/profile/ProfilePage'))
const Checkout = lazy(() => import('../../../pages/checkout/CheckoutPage'))
const Orders = lazy(() => import('../../../pages/order/OrdersPage'))
const OrderDetail = lazy(() => import('../../../pages/order/OrderDetailPage'))
const PaymentResult = lazy(
  () => import('../../../pages/payment/PaymentResultPage'),
)
const PaymentQr = lazy(() => import('../../../pages/payment/PaymentQrPage'))
export const PrivateRoutes = [
  {
    path: 'profile',
    element: <Profile />,
  },
  {
    path: 'checkout',
    element: <Checkout />,
  },
  {
    path: 'orders',
    element: <Orders />,
  },
  {
    path: 'orders/:id',
    element: <OrderDetail />,
  },
  {
    path: 'payment/result',
    element: <PaymentResult />,
  },
  {
    path: 'payment/qr/:orderId',
    element: <PaymentQr />,
  },
]
export const DashboardRoute = {
  path: 'dashboard',
  element: (
    <Suspense fallback={<div role="status">Loading...</div>}>
      <Dashboard />
    </Suspense>
  ),
}
