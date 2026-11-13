import './ReviewStats.css'
import { StarRating } from './StarRating.jsx'
const BAR_COLORS = {
  5: 'var(--rating-5)',
  4: 'var(--rating-4)',
  3: 'var(--rating-3)',
  2: 'var(--rating-2)',
  1: 'var(--danger)',
}
export const ReviewStats = ({ reviewStats, onFilterRating, activeRating }) => {
  const { count = 0, average = 0, distribution = {} } = reviewStats ?? {}
  return (
    <div className="review-stats">
      <div className="review-stats__summary">
        <span className="review-stats__average">{average.toFixed(1)}</span>
        <StarRating value={average} size={20} />
        <span className="review-stats__count">
          {count.toLocaleString()} global ratings
        </span>
      </div>

      <div className="review-stats__bars">
        {[5, 4, 3, 2, 1].map((star) => {
          const starCount = distribution[String(star)] ?? 0
          const pct = count > 0 ? (starCount / count) * 100 : 0
          const isActive = activeRating === star
          return (
            <button
              key={star}
              type="button"
              className={`review-stats__bar-row${isActive ? ' review-stats__bar-row--active' : ''}`}
              onClick={() => onFilterRating?.(isActive ? undefined : star)}
            >
              <span className="review-stats__bar-label">{star} star</span>
              <span className="review-stats__bar-track">
                <span
                  className="review-stats__bar-fill"
                  style={{
                    width: `${pct}%`,
                    background: BAR_COLORS[star],
                  }}
                />
              </span>
              <span className="review-stats__bar-count">
                {starCount.toLocaleString()}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
