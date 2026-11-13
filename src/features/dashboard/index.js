import { lazy } from 'react'

export { default as DashboardSidebar } from './DashboardSidebar'
export { default as DashboardWorkspaceSkeleton } from './DashboardWorkspaceSkeleton'
export {
  DASHBOARD_SECTION_TITLES,
  getDashboardSection,
} from './dashboardSections'

export const DashboardOverviewWorkspace = lazy(
  () => import('./DashboardOverviewWorkspace'),
)
export const OrdersWorkspace = lazy(() => import('./OrdersWorkspace'))
export const ProductsWorkspace = lazy(() => import('./ProductsWorkspace'))
export const CatalogWorkspace = lazy(() => import('./CatalogWorkspace'))
export const CustomersWorkspace = lazy(() => import('./CustomersWorkspace'))
export const CouponsWorkspace = lazy(() => import('./CouponsWorkspace'))
export const AnalyticsWorkspace = lazy(() => import('./AnalyticsWorkspace'))
