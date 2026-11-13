import {
  SkeletonBlock,
  SkeletonLines,
} from '../../DashboardWorkspaceSkeleton/SkeletonPrimitives'
import './DashboardOverviewWorkspaceSkeleton.css'

// why: Match the four KPI cards shown by DashboardKpis.
const KPI_CARDS = Array.from({ length: 4 })
// why: DashboardOverviewWorkspace previews five recent orders.
const ORDER_ROWS = Array.from({ length: 5 })

export function OverviewAnalyticsSkeleton() {
  return (
    <>
      <div
        className="dashboard-overview-skeleton__kpis"
        role="status"
        aria-busy="true"
        aria-label="Store metrics loading"
      >
        {KPI_CARDS.map((_, index) => (
          <article
            className="dashboard-skeleton__panel dashboard-overview-skeleton__kpi"
            key={index}
          >
            <SkeletonBlock className="dashboard-overview-skeleton__icon" />
            <SkeletonBlock className="dashboard-overview-skeleton__value" />
            <SkeletonBlock className="dashboard-overview-skeleton__label" />
            <SkeletonBlock className="dashboard-overview-skeleton__detail" />
          </article>
        ))}
      </div>
      <section
        className="dashboard-skeleton__panel dashboard-overview-skeleton__panel dashboard-overview-skeleton__panel--trends"
        role="status"
        aria-busy="true"
        aria-label="Revenue chart loading"
      >
        <header className="dashboard-overview-skeleton__panel-header">
          <SkeletonLines count={2} />
          <SkeletonBlock className="dashboard-overview-skeleton__chart-link" />
        </header>
        <SkeletonBlock className="dashboard-overview-skeleton__chart" />
        <div className="dashboard-overview-skeleton__legend">
          <span>
            <SkeletonBlock />
            <SkeletonBlock />
          </span>
          <span>
            <SkeletonBlock />
            <SkeletonBlock />
          </span>
        </div>
      </section>
    </>
  )
}

export function RecentOrdersSkeleton() {
  return (
    <section
      className="dashboard-skeleton__panel dashboard-overview-skeleton__panel dashboard-overview-skeleton__panel--orders"
      role="status"
      aria-busy="true"
      aria-label="Recent orders loading"
    >
      <header className="dashboard-overview-skeleton__panel-header">
        <SkeletonLines count={2} />
        <SkeletonBlock className="dashboard-overview-skeleton__chart-link" />
      </header>
      <div className="dashboard-overview-skeleton__table-wrapper">
        <table
          className="dashboard-overview-skeleton__table"
          aria-hidden="true"
        >
          <thead>
            <tr>
              {Array.from({ length: 7 }, (_, index) => (
                <th key={index}>
                  <SkeletonBlock />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ORDER_ROWS.map((_, index) => (
              <tr key={index}>
                <td>
                  <SkeletonBlock />
                </td>
                <td>
                  <SkeletonLines count={2} />
                </td>
                <td>
                  <SkeletonLines count={2} />
                </td>
                <td>
                  <SkeletonBlock className="dashboard-overview-skeleton__status" />
                </td>
                <td>
                  <SkeletonBlock />
                </td>
                <td>
                  <SkeletonBlock />
                </td>
                <td>
                  <SkeletonBlock />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default function DashboardOverviewWorkspaceSkeleton() {
  return (
    <div className="dashboard-overview-skeleton">
      <header className="dashboard-overview-skeleton__header">
        <SkeletonLines count={2} />
        <SkeletonBlock className="dashboard-overview-skeleton__period" />
      </header>
      <div className="dashboard-overview-skeleton__content">
        <OverviewAnalyticsSkeleton />
        <RecentOrdersSkeleton />
      </div>
    </div>
  )
}
