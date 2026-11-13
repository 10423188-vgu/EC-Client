import { createElement, Suspense, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../../entities/user/model'
import {
  AnalyticsWorkspace,
  CatalogWorkspace,
  CustomersWorkspace,
  CouponsWorkspace,
  DASHBOARD_SECTION_TITLES,
  DashboardOverviewWorkspace,
  DashboardSidebar,
  DashboardWorkspaceSkeleton,
  getDashboardSection,
  OrdersWorkspace,
  ProductsWorkspace,
} from '../../features/dashboard'
import './DashboardPage.css'

const DASHBOARD_WORKSPACES = [
  { section: 'dashboard', component: DashboardOverviewWorkspace },
  { section: 'orders', component: OrdersWorkspace },
  { section: 'products', component: ProductsWorkspace },
  { section: 'categories', component: CatalogWorkspace, kind: 'categories' },
  { section: 'brands', component: CatalogWorkspace, kind: 'brands' },
  { section: 'customers', component: CustomersWorkspace },
  { section: 'coupons', component: CouponsWorkspace },
  { section: 'analytics', component: AnalyticsWorkspace },
]

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [searchParams] = useSearchParams()
  const section = getDashboardSection(searchParams.get('section'))
  if (user?.role !== 'ADMIN') {
    return (
      <main className="dashboard-page">
        <p className="dashboard-page__denied">Admin access required.</p>
      </main>
    )
  }
  return (
    <main
      className={`dashboard-page${isSidebarCollapsed ? ' dashboard-page--sidebar-collapsed' : ''}`}
    >
      <DashboardSidebar
        user={user}
        onToggle={() => setIsSidebarCollapsed((collapsed) => !collapsed)}
        isCollapsed={isSidebarCollapsed}
      />
      <section className="dashboard-page__content">
        <header className="dashboard-page__header">
          <h1 className="dashboard-page__title">
            {DASHBOARD_SECTION_TITLES[section]}
          </h1>
        </header>
        <Suspense fallback={<DashboardWorkspaceSkeleton section={section} />}>
          {DASHBOARD_WORKSPACES.filter(
            (workspace) => workspace.section === section,
          ).map(({ section: workspaceSection, component, kind }) =>
            createElement(component, { key: workspaceSection, kind }),
          )}
        </Suspense>
      </section>
    </main>
  )
}
