import '../../../shared/styles/skeleton.css'
import '../../../entities/review/ui/ReviewCard.css'
import '../../../entities/review/ui/ReviewStats.css'
import './ReviewProduct.css'
import './ReviewProductSkeleton.css'

// why: cap review placeholders at the two cards requested for visual review.
const REVIEW_SKELETON_COUNT = 2

export function ReviewProductSkeleton({ showCta = true }) {
  return (
    <section
      className="review-product review-product-skeleton"
      role="status"
      aria-busy="true"
      aria-label="Customer reviews loading"
    >
      <h2 className="review-product__title">Customer Reviews</h2>
      <div className="review-product__layout">
        <aside className="review-product__left">
          <div className="review-stats review-product-skeleton__stats">
            <div className="review-stats__summary">
              <div className="skeleton review-product-skeleton__average" />
              <div className="skeleton review-product-skeleton__summary-line" />
              <div className="skeleton review-product-skeleton__summary-line review-product-skeleton__summary-line--short" />
            </div>
            <div className="review-stats__bars">
              {Array.from({ length: 5 }, (_, i) => (
                <div className="review-product-skeleton__rating-row" key={i}>
                  <div className="skeleton review-product-skeleton__rating-label" />
                  <div className="skeleton review-product-skeleton__rating-bar" />
                  <div className="skeleton review-product-skeleton__rating-count" />
                </div>
              ))}
            </div>
          </div>
          {showCta && (
            <div className="review-product__cta">
              <div className="skeleton review-product-skeleton__cta-title" />
              <div className="skeleton review-product-skeleton__cta-description" />
              <div className="skeleton review-product-skeleton__cta-button" />
            </div>
          )}
        </aside>
        <div className="review-product__right">
          <div className="review-product__controls">
            <div className="review-product__filter-chips">
              <div className="skeleton review-product-skeleton__filter" />
            </div>
            <div className="skeleton review-product-skeleton__sort" />
          </div>
          <div className="review-product__list">
            {Array.from({ length: REVIEW_SKELETON_COUNT }, (_, i) => (
              <article
                className="review-card review-product-skeleton__card"
                key={i}
              >
                <header className="review-card__header">
                  <div className="review-card__user">
                    <div className="skeleton review-product-skeleton__avatar" />
                    <div className="review-card__user-info">
                      <div className="skeleton review-product-skeleton__username" />
                      <div className="skeleton review-product-skeleton__meta" />
                    </div>
                  </div>
                </header>
                <div className="review-card__rating-row">
                  {Array.from({ length: 5 }, (_, star) => (
                    <div
                      className="skeleton review-product-skeleton__star"
                      key={star}
                    />
                  ))}
                </div>
                <div className="skeleton review-product-skeleton__title-line" />
                <div className="review-product-skeleton__body">
                  <div className="skeleton review-product-skeleton__body-line" />
                  <div className="skeleton review-product-skeleton__body-line" />
                  <div className="skeleton review-product-skeleton__body-line review-product-skeleton__body-line--short" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
