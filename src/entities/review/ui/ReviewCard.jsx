import { useState } from 'react'
import {
  FaThumbsUp,
  FaThumbsDown,
  FaCheckCircle,
  FaUserCircle,
  FaStore,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaExpand,
} from 'react-icons/fa'
import './ReviewCard.css'
import { StarRating } from './StarRating.jsx'
import { getNextReviewVote } from '../model/vote.js'
const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
const RATING_ACCENT = {
  5: 'var(--success)',
  4: 'var(--rating-4)',
  3: 'var(--rating-3)',
  2: 'var(--rating-2)',
  1: 'var(--danger)',
}
const MAX_BODY_LENGTH = 280
export const ReviewCard = ({
  review,
  currentUserId,
  onVote,
  onEdit,
  onDelete,
}) => {
  const [imgIndex, setImgIndex] = useState(null)
  const [expanded, setExpanded] = useState(false)
  const [myVote, setMyVote] = useState(review.myVote ?? null)
  const isOwner = currentUserId && currentUserId === review.userId
  const canVote = currentUserId && !isOwner
  const accent = RATING_ACCENT[review.rating] ?? 'var(--rating-3)'
  const bodyText = review.body ?? ''
  const isTruncatable = bodyText.length > MAX_BODY_LENGTH
  const displayBody =
    isTruncatable && !expanded
      ? bodyText.slice(0, MAX_BODY_LENGTH) + '…'
      : bodyText
  const images = review.images ?? []
  const hasPrev = imgIndex > 0
  const hasNext = imgIndex < images.length - 1
  const handleLightboxKeyDown = (e) => {
    if (e.key === 'Escape') setImgIndex(null)
    if (e.key === 'ArrowLeft' && hasPrev) setImgIndex((i) => i - 1)
    if (e.key === 'ArrowRight' && hasNext) setImgIndex((i) => i + 1)
  }
  const handleVote = async (vote) => {
    const previousVote = myVote
    setMyVote(getNextReviewVote(previousVote, vote))
    try {
      const response = await onVote?.(review._id, vote)
      const confirmedVote = response?.data?.data?.myVote
      if (confirmedVote !== undefined) setMyVote(confirmedVote)
    } catch {
      setMyVote(previousVote)
    }
  }
  return (
    <article
      className="review-card"
      style={{
        '--review-card-accent': accent,
      }}
    >
      <header className="review-card__header">
        <div className="review-card__user">
          <div className="review-card__avatar-wrapper">
            {review.userAvatar ? (
              <img
                src={review.userAvatar}
                alt={review.userName}
                width={44}
                height={44}
                className="review-card__avatar"
                loading="lazy"
              />
            ) : (
              <FaUserCircle
                size={44}
                className="review-card__avatar-placeholder"
              />
            )}
            <span className="review-card__avatar-ring" />
          </div>

          <div className="review-card__user-info">
            <span className="review-card__username">{review.userName}</span>
            <div className="review-card__meta">
              <time dateTime={review.createdAt} className="review-card__date">
                {formatDate(review.createdAt)}
              </time>
              {review.isVerifiedPurchase && (
                <span className="review-card__verified">
                  <FaCheckCircle size={10} />
                  Verified Purchase
                </span>
              )}
            </div>
          </div>
        </div>

        {isOwner && (
          <div className="review-card__owner-actions">
            <button
              type="button"
              className="review-card__owner-action-button"
              onClick={() => onEdit?.(review)}
            >
              Edit
            </button>
            <button
              type="button"
              className="review-card__owner-action-button review-card__owner-action-button--danger"
              onClick={() => onDelete?.(review)}
            >
              Delete
            </button>
          </div>
        )}
      </header>

      <div className="review-card__rating-row">
        <StarRating value={review.rating} size={15} />
        {review.title && (
          <span className="review-card__title">{review.title}</span>
        )}
      </div>

      <div className="review-card__body-wrapper">
        <p className="review-card__body">{displayBody}</p>
        {isTruncatable && (
          <button
            type="button"
            className="review-card__expand-button"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>

      {images.length > 0 && (
        <div className="review-card__images">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              className="review-card__image-button"
              onClick={() => setImgIndex(i)}
              aria-label={`View image ${i + 1}`}
            >
              <img
                src={img.url}
                alt={img.altText ?? `Review image ${i + 1}`}
                width={88}
                height={88}
                className="review-card__image"
                loading="lazy"
              />
              <span className="review-card__image-overlay">
                <FaExpand size={14} />
              </span>
            </button>
          ))}
        </div>
      )}

      {review.adminResponse && (
        <div className="review-card__admin-response">
          <div className="review-card__admin-header">
            <FaStore size={12} />
            <strong className="review-card__admin-label">
              Response from the seller
            </strong>
          </div>
          <p className="review-card__admin-body">{review.adminResponse.body}</p>
        </div>
      )}

      <footer className="review-card__footer">
        <div className="review-card__helpful">
          <span className="review-card__helpful-label">Helpful?</span>

          {canVote ? (
            <div className="review-card__vote-group">
              <button
                type="button"
                className={`review-card__vote-button review-card__vote-button--yes${myVote === 'helpful' ? ' review-card__vote-button--selected' : ''}`}
                onClick={() => handleVote('helpful')}
                aria-label="Helpful"
                aria-pressed={myVote === 'helpful'}
              >
                <FaThumbsUp size={12} />
                <span>{review.helpfulCount}</span>
              </button>
              <button
                type="button"
                className={`review-card__vote-button review-card__vote-button--no${myVote === 'not_helpful' ? ' review-card__vote-button--selected' : ''}`}
                onClick={() => handleVote('not_helpful')}
                aria-label="Not helpful"
                aria-pressed={myVote === 'not_helpful'}
              >
                <FaThumbsDown size={12} />
                <span>{review.notHelpfulCount}</span>
              </button>
            </div>
          ) : (
            <span className="review-card__helpful-count">
              <FaThumbsUp size={11} />
              {review.helpfulCount}
            </span>
          )}
        </div>
      </footer>

      {imgIndex !== null && (
        <div
          className="review-card__lightbox"
          onClick={() => setImgIndex(null)}
          onKeyDown={handleLightboxKeyDown}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
        >
          <button
            type="button"
            className="review-card__lightbox-close"
            onClick={() => setImgIndex(null)}
            aria-label="Close"
          >
            <FaTimes size={18} />
          </button>

          {hasPrev && (
            <button
              type="button"
              className="review-card__lightbox-nav review-card__lightbox-nav--previous"
              onClick={(e) => {
                e.stopPropagation()
                setImgIndex((i) => i - 1)
              }}
              aria-label="Previous image"
            >
              <FaChevronLeft size={20} />
            </button>
          )}

          <img
            src={images[imgIndex].url}
            alt={images[imgIndex].altText ?? 'Review image'}
            className="review-card__lightbox-image"
            onClick={(e) => e.stopPropagation()}
          />

          {hasNext && (
            <button
              type="button"
              className="review-card__lightbox-nav review-card__lightbox-nav--next"
              onClick={(e) => {
                e.stopPropagation()
                setImgIndex((i) => i + 1)
              }}
              aria-label="Next image"
            >
              <FaChevronRight size={20} />
            </button>
          )}

          {images.length > 1 && (
            <div className="review-card__lightbox-dots">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`review-card__lightbox-dot${i === imgIndex ? ' review-card__lightbox-dot--active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    setImgIndex(i)
                  }}
                  aria-label={`Image ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  )
}
