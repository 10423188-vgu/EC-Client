import { FiPlus } from 'react-icons/fi'
import './CreateButton.css'

export function CreateButton({
  children,
  className = '',
  disabled = false,
  onClick,
}) {
  return (
    <button
      type="button"
      className={`create-button${className ? ` ${className}` : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      <svg
        className="create-button__border"
        viewBox="0 0 144 40"
        aria-hidden="true"
        focusable="false"
      >
        <path
          className="create-button__shape"
          d="M72 38H8a6 6 0 0 1-6-6V8a6 6 0 0 1 6-6h128a6 6 0 0 1 6 6v24a6 6 0 0 1-6 6Z"
          pathLength="100"
        />
      </svg>
      <span className="create-button__label">
        <FiPlus aria-hidden="true" />
        {children}
      </span>
    </button>
  )
}
