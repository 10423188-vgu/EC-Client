import './UserDropdown.css'
import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  RiUserLine,
  RiLogoutBoxLine,
  RiDashboardLine,
  RiShoppingBag3Line,
  RiArrowRightSLine,
} from 'react-icons/ri'
import { useLogout } from '../../entities/user'
import { PopoverPanel, UserAvatar } from '../../shared/components'
const MENU_ITEMS = [
  {
    icon: <RiShoppingBag3Line />,
    label: 'My Orders',
    to: '/orders',
  },
]
export default function UserDropdown({ user }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const logout = useLogout()
  const avatarName = user?.name || user?.email || 'U'
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])
  return (
    <div ref={ref} className="user-dropdown">
      <button
        className="user-dropdown__avatar"
        onClick={() => setOpen((p) => !p)}
        aria-label="User menu"
        aria-expanded={open}
      >
        <UserAvatar
          src={user.avatar}
          name={avatarName}
          className="user-dropdown__avatar-image"
          fallbackClassName="user-dropdown__avatar-fallback"
        />
      </button>

      {open && (
        <PopoverPanel className="user-dropdown__panel">
          <div className="user-dropdown__profile">
            <div className="user-dropdown__profile-avatar">
              <UserAvatar
                src={user.avatar}
                name={avatarName}
                className="user-dropdown__profile-avatar-image"
                fallbackClassName="user-dropdown__profile-avatar-initial"
              />
            </div>
            <div>
              <p className="user-dropdown__profile-name">
                {user.name || 'User'}
              </p>
              <p className="user-dropdown__profile-email">{user.email}</p>
            </div>
          </div>

          <Link
            to="/profile"
            className="user-dropdown__view-profile"
            onClick={() => setOpen(false)}
          >
            <RiUserLine />
            <span>View Profile</span>
          </Link>

          <div className="user-dropdown__divider" />

          {user.role === 'ADMIN' && (
            <Link
              to="/dashboard?section=dashboard"
              className="user-dropdown__item"
              onClick={() => setOpen(false)}
            >
              <span className="user-dropdown__item-icon">
                <RiDashboardLine />
              </span>
              <span className="user-dropdown__item-label">Dashboard</span>
              <span className="user-dropdown__item-arrow">
                <RiArrowRightSLine />
              </span>
            </Link>
          )}

          <div className="user-dropdown__menu">
            {MENU_ITEMS.map(({ icon, label, to }) => (
              <Link
                key={to}
                to={to}
                className="user-dropdown__item"
                onClick={() => setOpen(false)}
              >
                <span className="user-dropdown__item-icon">{icon}</span>
                <span className="user-dropdown__item-label">{label}</span>
                <span className="user-dropdown__item-arrow">
                  <RiArrowRightSLine />
                </span>
              </Link>
            ))}
          </div>

          <div className="user-dropdown__divider" />

          <button
            className="user-dropdown__item user-dropdown__item--logout"
            onClick={() => {
              setOpen(false)
              logout.mutate()
            }}
            disabled={logout.isPending}
          >
            <span className="user-dropdown__item-icon">
              <RiLogoutBoxLine />
            </span>
            <span className="user-dropdown__item-label">
              {logout.isPending ? 'Logging out...' : 'Log Out'}
            </span>
          </button>
        </PopoverPanel>
      )}
    </div>
  )
}
