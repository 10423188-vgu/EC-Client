import './NotificationBell.css'
import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaBell, FaCheck } from 'react-icons/fa'
import { useMagnetic } from '../../shared/hooks/useMagnetic'
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '../../entities/notification'
import { PopoverPanel } from '../../shared/components'
const POLL_MS = 20_000
const formatRelativeTime = (isoString) => {
  const minutes = Math.floor(
    (Date.now() - new Date(isoString).getTime()) / 60_000,
  )
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
const getInitials = (value = '') => {
  const words = value.trim().split(/\s+/).filter(Boolean)
  if (!words.length) return 'N'
  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2)
}
const groupNotifications = (notifications) => {
  const groups = {
    today: [],
    thisWeek: [],
  }
  notifications.forEach((notification) => {
    const diffMs = Date.now() - new Date(notification.createdAt).getTime()
    const hours = diffMs / (1000 * 60 * 60)
    const groupKey = hours < 24 ? 'today' : 'thisWeek'
    groups[groupKey].push(notification)
  })
  return groups
}
export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()
  const { data } = useNotifications(
    {
      page: 1,
      limit: 10,
    },
    {
      refetchInterval: POLL_MS,
    },
  )
  const notifications = data?.data ?? []
  const unreadCount = data?.unreadCount ?? 0
  const groupedNotifications = groupNotifications(notifications)
  const todayCount = groupedNotifications.today.length
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()
  const {
    ref: markAllRef,
    onMouseEnter: handleMarkAllMouseEnter,
    onMouseMove: handleMarkAllMouseMove,
    onMouseLeave: handleMarkAllMouseLeave,
  } = useMagnetic({
    moveDuration: 0.18,
    snapDuration: 0.45,
  })
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])
  const handleItemClick = (notification) => {
    setOpen(false)
    if (!notification.isRead) markRead.mutate(notification.id)
    if (notification.link) navigate(notification.link)
  }
  const renderGroup = (title, items) => {
    if (!items.length) return null
    return (
      <div key={title} className="notification-bell__group">
        <div className="notification-bell__group-header">{title}</div>
        <ul className="notification-bell__list">
          {items.map((notification) => (
            <li key={notification.id}>
              <button
                className={`notification-bell__item${notification.isRead ? '' : ' notification-bell__item--unread'}`}
                onClick={() => handleItemClick(notification)}
              >
                <span className="notification-bell__avatar" aria-hidden="true">
                  {getInitials(notification.title || notification.message)}
                </span>

                <span className="notification-bell__content">
                  <span className="notification-bell__content-top">
                    <span className="notification-bell__item-title">
                      {notification.title}
                    </span>
                    {!notification.isRead && (
                      <span
                        className="notification-bell__dot"
                        aria-hidden="true"
                      />
                    )}
                  </span>
                  <span className="notification-bell__item-message">
                    {notification.message}
                  </span>
                </span>

                <span className="notification-bell__meta">
                  <span className="notification-bell__item-time">
                    {formatRelativeTime(notification.createdAt)}
                  </span>
                  {notification.isRead ? (
                    <span
                      className="notification-bell__status-pill notification-bell__status-pill--read"
                      aria-label="Read notification"
                    >
                      <FaCheck />
                      <span>Read</span>
                    </span>
                  ) : (
                    <span
                      className="notification-bell__status-pill notification-bell__status-pill--unread"
                      aria-label="Unread notification"
                    >
                      <span
                        className="notification-bell__status-dot"
                        aria-hidden="true"
                      />
                      <span>New</span>
                    </span>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    )
  }
  return (
    <div ref={ref} className="notification-bell">
      <button
        className="notification-bell__button"
        onClick={() => setOpen((p) => !p)}
        aria-label="Notifications"
        aria-expanded={open}
      >
        <FaBell size={16} />
        {unreadCount > 0 && (
          <span className="notification-bell__badge">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <PopoverPanel className="notification-bell__panel">
          <div className="notification-bell__header">
            <div className="notification-bell__title-group">
              <span className="notification-bell__title">Notifications</span>
              <span className="notification-bell__subtitle">
                {todayCount > 0
                  ? `You have ${todayCount} notifications today`
                  : 'You’re all caught up'}
              </span>
            </div>
            {unreadCount > 0 && (
              <button
                ref={markAllRef}
                className="notification-bell__mark-all"
                onClick={() => markAllRead.mutate()}
                onMouseEnter={handleMarkAllMouseEnter}
                onMouseMove={handleMarkAllMouseMove}
                onMouseLeave={handleMarkAllMouseLeave}
                disabled={markAllRead.isPending}
              >
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="notification-bell__empty">No notifications yet</p>
          ) : (
            <div className="notification-bell__body" data-lenis-prevent>
              {renderGroup('Today', groupedNotifications.today)}
              {renderGroup('This week', groupedNotifications.thisWeek)}
            </div>
          )}
        </PopoverPanel>
      )}
    </div>
  )
}
