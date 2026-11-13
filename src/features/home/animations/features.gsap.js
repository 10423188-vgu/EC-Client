import gsap from 'gsap'
import { useLayoutEffect } from 'react'

export default function useFeaturesGsap({ featuresRef, ready }) {
  // why: useLayoutEffect runs before paint — prevents flash of unpositioned cards that useEffect would cause
  useLayoutEffect(() => {
    if (!featuresRef.current || !ready) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(featuresRef)
      const productShowcase = q(
        '.home-features__scene, .home-features__few-products',
      )
      const featuredCards = q(
        '.home-features__ring-card .product-card, .home-features__few-product .product-card',
      )

      // ─── Header Entry ─────────────────────────────────────────────────────────────
      const timeline = gsap
        .timeline({
          scrollTrigger: {
            trigger: q('.home-features__header'),
            start: 'top 78%',
            toggleActions: 'play none none none',
            refreshPriority: -1, // why: must recalculate AFTER intro section's pinned ST; lower priority = later refresh = correct offset
          },
          defaults: { ease: 'power3.out' },
        })
        .from(q('.home-features__eyebrow'), {
          scaleX: 0,
          transformOrigin: 'left center',
          duration: 0.5,
        })
        .from(
          q('.home-features__title'),
          {
            y: 36,
            autoAlpha: 0,
            duration: 0.7,
          },
          '-=0.2',
        )
        .from(
          q('.home-features__lead'),
          {
            y: 20,
            autoAlpha: 0,
            duration: 0.6,
          },
          '-=0.45',
        )

      if (productShowcase.length) {
        timeline.from(
          productShowcase,
          {
            autoAlpha: 0,
            duration: 0.7,
            ease: 'power3.out',
            y: 24,
          },
          '-=0.35',
        )
      }

      // why: reveal all cards together so the rotating ring reads as one showcase.
      if (featuredCards.length) {
        timeline.from(
          featuredCards,
          {
            autoAlpha: 0,
            duration: 0.8,
            ease: 'power3.out',
            rotationX: -8,
            scale: 0.94,
            transformOrigin: '50% 60%',
            y: 28,
          },
          '-=0.55',
        )
      }
    }, featuresRef)

    return () => ctx.revert()
  }, [ready, featuresRef])
}
