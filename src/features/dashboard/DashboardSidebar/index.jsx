import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  RiArrowLeftLine,
  RiArrowLeftDoubleLine,
  RiArrowRightSLine,
  RiArrowRightLine,
  RiArrowRightDoubleLine,
  RiAwardLine,
  RiDashboardLine,
  RiHomeLine,
  RiPieChart2Line,
  RiLogoutBoxLine,
  RiMore2Line,
  RiPriceTag3Line,
  RiCoupon3Line,
  RiShoppingBag3Line,
  RiStackLine,
  RiUser3Line,
} from 'react-icons/ri'
import { useLogout } from '../../../entities/user'
import { PopoverPanel, UserAvatar } from '../../../shared/components'
import { getDashboardSection } from '../dashboardSections'
import './DashboardSidebar.css'
const SIDEBAR_GROUPS = [
  {
    label: 'Main menu',
    items: [
      {
        icon: <RiDashboardLine />,
        label: 'Dashboard',
        to: '/dashboard?section=dashboard',
        section: 'dashboard',
      },
      {
        icon: <RiStackLine />,
        label: 'Products',
        to: '/dashboard?section=products',
        section: 'products',
      },
      {
        icon: <RiPriceTag3Line />,
        label: 'Categories',
        to: '/dashboard?section=categories',
        section: 'categories',
      },
      {
        icon: <RiAwardLine />,
        label: 'Brands',
        to: '/dashboard?section=brands',
        section: 'brands',
      },
    ],
  },
  {
    label: 'Leads',
    collapsible: false,
    items: [
      {
        icon: <RiShoppingBag3Line />,
        label: 'Orders',
        to: '/dashboard?section=orders',
        section: 'orders',
      },
      {
        icon: <RiCoupon3Line />,
        label: 'Coupons',
        to: '/dashboard?section=coupons',
        section: 'coupons',
      },
      {
        icon: <RiUser3Line />,
        label: 'Customers',
        to: '/dashboard?section=customers',
        section: 'customers',
      },
    ],
  },
  {
    label: 'Insights',
    collapsible: true,
    items: [
      {
        icon: <RiPieChart2Line />,
        label: 'Analytics',
        to: '/dashboard?section=analytics',
        section: 'analytics',
      },
    ],
  },
]
export default function DashboardSidebar({ isCollapsed, onToggle, user }) {
  const [searchParams] = useSearchParams()
  const [collapsedGroups, setCollapsedGroups] = useState({})
  const logout = useLogout()
  const activeSection = getDashboardSection(searchParams.get('section'))
  const adminName = user?.name || user?.email || 'Admin'
  return (
    <aside className="dashboard-sidebar">
      <header className="dashboard-sidebar__header">
        <Link to="/" className="dashboard-sidebar__brand">
          <span className="dashboard-sidebar__brand-name">LOREM</span>{' '}
          <span>ADMIN</span>
        </Link>
        <button
          type="button"
          className="dashboard-sidebar__toggle"
          onClick={onToggle}
          aria-label={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
        >
          <span className="dashboard-sidebar__toggle-icon">
            {isCollapsed ? <RiArrowRightLine /> : <RiArrowLeftLine />}
          </span>
          <span
            className="dashboard-sidebar__toggle-hover-icon"
            aria-hidden="true"
          >
            {isCollapsed ? (
              <RiArrowRightDoubleLine />
            ) : (
              <RiArrowLeftDoubleLine />
            )}
          </span>
        </button>
      </header>
      <nav className="dashboard-sidebar__nav">
        {SIDEBAR_GROUPS.map((group) => (
          <section key={group.label} className="dashboard-sidebar__group">
            {group.collapsible ? (
              <>
                <button
                  type="button"
                  className={`dashboard-sidebar__group-toggle${!collapsedGroups[group.label] ? ' dashboard-sidebar__group-toggle--expanded' : ''}${group.items.some((item) => item.section === activeSection) ? ' dashboard-sidebar__group-toggle--active' : ''}`}
                  onClick={() =>
                    setCollapsedGroups((current) => ({
                      ...current,
                      [group.label]: !current[group.label],
                    }))
                  }
                  aria-expanded={!collapsedGroups[group.label]}
                >
                  <span className="dashboard-sidebar__label">
                    {group.label}
                  </span>
                  <RiArrowRightSLine
                    className="dashboard-sidebar__group-arrow"
                    aria-hidden="true"
                  />
                </button>
                <div
                  className={`dashboard-sidebar__group-content${!collapsedGroups[group.label] ? ' dashboard-sidebar__group-content--expanded' : ''}`}
                  aria-hidden={!!collapsedGroups[group.label]}
                  inert={collapsedGroups[group.label] ? true : undefined}
                >
                  <div className="dashboard-sidebar__group-content-inner">
                    {group.items.map((item) => (
                      <Link
                        key={item.label}
                        to={item.to}
                        className={`dashboard-sidebar__item${activeSection === item.section ? ' dashboard-sidebar__item--active' : ''}`}
                      >
                        <span className="dashboard-sidebar__icon">
                          {item.icon}
                        </span>
                        <span className="dashboard-sidebar__text">
                          {item.label}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <span className="dashboard-sidebar__label">{group.label}</span>
            )}
            {!group.collapsible &&
              group.items.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`dashboard-sidebar__item${activeSection === item.section ? ' dashboard-sidebar__item--active' : ''}`}
                >
                  <span className="dashboard-sidebar__icon">{item.icon}</span>
                  <span className="dashboard-sidebar__text">{item.label}</span>
                </Link>
              ))}
          </section>
        ))}
      </nav>
      <footer className="dashboard-sidebar__footer">
        <div className="dashboard-sidebar__admin">
          <UserAvatar
            src={user?.avatar}
            name={adminName}
            className="dashboard-sidebar__admin-avatar"
            alt=""
          />
          <span className="dashboard-sidebar__admin-info">
            <span className="dashboard-sidebar__admin-name">{adminName}</span>
            <span className="dashboard-sidebar__admin-email">
              {user?.email || 'Administrator'}
            </span>
          </span>
          <details className="dashboard-sidebar__admin-menu">
            <summary
              className="dashboard-sidebar__admin-menu-trigger"
              aria-label="Admin account menu"
            >
              <RiMore2Line aria-hidden="true" />
            </summary>
            <PopoverPanel
              arrowPlacement="none"
              className="dashboard-sidebar__admin-menu-content"
            >
              <Link to="/" className="dashboard-sidebar__admin-menu-item">
                <RiHomeLine aria-hidden="true" />
                Back home
              </Link>
              <button
                type="button"
                className="dashboard-sidebar__admin-menu-item dashboard-sidebar__admin-menu-item--exit"
                onClick={() => logout.mutate()}
                disabled={logout.isPending}
              >
                <RiLogoutBoxLine aria-hidden="true" />
                {logout.isPending ? 'Exiting...' : 'Exit dashboard'}
              </button>
            </PopoverPanel>
          </details>
        </div>
      </footer>
    </aside>
  )
}
