import gsap from 'gsap'
import { useLayoutEffect, useRef } from 'react'

export default function useReviewGsap(sectionRef, productId, isLoading) {
  const motionRef = useRef(null)

  useLayoutEffect(() => {
    if (isLoading || !sectionRef.current || motionRef.current) return

    const motion = gsap.matchMedia()
    motion.add('(prefers-reduced-motion: no-preference)', () => {
      const select = gsap.utils.selector(sectionRef)
      const timeline = gsap
        .timeline({
          defaults: { ease: 'power3.out' },
          scrollTrigger: {
            once: true,
            start: 'top 82%',
            trigger: sectionRef.current,
          },
        })
        .from(select('.review-product__title'), {
          autoAlpha: 0,
          duration: 0.45,
          y: 18,
        })
        .from(
          select('.review-product__left'),
          { autoAlpha: 0, duration: 0.65, x: -28 },
          '-=0.15',
        )
        .from(
          select('.review-product__right'),
          { autoAlpha: 0, duration: 0.65, x: 28 },
          '<',
        )

      const average = select('.review-stats__average')
      if (average.length) {
        timeline.from(
          average,
          { autoAlpha: 0, duration: 0.55, ease: 'back.out(1.6)', scale: 0.7 },
          '-=0.35',
        )
        timeline.from(
          select('.review-stats__bar-fill'),
          {
            duration: 0.7,
            scaleX: 0,
            stagger: 0.08,
            transformOrigin: 'left center',
          },
          '-=0.35',
        )
      }
    })

    motionRef.current = motion
  }, [isLoading, productId, sectionRef])

  useLayoutEffect(
    () => () => {
      motionRef.current?.revert()
      motionRef.current = null
    },
    [productId],
  )
}
