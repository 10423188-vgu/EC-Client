import { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { AuthRoutes } from './routes/configs/AuthRoutes.jsx'
import {
  DashboardRoute,
  PrivateRoutes,
} from './routes/configs/PrivateRoutes.jsx'
import { PublicRoutes } from './routes/configs/PublicRoutes.jsx'
import { PublicGuard } from './routes/guards/PublicGuard.jsx'
import { PrivateGuard } from './routes/guards/PrivateGuard.jsx'
const MainLayout = lazy(() => import('./routes/layouts/MainLayout.jsx'))
const AppLayout = lazy(() => import('./routes/layouts/AppLayout.jsx'))
const AuthLayout = lazy(() => import('./routes/layouts/AuthLayout.jsx'))
const SkeletonPreviewPage = import.meta.env.DEV
  ? lazy(() => import('./SkeletonPreviewPage.jsx'))
  : null
export const Router = createBrowserRouter([
  ...(SkeletonPreviewPage
    ? [{ path: '/dev/skeletons', element: <SkeletonPreviewPage /> }]
    : []),
  {
    element: <MainLayout />,
    children: PublicRoutes,
  },
  {
    // NOTE: redirects unauthenticated users to /login
    element: <PrivateGuard />,
    children: [
      DashboardRoute,
      {
        element: <AppLayout />,
        children: PrivateRoutes,
      },
    ],
  },
  {
    // NOTE: redirects already-authenticated users away from auth pages
    element: <PublicGuard />,
    children: [
      {
        element: <AuthLayout />,
        children: AuthRoutes,
      },
    ],
  },
])
