import { useRef } from 'react'
import gsap from 'gsap'

const MAGNETIC_STRENGTH = 0.6

// why: keep pull strength consistent across controls; callers only tune the timing.
export function useMagnetic({ moveDuration = 0.25, snapDuration = 0.6 } = {}) {
  const ref = useRef(null)
  const rectRef = useRef(null)

  const onMouseEnter = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    rectRef.current = ref.current?.getBoundingClientRect() ?? null
  }

  const onMouseMove = (e) => {
    const rect = rectRef.current
    if (!rect || window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      return
    const dx = e.clientX - (rect.left + rect.width / 2)
    const dy = e.clientY - (rect.top + rect.height / 2)
    gsap.to(ref.current, {
      x: dx * MAGNETIC_STRENGTH,
      y: dy * MAGNETIC_STRENGTH,
      duration: moveDuration,
      ease: 'power2.out',
    })
  }

  const onMouseLeave = () => {
    rectRef.current = null
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(ref.current, { x: 0, y: 0 })
      return
    }
    gsap.to(ref.current, {
      x: 0,
      y: 0,
      duration: snapDuration,
      ease: 'elastic.out(1, 0.4)',
    })
  }

  return { ref, onMouseEnter, onMouseMove, onMouseLeave }
}
