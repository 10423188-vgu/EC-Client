import './AnalyticsWorkspaceSkeleton.css'
import {
  SkeletonBlock,
  SkeletonLines,
} from '../../DashboardWorkspaceSkeleton/SkeletonPrimitives'

// why: Top products shows up to five products, including the Others segment.
const PRODUCT_ROWS = Array.from({ length: 5 })
// why: Match the four status groups rendered by AnalyticsCharts.
const STATUS_GROUPS = Array.from({ length: 4 })
// why: AnalyticsWorkspace defaults to a seven-day period.
const PERIOD_DAYS = Array.from({ length: 7 })
// why: The recent payments panel previews five rows, matching the API limit.
const RECENT_SALES = Array.from({ length: 5 })

export default function AnalyticsWorkspaceSkeleton() {
  return (
    <section className="dashboard-skeleton__analytics">
      <header className="dashboard-skeleton__analytics-header">
        <SkeletonLines count={3} />
        <SkeletonBlock className="dashboard-skeleton__analytics-period" />
      </header>
      <div className="dashboard-skeleton__analytics-body">
        <section className="dashboard-skeleton__analytics-panel dashboard-skeleton__analytics-panel--products">
          <header className="dashboard-skeleton__analytics-panel-header">
            <SkeletonLines count={2} />
            <SkeletonBlock className="dashboard-skeleton__analytics-category" />
          </header>
          <div className="dashboard-skeleton__analytics-products-content">
            <div className="dashboard-skeleton__analytics-products-chart">
              <SkeletonBlock className="dashboard-skeleton__analytics-chart--donut" />
              <div className="dashboard-skeleton__analytics-products-total">
                <SkeletonBlock className="dashboard-skeleton__analytics-products-total-number" />
                <SkeletonBlock className="dashboard-skeleton__analytics-products-total-label" />
              </div>
            </div>
            <ul className="dashboard-skeleton__analytics-product-list">
              {PRODUCT_ROWS.map((_, index) => (
                <li key={index}>
                  <SkeletonBlock className="dashboard-skeleton__analytics-dot" />
                  <SkeletonBlock className="dashboard-skeleton__analytics-product-name" />
                  <SkeletonBlock className="dashboard-skeleton__analytics-product-value" />
                </li>
              ))}
            </ul>
          </div>
        </section>
        <section className="dashboard-skeleton__analytics-panel dashboard-skeleton__analytics-panel--status">
          <header className="dashboard-skeleton__analytics-panel-header">
            <SkeletonLines count={2} />
          </header>
          <div className="dashboard-skeleton__analytics-status-overview">
            <SkeletonBlock className="dashboard-skeleton__line" />
            <SkeletonBlock className="dashboard-skeleton__analytics-status-total" />
          </div>
          <div className="dashboard-skeleton__analytics-status-tiles">
            {STATUS_GROUPS.map((_, index) => (
              <SkeletonBlock
                className="dashboard-skeleton__analytics-status-tile"
                key={index}
              />
            ))}
          </div>
          <ul className="dashboard-skeleton__analytics-status-list">
            {STATUS_GROUPS.map((_, index) => (
              <li key={index}>
                <span>
                  <SkeletonBlock className="dashboard-skeleton__analytics-dot" />
                  <SkeletonBlock className="dashboard-skeleton__line" />
                </span>
                <SkeletonBlock className="dashboard-skeleton__line--short" />
              </li>
            ))}
          </ul>
        </section>
        <section className="dashboard-skeleton__analytics-panel dashboard-skeleton__analytics-panel--revenue">
          <header className="dashboard-skeleton__analytics-panel-header">
            <SkeletonLines count={2} />
            <SkeletonBlock className="dashboard-skeleton__analytics-period-text" />
          </header>
          <div className="dashboard-skeleton__analytics-revenue-metrics">
            {Array.from({ length: 2 }, (_, index) => (
              <div className="dashboard-skeleton__analytics-metric" key={index}>
                <SkeletonBlock className="dashboard-skeleton__line" />
                <SkeletonBlock className="dashboard-skeleton__line--title" />
              </div>
            ))}
          </div>
          <div className="dashboard-skeleton__analytics-chart">
            <div className="dashboard-skeleton__analytics-plot">
              <SkeletonBlock className="dashboard-skeleton__analytics-area" />
            </div>
            <div className="dashboard-skeleton__analytics-dates">
              {PERIOD_DAYS.map((_, index) => (
                <SkeletonBlock key={index} />
              ))}
            </div>
          </div>
          <div className="dashboard-skeleton__analytics-legend">
            {Array.from({ length: 2 }, (_, index) => (
              <div
                className="dashboard-skeleton__analytics-legend-item"
                key={index}
              >
                <SkeletonBlock className="dashboard-skeleton__analytics-dot" />
                <SkeletonBlock className="dashboard-skeleton__line" />
              </div>
            ))}
          </div>
        </section>
        <section className="dashboard-skeleton__analytics-panel dashboard-skeleton__analytics-panel--countries">
          <header className="dashboard-skeleton__analytics-panel-header">
            <SkeletonLines count={2} />
            <SkeletonBlock className="dashboard-skeleton__analytics-period-text" />
          </header>
          <SkeletonBlock className="dashboard-skeleton__analytics-country-map" />
          <div className="dashboard-skeleton__analytics-country-summary">
            <SkeletonLines count={2} />
            <SkeletonLines count={2} />
          </div>
        </section>
        <section className="dashboard-skeleton__analytics-panel dashboard-skeleton__analytics-panel--payments">
          <header className="dashboard-skeleton__analytics-panel-header">
            <SkeletonLines count={2} />
            <SkeletonBlock className="dashboard-skeleton__line--short" />
          </header>
          <ul className="dashboard-skeleton__analytics-sales-list">
            {RECENT_SALES.map((_, index) => (
              <li className="dashboard-skeleton__analytics-sale" key={index}>
                <SkeletonLines count={2} />
                <SkeletonBlock className="dashboard-skeleton__line--short" />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  )
}
