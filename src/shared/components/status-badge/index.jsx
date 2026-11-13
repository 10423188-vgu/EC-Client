import './StatusBadge.css'

const STATUS_TONES = [
  'warning',
  'info',
  'primary',
  'success',
  'danger',
  'neutral',
]

export function StatusBadge({
  children,
  className = '',
  size = 'default',
  tone = 'neutral',
}) {
  const safeTone = STATUS_TONES.includes(tone) ? tone : 'neutral'

  return (
    <span
      className={`status-badge status-badge--tone-${safeTone}${size === 'compact' ? ' status-badge--compact' : ''}${className ? ` ${className}` : ''}`}
    >
      {children}
    </span>
  )
}
