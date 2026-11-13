import { useEffect, useState } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import './CarouselControls.css'

const SWIPER_EVENTS = [
  'breakpoint',
  'fromEdge',
  'lock',
  'reachBeginning',
  'reachEnd',
  'resize',
  'slideChange',
  'unlock',
  'update',
]

export function CarouselControls({
  swiper,
  onPrevious,
  onNext,
  previousDisabled = false,
  nextDisabled = false,
  previousLabel = 'Previous items',
  nextLabel = 'Next items',
  variant = 'below',
  revealOnHover = true,
}) {
  const [position, setPosition] = useState({
    isBeginning: true,
    isEnd: true,
    isLocked: true,
  })

  useEffect(() => {
    if (!swiper || swiper.destroyed) return

    const updatePosition = () => {
      setPosition({
        isBeginning: swiper.isBeginning,
        isEnd: swiper.isEnd,
        isLocked: swiper.isLocked,
      })
    }

    updatePosition()
    SWIPER_EVENTS.forEach((event) => swiper.on(event, updatePosition))
    return () =>
      SWIPER_EVENTS.forEach((event) => swiper.off(event, updatePosition))
  }, [swiper])

  if (swiper && position.isLocked) return null
  if (!swiper && (!onPrevious || !onNext)) return null
  if (!swiper && variant === 'overlay' && previousDisabled && nextDisabled) {
    return null
  }

  const className = [
    'carousel-controls',
    `carousel-controls--${variant}`,
    revealOnHover && 'carousel-controls--reveal-on-hover',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={className}>
      <button
        type="button"
        className="carousel-controls__button"
        onClick={onPrevious ?? (() => swiper?.slidePrev())}
        disabled={swiper ? position.isBeginning : previousDisabled}
        aria-label={previousLabel}
      >
        <FiChevronLeft aria-hidden="true" />
      </button>
      <button
        type="button"
        className="carousel-controls__button"
        onClick={onNext ?? (() => swiper?.slideNext())}
        disabled={swiper ? position.isEnd : nextDisabled}
        aria-label={nextLabel}
      >
        <FiChevronRight aria-hidden="true" />
      </button>
    </div>
  )
}
