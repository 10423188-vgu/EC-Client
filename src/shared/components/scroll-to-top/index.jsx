import { useEffect, useState } from 'react'
import { FaArrowUp } from 'react-icons/fa'
import { lenis } from '../../lib/lenis'
import { useMagnetic } from '../../hooks/useMagnetic'
import './ScrollToTop.css'
const SHOW_AFTER_PX = 400
const RADIUS = 23
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
export function ScrollToTop() {
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(0)
  const { ref, onMouseEnter, onMouseMove, onMouseLeave } = useMagnetic({
    snapDuration: 0.5,
  })
  useEffect(() => {
    const update = ({ scroll, limit }) => {
      setVisible(scroll > SHOW_AFTER_PX)
      setProgress(limit > 0 ? scroll / limit : 0)
    }
    update({
      scroll: lenis.scroll,
      limit: lenis.limit,
    })
    lenis.on('scroll', update)
    return () => lenis.off('scroll', update)
  }, [])
  return (
    // why: entrance/exit (opacity + scale) animates on this wrapper's class, not on the
    // button itself — useMagnetic sets `transform: translate(x, y)` on the button via GSAP
    // inline style, which would stomp any CSS `transform` on that same element
    <div
      className={`scroll-to-top-wrapper${visible ? ' scroll-to-top-wrapper--visible' : ''}`}
    >
      <button
        ref={ref}
        type="button"
        className="scroll-to-top"
        onClick={() => lenis.scrollTo(0)}
        onMouseEnter={onMouseEnter}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        aria-label="Scroll to top"
      >
        <svg
          width="52"
          height="52"
          viewBox="0 0 52 52"
          className="scroll-to-top__ring"
          aria-hidden="true"
        >
          <circle
            cx="26"
            cy="26"
            r={RADIUS}
            className="scroll-to-top__ring-track"
          />
          <circle
            cx="26"
            cy="26"
            r={RADIUS}
            className="scroll-to-top__ring-progress"
            style={{
              strokeDasharray: CIRCUMFERENCE,
              strokeDashoffset: CIRCUMFERENCE * (1 - progress),
            }}
          />
        </svg>
        <FaArrowUp className="scroll-to-top__icon" />
      </button>
    </div>
  )
}
