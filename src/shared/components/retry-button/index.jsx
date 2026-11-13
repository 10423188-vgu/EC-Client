import { useMagnetic } from '../../hooks/useMagnetic'
import './RetryButton.css'

export function RetryButton({
  label = 'Try again',
  onClick,
  loading = false,
  disabled = false,
  className = '',
  ...props
}) {
  const { ref, onMouseEnter, onMouseMove, onMouseLeave } = useMagnetic({
    moveDuration: 0.28,
    snapDuration: 0.32,
  })

  return (
    <button
      ref={ref}
      type="button"
      className={`retry-button${loading ? ' retry-button--loading' : ''}${className ? ` ${className}` : ''}`}
      onClick={onClick}
      onMouseEnter={disabled || loading ? undefined : onMouseEnter}
      onMouseMove={disabled || loading ? undefined : onMouseMove}
      onMouseLeave={onMouseLeave}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? 'Trying again…' : label}
    </button>
  )
}
