import '../../../../shared/styles/skeleton.css'
import '../../../../entities/user/ui/AddressCard.css'
import '../OrderDetail.css'
import './OrderDetailSkeleton.css'

// why: the first order response has no item count; three rows represent the demo order's visible list.
const ITEM_ROWS = 3

function SkeletonLine({ className = '' }) {
  return (
    <span className={`skeleton order-detail-skeleton__line ${className}`} />
  )
}

export default function OrderDetailSkeleton() {
  return (
    <main
      className="order-detail order-detail-skeleton"
      role="status"
      aria-busy="true"
      aria-label="Order details loading"
    >
      <div aria-hidden="true">
        <header className="order-detail__header">
          <SkeletonLine className="order-detail-skeleton__back" />
          <div className="order-detail__title-row">
            <SkeletonLine className="order-detail-skeleton__title" />
            <SkeletonLine className="order-detail-skeleton__status" />
          </div>
          <SkeletonLine className="order-detail-skeleton__date" />
        </header>

        <div className="order-detail__layout">
          <div className="order-detail__column order-detail__left">
            <section className="order-detail-section order-detail__progress-section">
              <SkeletonLine className="order-detail-skeleton__section-title" />
              <div className="order-detail__progress">
                {Array.from({ length: 4 }, (_, index) => (
                  <div
                    className="order-detail-skeleton__progress-step"
                    key={index}
                  >
                    <SkeletonLine className="order-detail-skeleton__progress-marker" />
                    <SkeletonLine className="order-detail-skeleton__progress-label" />
                  </div>
                ))}
              </div>
            </section>
            <section className="order-detail-section">
              <SkeletonLine className="order-detail-skeleton__section-title" />
              <div className="order-detail__items">
                {Array.from({ length: ITEM_ROWS }, (_, index) => (
                  <div className="order-detail__item" key={index}>
                    <SkeletonLine className="order-detail-skeleton__item-image" />
                    <div className="order-detail-skeleton__item-copy">
                      <SkeletonLine className="order-detail-skeleton__item-name" />
                      <SkeletonLine className="order-detail-skeleton__item-meta" />
                    </div>
                    <div className="order-detail-skeleton__item-price">
                      <SkeletonLine />
                      <SkeletonLine />
                    </div>
                  </div>
                ))}
              </div>
            </section>
            <section className="order-detail-section">
              <div className="address-card order-detail-skeleton__address">
                <div className="address-card__accent" />
                <div className="address-card__body">
                  <SkeletonLine className="order-detail-skeleton__address-title" />
                  <div className="address-card__row">
                    <SkeletonLine className="order-detail-skeleton__address-name" />
                    <SkeletonLine className="order-detail-skeleton__address-phone" />
                  </div>
                  <SkeletonLine className="order-detail-skeleton__address-line" />
                </div>
              </div>
            </section>
          </div>

          <aside className="order-detail__column order-detail__summary">
            <section className="order-detail-section">
              <SkeletonLine className="order-detail-skeleton__section-title" />
              <SkeletonLine className="order-detail__map" />
              <section className="order-detail-section">
                <SkeletonLine className="order-detail-skeleton__section-title" />
                <SkeletonLine className="order-detail-skeleton__payment-line" />
                <SkeletonLine className="order-detail-skeleton__payment-date" />
              </section>
            </section>
            <section className="order-detail-section">
              <SkeletonLine className="order-detail-skeleton__section-title" />
              <div className="order-detail__totals">
                {Array.from({ length: 3 }, (_, index) => (
                  <div className="order-detail-skeleton__total-row" key={index}>
                    <SkeletonLine />
                    <SkeletonLine />
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  )
}
