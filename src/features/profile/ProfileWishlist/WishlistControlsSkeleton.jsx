import './ProfileWishlistSkeleton.css'

export default function WishlistControlsSkeleton() {
  return (
    <header
      className="wishlist-controls profile-wishlist-skeleton__controls"
      role="status"
      aria-busy="true"
      aria-label="Wishlist controls loading"
    >
      <div
        className="profile-wishlist-skeleton__controls-copy"
        aria-hidden="true"
      >
        <div className="skeleton profile-wishlist-skeleton__controls-title" />
        <div className="skeleton profile-wishlist-skeleton__controls-description" />
        <div className="skeleton profile-wishlist-skeleton__controls-alert" />
      </div>
      <div className="profile-wishlist-skeleton__sharing" aria-hidden="true">
        <div className="skeleton profile-wishlist-skeleton__share-link" />
        <div className="profile-wishlist-skeleton__share-actions">
          <div className="skeleton profile-wishlist-skeleton__share-button" />
          <div className="skeleton profile-wishlist-skeleton__share-button profile-wishlist-skeleton__share-button--secondary" />
        </div>
      </div>
    </header>
  )
}
