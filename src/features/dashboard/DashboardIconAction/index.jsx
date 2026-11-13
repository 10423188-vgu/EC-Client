import './DashboardIconAction.css'

export default function DashboardIconAction({
  icon,
  label,
  href,
  danger = false,
  onClick,
  disabled = false,
}) {
  const Icon = icon
  const className = `dashboard-icon-action${danger ? ' dashboard-icon-action--danger' : ''}`

  if (href) {
    return (
      <a
        href={href}
        className={className}
        target="_blank"
        rel="noreferrer"
        aria-label={label}
      >
        <Icon aria-hidden="true" />
      </a>
    )
  }

  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
    >
      <Icon aria-hidden="true" />
    </button>
  )
}
