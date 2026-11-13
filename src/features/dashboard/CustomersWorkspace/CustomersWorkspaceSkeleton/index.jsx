import './CustomersWorkspaceSkeleton.css'
import {
  SkeletonBlock,
  SkeletonLines,
} from '../../DashboardWorkspaceSkeleton/SkeletonPrimitives'

const CUSTOMER_STATS = Array.from({ length: 3 })
// why: show the five table rows requested for compact dashboard skeletons.
const CUSTOMER_ROWS = Array.from({ length: 5 })
// why: CustomerOverview's default period returns seven daily chart points.
const CUSTOMER_SPARKLINE_POINTS = Array.from({ length: 7 })
const CUSTOMER_SEGMENTS = [24, 38, 28, 10]

function CustomerTableSkeleton() {
  return (
    <div className="dashboard-skeleton__customer-table dashboard-skeleton__table">
      <div className="dashboard-skeleton__table-head">
        {Array.from({ length: 7 }, (_, index) => (
          <SkeletonBlock
            className="dashboard-skeleton__table-label"
            key={index}
          />
        ))}
      </div>
      {CUSTOMER_ROWS.map((_, rowIndex) => (
        <div className="dashboard-skeleton__table-row" key={rowIndex}>
          <SkeletonBlock className="dashboard-skeleton__customer-select" />
          <div className="dashboard-skeleton__customer-identity">
            <SkeletonBlock className="dashboard-skeleton__customer-avatar" />
            <SkeletonBlock className="dashboard-skeleton__table-cell" />
          </div>
          <SkeletonBlock className="dashboard-skeleton__table-cell" />
          <SkeletonBlock className="dashboard-skeleton__table-cell" />
          <SkeletonBlock className="dashboard-skeleton__table-cell" />
          <SkeletonBlock className="dashboard-skeleton__status-pill" />
          <SkeletonBlock className="dashboard-skeleton__customer-action" />
        </div>
      ))}
    </div>
  )
}

export function CustomersOverviewSkeleton({ showHeader = true }) {
  return (
    <>
      {showHeader && (
        <header className="dashboard-skeleton__customer-overview-header">
          <SkeletonBlock className="dashboard-skeleton__customer-overview-title" />
        </header>
      )}
      <div
        className="dashboard-skeleton__customer-stats"
        role="status"
        aria-busy="true"
        aria-label="Customer metrics loading"
      >
        {CUSTOMER_STATS.map((_, index) => (
          <article
            className="dashboard-skeleton__panel dashboard-skeleton__customer-stat"
            key={index}
          >
            <header className="dashboard-skeleton__customer-stat-header">
              <SkeletonBlock className="dashboard-skeleton__customer-stat-label" />
              <SkeletonBlock className="dashboard-skeleton__customer-stat-period" />
            </header>
            <div className="dashboard-skeleton__customer-stat-body">
              <div className="dashboard-skeleton__customer-stat-value">
                <SkeletonBlock className="dashboard-skeleton__customer-stat-number" />
                <SkeletonBlock className="dashboard-skeleton__customer-stat-trend" />
              </div>
              <div className="dashboard-skeleton__sparkline">
                {CUSTOMER_SPARKLINE_POINTS.map((_, barIndex) => (
                  <SkeletonBlock key={barIndex} />
                ))}
              </div>
            </div>
            <SkeletonBlock className="dashboard-skeleton__line" />
          </article>
        ))}
      </div>
      <div
        className="dashboard-skeleton__customer-charts"
        role="status"
        aria-busy="true"
        aria-label="Customer charts loading"
      >
        <section className="dashboard-skeleton__panel dashboard-skeleton__segment-panel">
          <header className="dashboard-skeleton__customer-chart-header">
            <SkeletonLines count={2} />
          </header>
          <div className="dashboard-skeleton__segment-bar">
            {CUSTOMER_SEGMENTS.map((width, index) => (
              <SkeletonBlock
                className="dashboard-skeleton__segment-block"
                key={index}
                style={{ width: `${width}%` }}
              />
            ))}
          </div>
          <ul className="dashboard-skeleton__segment-list">
            {Array.from({ length: 4 }, (_, index) => (
              <li className="dashboard-skeleton__segment-item" key={index}>
                <SkeletonBlock className="dashboard-skeleton__segment-swatch" />
                <div className="dashboard-skeleton__segment-description">
                  <SkeletonLines count={3} />
                </div>
                <SkeletonBlock className="dashboard-skeleton__segment-value" />
              </li>
            ))}
          </ul>
        </section>
        <section className="dashboard-skeleton__panel dashboard-skeleton__growth-panel">
          <header className="dashboard-skeleton__customer-chart-header">
            <SkeletonLines count={2} />
          </header>
          <div className="dashboard-skeleton__customer-growth-summary">
            <SkeletonBlock className="dashboard-skeleton__customer-growth-label" />
            <SkeletonBlock className="dashboard-skeleton__customer-growth-total" />
            <SkeletonBlock className="dashboard-skeleton__customer-growth-change" />
          </div>
          <div className="dashboard-skeleton__customer-growth-chart">
            <div className="dashboard-skeleton__customer-growth-plot">
              <SkeletonBlock className="dashboard-skeleton__customer-growth-area" />
            </div>
            <div className="dashboard-skeleton__customer-growth-dates">
              {Array.from({ length: 5 }, (_, index) => (
                <SkeletonBlock key={index} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export function CustomersListSkeleton() {
  return (
    <section
      className="dashboard-skeleton__panel dashboard-skeleton__customer-list"
      role="status"
      aria-busy="true"
      aria-label="Customer list loading"
    >
      <header className="dashboard-skeleton__toolbar">
        <SkeletonLines count={2} />
        <div className="dashboard-skeleton__toolbar-actions">
          <SkeletonBlock className="dashboard-skeleton__line--field" />
          <SkeletonBlock className="dashboard-skeleton__line--button" />
        </div>
      </header>
      <div className="dashboard-skeleton__filter-row">
        <SkeletonBlock className="dashboard-skeleton__line--field" />
        <SkeletonBlock className="dashboard-skeleton__line--field" />
        <SkeletonBlock className="dashboard-skeleton__line--button" />
      </div>
      <div className="dashboard-skeleton__table-scroll">
        <CustomerTableSkeleton />
      </div>
      <footer className="dashboard-skeleton__customer-footer">
        <div className="dashboard-skeleton__customer-pages">
          {Array.from({ length: 5 }, (_, index) => (
            <SkeletonBlock key={index} />
          ))}
        </div>
        <SkeletonBlock className="dashboard-skeleton__customer-footer-label" />
        <SkeletonBlock className="dashboard-skeleton__line--field" />
      </footer>
    </section>
  )
}

export default function CustomersWorkspaceSkeleton() {
  return (
    <section className="dashboard-skeleton__customer-overview">
      <CustomersOverviewSkeleton />
      <CustomersListSkeleton />
    </section>
  )
}
