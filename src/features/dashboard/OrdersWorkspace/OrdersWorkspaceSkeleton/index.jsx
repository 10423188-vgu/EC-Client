import './OrdersWorkspaceSkeleton.css'
import {
  SkeletonBlock,
  SkeletonLines,
} from '../../DashboardWorkspaceSkeleton/SkeletonPrimitives'

// why: Match OrderOverview's 2/4/2 Revenue/Fulfillment/Risk rows.
const ORDER_STATUS_GROUPS = [2, 4, 2]
// why: OrderOverview renders ten metrics in two columns.
const METRIC_ROWS = Array.from({ length: 5 })
// why: show the five table rows requested for compact dashboard skeletons.
const ORDER_ROWS = Array.from({ length: 5 })

function OrderTableSkeleton() {
  return (
    <div className="dashboard-skeleton__orders-table dashboard-skeleton__table">
      <div className="dashboard-skeleton__table-head">
        {Array.from({ length: 9 }, (_, index) => (
          <SkeletonBlock
            className="dashboard-skeleton__table-label"
            key={index}
          />
        ))}
      </div>
      {ORDER_ROWS.map((_, rowIndex) => (
        <div className="dashboard-skeleton__table-row" key={rowIndex}>
          <SkeletonBlock className="dashboard-skeleton__order-select" />
          <SkeletonBlock className="dashboard-skeleton__table-cell" />
          <SkeletonLines
            className="dashboard-skeleton__order-customer"
            count={2}
          />
          <SkeletonLines
            className="dashboard-skeleton__order-payment"
            count={2}
          />
          <SkeletonBlock className="dashboard-skeleton__status-pill" />
          <SkeletonBlock className="dashboard-skeleton__table-cell--short" />
          <SkeletonBlock className="dashboard-skeleton__table-cell" />
          <SkeletonBlock className="dashboard-skeleton__table-cell" />
          <div className="dashboard-skeleton__order-actions">
            <SkeletonBlock />
            <SkeletonBlock />
            <SkeletonBlock />
          </div>
        </div>
      ))}
    </div>
  )
}

export function OrdersTableSkeleton() {
  return (
    <div
      className="dashboard-skeleton__panel"
      role="status"
      aria-busy="true"
      aria-label="Order list loading"
    >
      <div className="dashboard-skeleton__filter-row">
        <SkeletonBlock className="dashboard-skeleton__line--field" />
        <SkeletonBlock className="dashboard-skeleton__line--field" />
        <SkeletonBlock className="dashboard-skeleton__line--button" />
      </div>
      <div className="dashboard-skeleton__summary dashboard-skeleton__order-summary">
        <SkeletonBlock className="dashboard-skeleton__line--short" />
      </div>
      <div className="dashboard-skeleton__table-scroll">
        <OrderTableSkeleton />
      </div>
      <div className="dashboard-skeleton__pagination dashboard-skeleton__order-pagination">
        {Array.from({ length: 5 }, (_, index) => (
          <SkeletonBlock key={index} />
        ))}
      </div>
    </div>
  )
}

export function OrdersOverviewSkeleton() {
  return (
    <aside
      className="dashboard-skeleton__panel dashboard-skeleton__order-overview"
      role="status"
      aria-busy="true"
      aria-label="Order metrics loading"
    >
      <header className="dashboard-skeleton__order-overview-header">
        <SkeletonBlock className="dashboard-skeleton__line--title" />
        <SkeletonBlock className="dashboard-skeleton__line--short" />
      </header>
      <div className="dashboard-skeleton__order-chart">
        <div className="dashboard-skeleton__order-donut">
          <SkeletonLines count={2} />
        </div>
      </div>
      <div className="dashboard-skeleton__order-legend">
        {Array.from({ length: 4 }, (_, index) => (
          <div className="dashboard-skeleton__order-legend-item" key={index}>
            <div className="dashboard-skeleton__order-legend-label">
              <SkeletonBlock className="dashboard-skeleton__order-dot" />
              <SkeletonBlock className="dashboard-skeleton__line" />
            </div>
            <SkeletonBlock className="dashboard-skeleton__line--short" />
          </div>
        ))}
      </div>
      <section className="dashboard-skeleton__order-section">
        <header className="dashboard-skeleton__order-section-header">
          <SkeletonBlock className="dashboard-skeleton__line" />
          <SkeletonBlock className="dashboard-skeleton__line" />
        </header>
        {ORDER_STATUS_GROUPS.map((rowCount, groupIndex) => (
          <div
            className="dashboard-skeleton__order-status-group"
            key={groupIndex}
          >
            <SkeletonBlock className="dashboard-skeleton__order-group-title" />
            {Array.from({ length: rowCount }, (_, rowIndex) => (
              <div className="dashboard-skeleton__order-status" key={rowIndex}>
                <div className="dashboard-skeleton__overview-item">
                  <div className="dashboard-skeleton__order-status-label">
                    <SkeletonBlock className="dashboard-skeleton__order-dot" />
                    <SkeletonBlock className="dashboard-skeleton__line" />
                  </div>
                  <SkeletonBlock className="dashboard-skeleton__line--short" />
                </div>
                <SkeletonBlock className="dashboard-skeleton__order-track" />
              </div>
            ))}
          </div>
        ))}
      </section>
      <section className="dashboard-skeleton__order-section">
        <header className="dashboard-skeleton__order-section-header">
          <SkeletonBlock className="dashboard-skeleton__line" />
          <SkeletonBlock className="dashboard-skeleton__line" />
        </header>
        <div className="dashboard-skeleton__order-metrics">
          {METRIC_ROWS.map((_, index) => (
            <div className="dashboard-skeleton__order-metric" key={index}>
              <SkeletonBlock className="dashboard-skeleton__line" />
              <SkeletonBlock className="dashboard-skeleton__line" />
            </div>
          ))}
        </div>
      </section>
    </aside>
  )
}

export default function OrdersWorkspaceSkeleton() {
  return (
    <div className="dashboard-skeleton__orders-layout">
      <OrdersTableSkeleton />
      <OrdersOverviewSkeleton />
    </div>
  )
}
