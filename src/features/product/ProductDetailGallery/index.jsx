import './ProductDetailGallery.css'
import 'swiper/css'
import 'swiper/css/free-mode'
import { useState, useRef, useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { FreeMode, Mousewheel } from 'swiper/modules'
import { CarouselControls } from '../../../shared/components'
export default function ProductDetailGallery({ images = [], selectedVariant }) {
  const list = selectedVariant?.images?.length ? selectedVariant.images : images
  const [activeIndex, setActiveIndex] = useState(0)
  const [direction, setDirection] = useState('initial')
  const prevIndexRef = useRef(0)
  const swiperRef = useRef(null)

  // why: resetting state during render avoids the double-render cycle useEffect would cause
  const [prevVariantId, setPrevVariantId] = useState(selectedVariant?.id)
  if (prevVariantId !== selectedVariant?.id) {
    setPrevVariantId(selectedVariant?.id)
    setDirection('idle')
    setActiveIndex(0)
  }

  // why: refs and Swiper's imperative API can't be driven during render, so useEffect is required here
  useEffect(() => {
    prevIndexRef.current = 0
    swiperRef.current?.slideTo(0)
  }, [selectedVariant?.id])
  useEffect(() => {
    swiperRef.current?.slideTo(activeIndex)
  }, [activeIndex])
  const handleThumbClick = (i) => {
    if (i === activeIndex) return
    setDirection(i > prevIndexRef.current ? 'scroll-down' : 'scroll-up')
    prevIndexRef.current = i
    setActiveIndex(i)
  }
  const handlePrev = () => handleThumbClick(activeIndex - 1)
  const handleNext = () => handleThumbClick(activeIndex + 1)
  if (!list.length) return null
  const safeIndex = activeIndex < list.length ? activeIndex : 0
  const activeImage = list[safeIndex]
  return (
    <div className="product-detail-gallery">
      <Swiper
        direction="vertical"
        slidesPerView="auto"
        freeMode={{
          enabled: true,
          momentum: true,
          momentumRatio: 0.5,
        }}
        mousewheel={{
          sensitivity: 1,
          forceToAxis: true,
        }}
        modules={[FreeMode, Mousewheel]}
        className="product-detail-gallery__thumbnails"
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        grabCursor
      >
        {list.map((img, i) => (
          <SwiperSlide
            key={img.id ?? i}
            className="product-detail-gallery__slide"
          >
            <button
              type="button"
              className={`product-detail-gallery__thumbnail${i === activeIndex ? ' product-detail-gallery__thumbnail--active' : ''}`}
              onClick={() => handleThumbClick(i)}
            >
              <img
                src={img.url}
                alt={img.altText ?? `View ${i + 1}`}
                draggable={false}
                className="product-detail-gallery__thumbnail-image"
              />
              <span className="product-detail-gallery__thumbnail-overlay" />
            </button>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="product-detail-gallery__image-primary">
        <img
          // why: key forces a remount on every index change so the slide animation
          // restarts even when direction repeats (an unchanged className wouldn't retrigger it)
          key={`${activeIndex}-${direction}`}
          src={activeImage.url}
          alt={activeImage.altText ?? 'Product image'}
          draggable={false}
          className={`product-detail-gallery__image-primary-view product-detail-gallery__image-primary-view--${direction}`}
        />
        <span className="product-detail-gallery__reveal" aria-hidden="true" />
        <CarouselControls
          variant="overlay"
          onPrevious={handlePrev}
          onNext={handleNext}
          previousDisabled={activeIndex === 0}
          nextDisabled={activeIndex === list.length - 1}
          previousLabel="Previous image"
          nextLabel="Next image"
        />
      </div>
    </div>
  )
}
