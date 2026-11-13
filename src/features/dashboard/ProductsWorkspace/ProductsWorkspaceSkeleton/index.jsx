import './ProductsWorkspaceSkeleton.css'
import {
  SkeletonBlock,
  SkeletonLines,
} from '../../DashboardWorkspaceSkeleton/SkeletonPrimitives'

// why: Match ProductsWorkspace's default productLimit of 5 rows.
const PRODUCT_ROWS = Array.from({ length: 5 })
const SALES_DATES = Array.from({ length: 7 })

function ProductDistributionSkeleton() {
  return (
    <svg
      className="dashboard-skeleton__product-radar"
      viewBox="0 0 320 240"
      aria-hidden="true"
    >
      {[0.25, 0.5, 0.75, 1].map((scale) => (
        <polygon
          fill="none"
          key={scale}
          points={`160,${120 - 92 * scale} ${160 + 79 * scale},${120 - 46 * scale} ${160 + 79 * scale},${120 + 46 * scale} 160,${120 + 92 * scale} ${160 - 79 * scale},${120 + 46 * scale} ${160 - 79 * scale},${120 - 46 * scale}`}
        />
      ))}
      <polygon
        className="dashboard-skeleton__product-radar-shape"
        points="160,72 211,90 199,149 160,174 116,150 107,91"
      />
      <line x1="160" x2="160" y1="28" y2="212" />
      <line x1="81" x2="239" y1="74" y2="166" />
      <line x1="239" x2="81" y1="74" y2="166" />
    </svg>
  )
}

function ProductSalesChartSkeleton() {
  return (
    <div className="dashboard-skeleton__product-sales-chart">
      <div className="dashboard-skeleton__product-sales-plot">
        <SkeletonBlock className="dashboard-skeleton__product-sales-area" />
      </div>
      <div className="dashboard-skeleton__product-sales-dates">
        {SALES_DATES.map((_, index) => (
          <SkeletonBlock key={index} />
        ))}
      </div>
    </div>
  )
}

function ProductOverviewCard({ kind }) {
  return (
    <article
      className={`dashboard-skeleton__panel dashboard-skeleton__product-overview-card dashboard-skeleton__product-overview-card--${kind}`}
    >
      <header className="dashboard-skeleton__product-overview-header">
        <SkeletonLines count={2} />
        {kind === 'distribution' && (
          <SkeletonBlock className="dashboard-skeleton__product-period" />
        )}
      </header>
      {kind === 'selling' ? (
        <>
          <div className="dashboard-skeleton__product-rows">
            {PRODUCT_ROWS.slice(0, 2).map((_, index) => (
              <div className="dashboard-skeleton__product-row" key={index}>
                <SkeletonBlock className="dashboard-skeleton__product-rank" />
                <SkeletonBlock className="dashboard-skeleton__product-image" />
                <SkeletonLines
                  className="dashboard-skeleton__product-seller-name"
                  count={1}
                />
                <SkeletonBlock className="dashboard-skeleton__product-seller-quantity" />
              </div>
            ))}
          </div>
          <div className="dashboard-skeleton__product-inventory">
            <div className="dashboard-skeleton__product-inventory-header">
              <SkeletonBlock className="dashboard-skeleton__product-inventory-title" />
              <SkeletonBlock className="dashboard-skeleton__product-inventory-count" />
            </div>
            {PRODUCT_ROWS.slice(0, 2).map((_, index) => (
              <div className="dashboard-skeleton__product-row" key={index}>
                <SkeletonBlock className="dashboard-skeleton__product-image" />
                <SkeletonLines count={2} />
                <SkeletonBlock className="dashboard-skeleton__product-stock-status" />
              </div>
            ))}
          </div>
        </>
      ) : kind === 'sales' ? (
        <>
          <SkeletonBlock className="dashboard-skeleton__product-total" />
          <ProductSalesChartSkeleton />
        </>
      ) : (
        <ProductDistributionSkeleton />
      )}
    </article>
  )
}

function ProductTableSkeleton() {
  return (
    <div className="dashboard-skeleton__table-scroll">
      <div className="dashboard-skeleton__product-table dashboard-skeleton__table">
        <div className="dashboard-skeleton__table-head">
          {Array.from({ length: 9 }, (_, index) => (
            <SkeletonBlock
              className="dashboard-skeleton__table-label"
              key={index}
            />
          ))}
        </div>
        {PRODUCT_ROWS.map((_, rowIndex) => (
          <div className="dashboard-skeleton__table-row" key={rowIndex}>
            <SkeletonBlock className="dashboard-skeleton__product-select" />
            <div className="dashboard-skeleton__product-identity">
              <SkeletonBlock className="dashboard-skeleton__product-image" />
              <SkeletonLines count={2} />
            </div>
            <SkeletonBlock className="dashboard-skeleton__table-cell" />
            <SkeletonBlock className="dashboard-skeleton__table-cell--short" />
            <SkeletonBlock className="dashboard-skeleton__table-cell--short" />
            <SkeletonBlock className="dashboard-skeleton__table-cell" />
            <SkeletonBlock className="dashboard-skeleton__status-pill" />
            <SkeletonBlock className="dashboard-skeleton__table-cell" />
            <div className="dashboard-skeleton__product-actions">
              {Array.from({ length: 4 }, (_, index) => (
                <SkeletonBlock key={index} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ProductsOverviewSkeleton() {
  return (
    <div
      className="dashboard-skeleton__product-overview"
      role="status"
      aria-busy="true"
      aria-label="Product overview loading"
    >
      <ProductOverviewCard kind="distribution" />
      <ProductOverviewCard kind="selling" />
      <ProductOverviewCard kind="sales" />
    </div>
  )
}

export function ProductsTableSkeleton() {
  return (
    <section
      className="dashboard-skeleton__panel dashboard-skeleton__product-table-panel"
      role="status"
      aria-busy="true"
      aria-label="Product list loading"
    >
      <header className="dashboard-skeleton__toolbar">
        <SkeletonBlock className="dashboard-skeleton__line--title" />
        <div className="dashboard-skeleton__toolbar-actions">
          <SkeletonBlock className="dashboard-skeleton__line--field" />
          <SkeletonBlock className="dashboard-skeleton__line--button" />
        </div>
      </header>
      <div className="dashboard-skeleton__product-filter-header">
        <SkeletonBlock className="dashboard-skeleton__product-tabs" />
        <div className="dashboard-skeleton__filter-row">
          <SkeletonBlock className="dashboard-skeleton__line--field" />
          <SkeletonBlock className="dashboard-skeleton__line--field" />
          <SkeletonBlock className="dashboard-skeleton__line--button" />
        </div>
        <div className="dashboard-skeleton__summary">
          <SkeletonBlock className="dashboard-skeleton__line--short" />
        </div>
      </div>
      <ProductTableSkeleton />
      <footer className="dashboard-skeleton__pagination dashboard-skeleton__product-footer">
        <div className="dashboard-skeleton__product-pages">
          {Array.from({ length: 5 }, (_, index) => (
            <SkeletonBlock key={index} />
          ))}
        </div>
        <SkeletonBlock className="dashboard-skeleton__product-footer-label" />
        <SkeletonBlock className="dashboard-skeleton__line--field" />
      </footer>
    </section>
  )
}

export default function ProductsWorkspaceSkeleton() {
  return (
    <div className="dashboard-skeleton__products">
      <ProductsOverviewSkeleton />
      <ProductsTableSkeleton />
    </div>
  )
}
