import gsap from 'gsap'
import { useLayoutEffect, useRef } from 'react'

export default function useProductDetailGsap(productId) {
  const pageRef = useRef(null)

  useLayoutEffect(() => {
    if (!productId || !pageRef.current) return

    const motion = gsap.matchMedia()
    motion.add('(prefers-reduced-motion: no-preference)', () => {
      const select = gsap.utils.selector(pageRef)
      const timeline = gsap
        .timeline({ defaults: { ease: 'power2.out' } })
        .from(select('.product-breadcrumb'), {
          autoAlpha: 0,
          duration: 0.3,
          y: 10,
        })
        .from(
          select('.product-detail__gallery-column'),
          { autoAlpha: 0, duration: 0.55, y: 18 },
          0.12,
        )
      const reveal = select('.product-detail-gallery__reveal')
      if (reveal.length) {
        timeline.fromTo(
          reveal,
          { yPercent: 0 },
          { duration: 0.85, ease: 'power3.inOut', yPercent: 101 },
          0.2,
        )
        timeline.from(
          select('.product-detail-gallery__image-primary'),
          { duration: 0.9, ease: 'power3.out', scale: 0.96 },
          0.2,
        )
      }

      timeline.from(
        select(
          '.product-detail-info__meta, .product-detail-info__name, .product-detail-info__price-group, .product-detail__divider, .product-detail-actions__section, .product-detail-actions__buttons',
        ),
        { autoAlpha: 0, duration: 0.5, stagger: 0.08, y: 16 },
        0.4,
      )

      const stockIcon = select('.product-detail-actions__stock-icon')
      if (stockIcon.length) {
        timeline.from(
          stockIcon,
          { autoAlpha: 0, duration: 0.4, ease: 'back.out(1.6)', scale: 0 },
          1.2,
        )
      }
    })

    return () => motion.revert()
  }, [productId])

  return pageRef
}
