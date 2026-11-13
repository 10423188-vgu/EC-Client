import '../../../../shared/styles/skeleton.css'
import '../SharedWishlist.css'
import './SharedWishlistSkeleton.css'

// why: six representative cards keep the loading preview compact; the API still returns 12 per page.
const CARD_COUNT = 6

export default function SharedWishlistSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Shared wishlist loading">
      <div className="shared-wishlist__grid" aria-hidden="true">
        {Array.from({ length: CARD_COUNT }, (_, index) => (
          <div className="shared-wishlist-skeleton__card" key={index}>
            <span className="skeleton shared-wishlist-skeleton__image" />
            <div className="shared-wishlist-skeleton__info">
              <span className="skeleton shared-wishlist-skeleton__name" />
              <span className="skeleton shared-wishlist-skeleton__name shared-wishlist-skeleton__name--short" />
              <span className="skeleton shared-wishlist-skeleton__price" />
            </div>
          </div>
        ))}
      </div>
      <div className="shared-wishlist-skeleton__pagination" aria-hidden="true">
        <span className="skeleton" />
        <span className="skeleton" />
        <span className="skeleton" />
      </div>
    </div>
  )
}
