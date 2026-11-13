import './ProfileWishlist.css'
import './ProfileWishlistSkeleton.css'
import '../../../shared/styles/skeleton.css'
import { WISHLIST_PAGE_LIMIT } from '../../../entities/wishlist'
import WishlistControlsSkeleton from './WishlistControlsSkeleton'

export function ProfileWishlistSkeleton({ itemCount = null, controls }) {
  // why: show a full eight-card page during loading even when the profile count is smaller.
  const skeletonItemCount = WISHLIST_PAGE_LIMIT
  const totalPages =
    itemCount === null ? null : Math.ceil(itemCount / WISHLIST_PAGE_LIMIT)
  const paginationItemCount =
    totalPages === null
      ? 7
      : totalPages <= 1
        ? 0
        : totalPages <= 4
          ? totalPages + 2
          : 7
  return (
    <section className="profile-wishlist profile-wishlist-skeleton">
      {controls ?? <WishlistControlsSkeleton />}
      <div role="status" aria-busy="true" aria-label="Wishlist items loading">
        {(itemCount === null || itemCount > 0) && (
          <div
            className="profile-wishlist-skeleton__actions"
            aria-hidden="true"
          >
            <div className="skeleton profile-wishlist-skeleton__count" />
            <div className="skeleton profile-wishlist-skeleton__clear" />
          </div>
        )}
        <div className="profile-wishlist__grid" aria-hidden="true">
          {Array.from({ length: skeletonItemCount }, (_, i) => (
            <div key={i} className="profile-wishlist-skeleton__item">
              <div className="skeleton profile-wishlist-skeleton__image" />

              <div className="profile-wishlist-skeleton__info">
                <div className="skeleton profile-wishlist-skeleton__name" />
                <div className="skeleton profile-wishlist-skeleton__name profile-wishlist-skeleton__name--short" />
                <div className="skeleton profile-wishlist-skeleton__price" />
              </div>

              <div className="skeleton profile-wishlist-skeleton__button" />
            </div>
          ))}
        </div>
        {paginationItemCount > 0 && (
          <footer
            className="profile-wishlist-skeleton__pagination"
            aria-hidden="true"
          >
            {/* why: mirror Pagination's page buttons and two arrow buttons. */}
            {Array.from({ length: paginationItemCount }, (_, i) => (
              <div
                key={i}
                className="skeleton profile-wishlist-skeleton__page"
              />
            ))}
          </footer>
        )}
      </div>
    </section>
  )
}
