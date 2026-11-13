import { useState } from 'react'
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa'
import './StarRating.css'
export const StarRating = ({
  value = 0,
  max = 5,
  size = 16,
  className = '',
}) => {
  const stars = Array.from(
    {
      length: max,
    },
    (_, i) => {
      const filled = value - i
      if (filled >= 1) return 'full'
      if (filled >= 0.5) return 'half'
      return 'empty'
    },
  )
  return (
    <span
      className={`star-rating ${className}`}
      aria-label={`${value} out of ${max} stars`}
    >
      {stars.map((type, i) => {
        const Icon =
          type === 'full' ? FaStar : type === 'half' ? FaStarHalfAlt : FaRegStar
        return (
          <Icon
            key={i}
            size={size}
            className={
              type !== 'empty'
                ? 'star-rating__icon star-rating__icon--filled'
                : 'star-rating__icon star-rating__icon--empty'
            }
          />
        )
      })}
    </span>
  )
}
export const StarPicker = ({ value, onChange, size = 24, className = '' }) => {
  const [hovered, setHovered] = useState(0)
  const display = hovered || value
  return (
    <span
      className={`star-picker ${className}`}
      role="radiogroup"
      aria-label="Select rating"
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="star-picker__rating-button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
        >
          {star <= display ? (
            <FaStar
              size={size}
              className="star-picker__icon star-picker__icon--active"
            />
          ) : (
            <FaRegStar
              size={size}
              className="star-picker__icon star-picker__icon--inactive"
            />
          )}
        </button>
      ))}
    </span>
  )
}
