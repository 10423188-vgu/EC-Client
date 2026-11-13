import { useState } from 'react'
import { useAuthStore } from '../../entities/user/model'
import {
  ProfileHero,
  ProfileAbout,
  ProfileTabs,
  ProfileWishlist,
  ProfileSecurity,
} from '../../features/profile'
export default function ProfilePage() {
  const user = useAuthStore((state) => state.user)
  const [activeTab, setActiveTab] = useState('about')
  const wishlistCount = user?.wishlistCount ?? 0
  return (
    <main className="profile">
      <ProfileHero user={user} />
      <ProfileTabs
        activeTab={activeTab}
        wishlistCount={wishlistCount}
        onChange={setActiveTab}
      />
      {activeTab === 'about' && <ProfileAbout user={user} />}
      {activeTab === 'wishlist' && <ProfileWishlist />}
      {activeTab === 'security' && <ProfileSecurity user={user} />}
    </main>
  )
}
