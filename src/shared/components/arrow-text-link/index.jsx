import { Link } from 'react-router-dom'
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa'
import './ArrowTextLink.css'

export function ArrowTextLink({
  to,
  children,
  className = '',
  direction = 'right',
}) {
  const ArrowIcon = direction === 'left' ? FaArrowLeft : FaArrowRight

  return (
    <Link
      to={to}
      className={`arrow-text-link arrow-text-link--${direction}${className ? ` ${className}` : ''}`}
    >
      {direction === 'left' && (
        <ArrowIcon className="arrow-text-link__icon" aria-hidden="true" />
      )}
      {children}
      {direction !== 'left' && (
        <ArrowIcon className="arrow-text-link__icon" aria-hidden="true" />
      )}
    </Link>
  )
}
