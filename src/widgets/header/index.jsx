import './Header.css'
import { memo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FaClock, FaPhone, FaShoppingBag } from 'react-icons/fa'
import { CiLogin } from 'react-icons/ci'
import { useShallow } from 'zustand/react/shallow'
import { useAuthStore } from '../../entities/user'
import { useCartCount, useCartDrawerStore } from '../../entities/cart'
import { lenis } from '../../shared/lib/lenis'
import UserDropdown from './UserDropdown'
import NotificationBell from './NotificationBell'
const NAV_LINKS = [
  {
    label: 'Products',
    to: '/products',
  },
  {
    label: 'About',
    to: '/about',
  },
  {
    label: 'Contact',
    to: '/contact',
  },
  {
    label: 'New',
    to: '/new',
  },
]
function Header() {
  const { user, isInitialized } = useAuthStore(
    useShallow((s) => ({
      user: s.user,
      isInitialized: s.isInitialized,
    })),
  )
  const openCart = useCartDrawerStore((s) => s.open)
  const { data: cartCount = 0 } = useCartCount()
  const { pathname } = useLocation()

  // why: already on "/" — a real navigation would keep the same route (no remount), so
  // useScrollRestoration's instant jump-to-0 fires against a still-mounted, still-pinned
  // HomeHero and leaves its canvas frame-sequence desynced from the reset scroll position.
  // Smooth-scrolling instead feeds ScrollTrigger a steady stream of scroll events — the same
  // path a real upward scroll takes, which already re-syncs the canvas correctly.
  const handleLogoClick = (e) => {
    if (pathname === '/') {
      e.preventDefault()
      lenis.scrollTo(0)
    }
  }
  return (
    <header className="header">
      <div className="header__layout">
        <Link to="/" className="header__logo" onClick={handleLogoClick}>
          Lorem
        </Link>

        <nav className="header__nav">
          <ul className="header__nav-list">
            {NAV_LINKS.map(({ label, to }) => (
              <li key={to}>
                <Link to={to} className="header__nav-link">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header__actions">
          <div className="header__support-info">
            <span className="header__support-item">
              <FaClock /> 24/7 Support
            </span>
            <span className="header__support-item">
              <FaPhone /> 0123 456 789
            </span>
          </div>

          <button
            className="header__cart-button"
            onClick={openCart}
            aria-label="Open cart"
          >
            <FaShoppingBag size={16} />
            {cartCount > 0 && (
              <span className="header__cart-badge">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </button>

          {isInitialized &&
            (user ? (
              <>
                <NotificationBell />
                <UserDropdown user={user} />
              </>
            ) : (
              <Link to="/login" className="header__login-link">
                <span className="header__login-link-icon-wrapper">
                  <CiLogin className="header__login-link-icon" />
                </span>
                <span className="header__login-link-text">Login</span>
              </Link>
            ))}
        </div>
      </div>
    </header>
  )
}
export default memo(Header)
