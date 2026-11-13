import './ProductRelated.css'
import ProductCard from '../ProductCard'
import 'swiper/css'
import { useRef, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import {
  ProductCardSkeleton,
  useRelatedProducts,
} from '../../../entities/product'
import { useWishlistIds } from '../../../entities/wishlist'
import useRelatedGsap from '../animations/related.gsap'
import { CarouselControls, RetryButton } from '../../../shared/components'
const BREAKPOINTS = {
  0: {
    slidesPerView: 1.2,
    spaceBetween: 12,
  },
  480: {
    slidesPerView: 2,
    spaceBetween: 16,
  },
  768: {
    slidesPerView: 3,
    spaceBetween: 20,
  },
  1024: {
    slidesPerView: 4,
    spaceBetween: 20,
  },
}
// why: match the four visible slides at the widest Swiper breakpoint.
const RELATED_PRODUCT_SKELETON_COUNT = 4

export function ProductRelatedSkeleton() {
  return (
    <section className="product-related">
      <h2 className="product-related__title">Product Related</h2>
      <div
        className="product-related__skeleton"
        role="status"
        aria-busy="true"
        aria-label="Related products loading"
      >
        {Array.from({ length: RELATED_PRODUCT_SKELETON_COUNT }, (_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </section>
  )
}

export default function ProductRelated({ productId }) {
  const sectionRef = useRef(null)
  const [swiper, setSwiper] = useState(null)
  const {
    data: products,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useRelatedProducts(productId)
  const { data: wishlistIds = [] } = useWishlistIds(
    products?.map((product) => product.id) ?? [],
  )
  useRelatedGsap(sectionRef, productId, !isLoading && !!products?.length)
  if (isLoading) return <ProductRelatedSkeleton />
  if (isError && !products?.length) {
    return (
      <section className="product-related" role="alert">
        <h2 className="product-related__title">Product Related</h2>
        <p>Could not load related products.</p>
        <RetryButton onClick={() => refetch()} loading={isFetching} />
      </section>
    )
  }
  if (!products?.length) return null
  return (
    <section ref={sectionRef} className="product-related">
      <h2 className="product-related__title">Product Related</h2>
      {isError && (
        <div role="alert">
          <p>Could not refresh related products.</p>
          <RetryButton onClick={() => refetch()} loading={isFetching} />
        </div>
      )}
      <div className="product-related__carousel">
        <Swiper
          breakpoints={BREAKPOINTS}
          className="product-related__swiper"
          onSwiper={setSwiper}
          speed={650}
        >
          {products.map((product) => (
            <SwiperSlide key={product.id}>
              <ProductCard
                product={product}
                isWishlisted={wishlistIds.includes(product.id)}
              />
            </SwiperSlide>
          ))}
        </Swiper>
        <CarouselControls swiper={swiper} variant="outside" />
      </div>
    </section>
  )
}
