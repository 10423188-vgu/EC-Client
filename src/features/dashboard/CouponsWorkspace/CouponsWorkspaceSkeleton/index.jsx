import { SkeletonBlock } from '../../DashboardWorkspaceSkeleton/SkeletonPrimitives'
import './CouponsWorkspaceSkeleton.css'

// why: five rows give a compact preview without changing the real page limit.
const ROWS = 5

export default function CouponsWorkspaceSkeleton() {
  return (
    <section className="dashboard-skeleton__panel dashboard-skeleton__coupons">
      <header className="dashboard-skeleton__toolbar">
        <SkeletonBlock className="dashboard-skeleton__line--button" />
      </header>
      <div className="dashboard-skeleton__coupon-filters">
        <SkeletonBlock className="dashboard-skeleton__line--field" />
        <SkeletonBlock className="dashboard-skeleton__line--field" />
      </div>
      <div className="dashboard-skeleton__coupon-notice">
        <SkeletonBlock className="dashboard-skeleton__line" />
      </div>
      <div className="dashboard-skeleton__summary">
        <SkeletonBlock className="dashboard-skeleton__line--short" />
      </div>
      <div className="dashboard-skeleton__coupon-scroll">
        <div className="dashboard-skeleton__table">
          <div className="dashboard-skeleton__coupon-row dashboard-skeleton__coupon-row--head">
            {Array.from({ length: 6 }, (_, index) => (
              <SkeletonBlock
                className="dashboard-skeleton__table-cell"
                key={index}
              />
            ))}
          </div>
          {Array.from({ length: ROWS }, (_, index) => (
            <div className="dashboard-skeleton__coupon-row" key={index}>
              <div className="dashboard-skeleton__coupon-identity">
                <SkeletonBlock className="dashboard-skeleton__coupon-initial" />
                <SkeletonBlock className="dashboard-skeleton__table-cell" />
              </div>
              {Array.from({ length: 4 }, (_, cellIndex) => (
                <SkeletonBlock
                  className={
                    cellIndex === 3
                      ? 'dashboard-skeleton__status-pill'
                      : 'dashboard-skeleton__table-cell'
                  }
                  key={cellIndex}
                />
              ))}
              <div className="dashboard-skeleton__coupon-actions">
                {Array.from({ length: 3 }, (_, actionIndex) => (
                  <SkeletonBlock
                    className="dashboard-skeleton__coupon-action"
                    key={actionIndex}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <footer className="dashboard-skeleton__pagination">
        <SkeletonBlock className="dashboard-skeleton__line--button" />
      </footer>
    </section>
  )
}
