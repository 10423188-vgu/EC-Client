import '../../../../shared/styles/skeleton.css'
import '../../CheckoutSection/CheckoutSection.css'
import '../../CheckoutSummary/CheckoutSummary.css'
import '../CheckoutFlow.css'
import './CheckoutFlowSkeleton.css'

// why: cart size is unknown on the first request; two rows match the visible summary area.
const ITEM_ROWS = 2

function SkeletonLine({ className = '' }) {
  return (
    <span className={`skeleton checkout-flow-skeleton__line ${className}`} />
  )
}

export default function CheckoutFlowSkeleton() {
  return (
    <div
      className="checkout-page__layout checkout-flow-skeleton"
      role="status"
      aria-busy="true"
      aria-label="Checkout details loading"
    >
      <div className="checkout-page__left" aria-hidden="true">
        <section className="checkout-section">
          <SkeletonLine className="checkout-flow-skeleton__section-title" />
          <div className="checkout-flow-skeleton__address">
            <SkeletonLine className="checkout-flow-skeleton__address-name" />
            <SkeletonLine className="checkout-flow-skeleton__address-detail" />
            <SkeletonLine className="checkout-flow-skeleton__address-detail checkout-flow-skeleton__address-detail--short" />
          </div>
          <SkeletonLine className="checkout-flow-skeleton__small-button" />
        </section>
        <section className="checkout-section">
          <SkeletonLine className="checkout-flow-skeleton__section-title" />
          <div className="checkout-flow-skeleton__payment">
            <SkeletonLine className="checkout-flow-skeleton__payment-icon" />
            <div className="checkout-flow-skeleton__payment-copy">
              <SkeletonLine className="checkout-flow-skeleton__payment-label" />
              <SkeletonLine className="checkout-flow-skeleton__payment-hint" />
            </div>
          </div>
        </section>
        <section className="checkout-section">
          <SkeletonLine className="checkout-flow-skeleton__section-title" />
          <SkeletonLine className="checkout-flow-skeleton__field" />
        </section>
        <section className="checkout-section">
          <SkeletonLine className="checkout-flow-skeleton__section-title" />
          <SkeletonLine className="checkout-flow-skeleton__note" />
        </section>
      </div>

      <aside className="checkout-summary" aria-hidden="true">
        <SkeletonLine className="checkout-flow-skeleton__summary-title" />
        <SkeletonLine className="checkout-flow-skeleton__summary-subtitle" />
        <div className="checkout-summary__items">
          {Array.from({ length: ITEM_ROWS }, (_, index) => (
            <div className="checkout-summary__item" key={index}>
              <SkeletonLine className="checkout-flow-skeleton__item-image" />
              <div className="checkout-flow-skeleton__item-copy">
                <SkeletonLine className="checkout-flow-skeleton__item-name" />
                <SkeletonLine className="checkout-flow-skeleton__item-variant" />
                <SkeletonLine className="checkout-flow-skeleton__item-control" />
              </div>
            </div>
          ))}
        </div>
        <div className="checkout-summary__totals">
          <div className="checkout-flow-skeleton__total-row">
            <SkeletonLine className="checkout-flow-skeleton__total-label" />
            <SkeletonLine className="checkout-flow-skeleton__total-value" />
          </div>
          <div className="checkout-flow-skeleton__total-row">
            <SkeletonLine className="checkout-flow-skeleton__total-label" />
            <SkeletonLine className="checkout-flow-skeleton__total-value" />
          </div>
          <div className="checkout-flow-skeleton__total-row checkout-flow-skeleton__total-row--final">
            <SkeletonLine className="checkout-flow-skeleton__total-label" />
            <SkeletonLine className="checkout-flow-skeleton__total-value" />
          </div>
        </div>
        <SkeletonLine className="checkout-flow-skeleton__terms" />
        <SkeletonLine className="checkout-flow-skeleton__submit" />
        <div className="checkout-flow-skeleton__trust">
          {Array.from({ length: 3 }, (_, index) => (
            <SkeletonLine key={index} />
          ))}
        </div>
      </aside>
    </div>
  )
}
