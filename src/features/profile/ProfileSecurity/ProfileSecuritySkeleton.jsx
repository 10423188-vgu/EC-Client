import '../../../shared/styles/skeleton.css'
import './ProfileSecurity.css'

export function SecurityItemSkeleton({
  ariaLabel = 'Two-factor authentication settings loading',
}) {
  return (
    <div
      className="profile-security__item"
      role="status"
      aria-busy="true"
      aria-label={ariaLabel}
    >
      <div className="profile-security__summary" aria-hidden="true">
        <div className="skeleton profile-security__skeleton-icon" />
        <div className="profile-security__label">
          <div className="skeleton profile-security__skeleton-title" />
          <div className="skeleton profile-security__skeleton-description" />
        </div>
        <div className="skeleton profile-security__skeleton-chevron" />
      </div>
    </div>
  )
}
