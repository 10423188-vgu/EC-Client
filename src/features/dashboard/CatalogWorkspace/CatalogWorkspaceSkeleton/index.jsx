import './CatalogWorkspaceSkeleton.css'
import { SkeletonBlock } from '../../DashboardWorkspaceSkeleton/SkeletonPrimitives'

// why: show the five table rows requested for compact dashboard skeletons.
const CATALOG_ROWS = 5

function CatalogTableSkeleton({ kind }) {
  const isCategory = kind === 'categories'
  const columns = isCategory ? 7 : 5

  return (
    <div className="dashboard-skeleton__catalog-table dashboard-skeleton__table">
      <div
        className="dashboard-skeleton__table-head"
        style={{ '--column-count': columns }}
      >
        {Array.from({ length: columns }, (_, index) => (
          <SkeletonBlock
            className="dashboard-skeleton__table-label"
            key={index}
          />
        ))}
      </div>
      {Array.from({ length: CATALOG_ROWS }, (_, rowIndex) => (
        <div
          className="dashboard-skeleton__table-row"
          key={rowIndex}
          style={{ '--column-count': columns }}
        >
          <div className="dashboard-skeleton__catalog-identity">
            <SkeletonBlock className="dashboard-skeleton__catalog-image" />
            <SkeletonBlock className="dashboard-skeleton__table-cell" />
          </div>
          <SkeletonBlock className="dashboard-skeleton__table-cell" />
          {isCategory && (
            <SkeletonBlock className="dashboard-skeleton__table-cell" />
          )}
          <SkeletonBlock className="dashboard-skeleton__table-cell" />
          {isCategory && (
            <SkeletonBlock className="dashboard-skeleton__table-cell" />
          )}
          <SkeletonBlock className="dashboard-skeleton__status-pill" />
          <div className="dashboard-skeleton__catalog-actions">
            <SkeletonBlock className="dashboard-skeleton__catalog-action" />
            <SkeletonBlock className="dashboard-skeleton__catalog-action" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function CatalogWorkspaceSkeleton({ kind }) {
  return (
    <div
      className={`dashboard-skeleton__catalog-panel dashboard-skeleton__catalog-panel--${kind}`}
    >
      <header className="dashboard-skeleton__catalog-toolbar">
        <SkeletonBlock className="dashboard-skeleton__line--button" />
      </header>
      <div className="dashboard-skeleton__catalog-filters">
        {Array.from({ length: 3 }, (_, index) => (
          <SkeletonBlock
            className="dashboard-skeleton__line--field"
            key={index}
          />
        ))}
      </div>
      <div className="dashboard-skeleton__notice">
        <SkeletonBlock className="dashboard-skeleton__notice-line" />
      </div>
      <div className="dashboard-skeleton__summary">
        <SkeletonBlock className="dashboard-skeleton__line--short" />
      </div>
      <div className="dashboard-skeleton__table-scroll">
        <CatalogTableSkeleton kind={kind} />
      </div>
      <footer className="dashboard-skeleton__catalog-footer">
        <SkeletonBlock className="dashboard-skeleton__line--field" />
      </footer>
    </div>
  )
}
