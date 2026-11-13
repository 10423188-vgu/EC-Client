import gsap from 'gsap'
import { useLayoutEffect } from 'react'

export default function useRelatedGsap(sectionRef, productId, ready) {
  useLayoutEffect(() => {
    if (!ready || !sectionRef.current) return

    const motion = gsap.matchMedia()
    motion.add('(prefers-reduced-motion: no-preference)', () => {
      const select = gsap.utils.selector(sectionRef)
      const firstSlides = select(
        '.product-related__swiper .swiper-slide',
      ).slice(0, 4)
      const timeline = gsap
        .timeline({
          defaults: { ease: 'power3.out' },
          scrollTrigger: {
            once: true,
            start: 'top 84%',
            trigger: sectionRef.current,
          },
        })
        .from(select('.product-related__title'), {
          autoAlpha: 0,
          duration: 0.5,
          y: 18,
        })
        .from(
          select('.product-related__swiper'),
          { autoAlpha: 0, duration: 0.5, y: 18 },
          '-=0.2',
        )

      if (firstSlides.length) {
        timeline.from(
          firstSlides,
          {
            autoAlpha: 0,
            duration: 0.75,
            ease: 'back.out(1.3)',
            rotation: (index) => (index % 2 ? 2 : -2),
            scale: 0.88,
            stagger: 0.1,
            y: 54,
          },
          '-=0.35',
        )
      }
    })

    return () => motion.revert()
  }, [productId, ready, sectionRef])
}
