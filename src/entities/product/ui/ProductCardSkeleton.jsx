import './ProductCard.css'
import './ProductCardSkeleton.css'
import '../../../shared/styles/skeleton.css'
export function ProductCardSkeleton({ showSaleBadge = false }) {
  return (
    <article className="product-card product-card--skeleton" aria-hidden="true">
      {showSaleBadge && (
        <div className="skeleton product-card-skeleton__badge" />
      )}
      <div className="product-card__media">
        <div className="product-card__image-frame">
          <div className="skeleton product-card-skeleton__image" />
        </div>
      </div>

      <div className="product-card__body">
        <div>
          <div className="product-card-skeleton__name">
            <div className="skeleton product-card-skeleton__bar product-card-skeleton__bar--long" />
            <div className="skeleton product-card-skeleton__bar product-card-skeleton__bar--short" />
          </div>
          <div className="product-card-skeleton__description">
            <div className="skeleton product-card-skeleton__bar product-card-skeleton__bar--small product-card-skeleton__bar--full" />
            <div className="skeleton product-card-skeleton__bar product-card-skeleton__bar--small product-card-skeleton__bar--medium" />
          </div>
          <div className="product-card-skeleton__stars">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton product-card-skeleton__star" />
            ))}
          </div>
        </div>

        <div className="skeleton product-card-skeleton__detail-link" />
        <div className="product-card__prices">
          <div className="skeleton product-card-skeleton__price" />
        </div>
        <div className="skeleton product-card-skeleton__add-button" />
      </div>
    </article>
  )
}
