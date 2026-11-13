import { Link } from 'react-router-dom'
import './EyeButton.css'

export function EyeButton({
  to,
  children,
  className = '',
  onClick,
  disabled = false,
  loading = false,
}) {
  const buttonClassName = `eye-button${className ? ` ${className}` : ''}`
  const content = (
    <>
      <span className="eye-button__icon" aria-hidden="true" />
      <span className="eye-button__label">{children}</span>
    </>
  )

  if (to) {
    return (
      <Link to={to} className={buttonClassName}>
        {content}
      </Link>
    )
  }

  return (
    <button
      type="button"
      className={buttonClassName}
      onClick={onClick}
      disabled={disabled}
      aria-busy={loading}
    >
      {content}
    </button>
  )
}
