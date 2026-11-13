import { SlidingTabs } from '../../../shared/components'
import './ProfileTabs.css'

export default function ProfileTabs({ activeTab, onChange, wishlistCount }) {
  const tabs = [
    { value: 'about', label: 'About' },
    { value: 'wishlist', label: 'Wishlist', count: wishlistCount },
    { value: 'security', label: 'Security' },
  ]
  return (
    <div className="profile-tabs">
      <SlidingTabs
        tabs={tabs}
        value={activeTab}
        className="profile-tabs__track"
        onChange={onChange}
        ariaLabel="Profile sections"
      />
      <div className="profile-tabs__divider" aria-hidden="true" />
    </div>
  )
}
