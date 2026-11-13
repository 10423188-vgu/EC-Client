import { useEffect } from 'react'
import gsap from 'gsap'
import { lenis } from '../../../../shared/lib/lenis'

export default function useMarqueeGsap(trackRef) {
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const tween = gsap.to(track, {
      xPercent: -50,
      duration: 16,
      ease: 'none',
      repeat: -1,
    })

    const handleScroll = ({ velocity }) => {
      tween.timeScale(1 + Math.min(Math.abs(velocity) * 0.18, 4))
      // why: overwrite kills stacked ease-back tweens from rapid scroll events
      gsap.to(tween, {
        timeScale: 1,
        duration: 1.2,
        ease: 'power2.out',
        overwrite: true,
      })
    }

    lenis.on('scroll', handleScroll)
    return () => {
      lenis.off('scroll', handleScroll)
      tween.kill()
    }
  }, [trackRef])
}
