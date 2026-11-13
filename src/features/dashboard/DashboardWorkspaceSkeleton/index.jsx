import './DashboardWorkspaceSkeleton.css'
import OrdersWorkspaceSkeleton from '../OrdersWorkspace/OrdersWorkspaceSkeleton'
import ProductsWorkspaceSkeleton from '../ProductsWorkspace/ProductsWorkspaceSkeleton'
import CatalogWorkspaceSkeleton from '../CatalogWorkspace/CatalogWorkspaceSkeleton'
import CustomersWorkspaceSkeleton from '../CustomersWorkspace/CustomersWorkspaceSkeleton'
import CouponsWorkspaceSkeleton from '../CouponsWorkspace/CouponsWorkspaceSkeleton'
import AnalyticsWorkspaceSkeleton from '../AnalyticsWorkspace/AnalyticsWorkspaceSkeleton'
import DashboardOverviewWorkspaceSkeleton from '../DashboardOverviewWorkspace/DashboardOverviewWorkspaceSkeleton'

const WORKSPACES = [
  { section: 'dashboard', component: DashboardOverviewWorkspaceSkeleton },
  { section: 'orders', component: OrdersWorkspaceSkeleton },
  { section: 'products', component: ProductsWorkspaceSkeleton },
  {
    section: 'categories',
    component: CatalogWorkspaceSkeleton,
    kind: 'categories',
  },
  { section: 'brands', component: CatalogWorkspaceSkeleton, kind: 'brands' },
  { section: 'customers', component: CustomersWorkspaceSkeleton },
  { section: 'coupons', component: CouponsWorkspaceSkeleton },
  { section: 'analytics', component: AnalyticsWorkspaceSkeleton },
]

export default function DashboardWorkspaceSkeleton({ section }) {
  const workspace = WORKSPACES.find((item) => item.section === section)
  if (!workspace) return null
  const Workspace = workspace.component

  return (
    <div className="dashboard-skeleton" role="status">
      <section
        aria-busy="true"
        aria-label={`${section} workspace loading`}
        className="dashboard-skeleton__workspace"
      >
        <Workspace kind={workspace.kind} />
      </section>
    </div>
  )
}
