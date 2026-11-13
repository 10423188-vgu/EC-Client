import './HomeIntro.css'
import '../../../shared/styles/skeleton.css'
import { useRef } from 'react'
import Marquee from './Marquee.jsx'
import useIntroGsap from '../animations/intro.gsap'
import { ArrowTextLink, RetryButton } from '../../../shared/components'

// why: the home gallery shows up to five categories; the link below exposes the rest.
const CATEGORY_SKELETON_COUNT = 5

// why: the intro hook controls a small playback window; posters keep cards visual for reduced-motion users.
const HomeCategory = ({ item }) => (
  <div className="home-intro__card">
    {item.videoUrl ? (
      <video
        className="home-intro__video"
        poster={item.imageUrl || undefined}
        preload="none"
        muted
        loop
        playsInline
        aria-hidden="true"
      >
        <source src={item.videoUrl} />
      </video>
    ) : item.imageUrl ? (
      <img
        className="home-intro__image"
        src={item.imageUrl}
        alt=""
        aria-hidden="true"
        loading="lazy"
      />
    ) : null}
  </div>
)

// why: categoriesQuery received as prop — data fetching is lifted to page level so both queries run in parallel, not in a waterfall
export default function HomeIntro({ categoriesQuery }) {
  const wrapperRef = useRef(null)
  const cardsRef = useRef(null)
  const trackRef = useRef(null)
  const listRef = useRef(null)
  // why: ref (not state) exposes the navigate fn to the accordion items without triggering re-renders
  const scrollToCardRef = useRef(null)
  const {
    data: categories = [],
    isLoading,
    isError,
    isFetching,
    refetch,
  } = categoriesQuery
  const ready = !isLoading && categories.length > 0
  // why: categoriesKey triggers animation rebuild when category IDs or order changes after a background refetch
  const categoriesKey = categories.map((c) => c.id).join(',')
  useIntroGsap({
    wrapperRef,
    cardsRef,
    trackRef,
    listRef,
    ready,
    scrollToCardRef,
    categoriesKey,
  })
  return (
    <section
      ref={wrapperRef}
      className="home-intro"
      role={isLoading ? 'status' : undefined}
      aria-busy={isLoading}
      aria-label={isLoading ? 'Categories loading' : undefined}
    >
      <div className="home-intro__layout">
        <div ref={cardsRef} className="home-intro__cards">
          {isError && !categories.length ? (
            <div className="home-intro__error" role="alert">
              <h3>Categories unavailable</h3>
              <p>We couldn&apos;t load the collections. Please try again.</p>
              <RetryButton
                label="Try again"
                onClick={() => refetch()}
                loading={isFetching}
              />
            </div>
          ) : isLoading ? (
            <div
              ref={trackRef}
              className="home-intro__track"
              aria-hidden="true"
            >
              {Array.from({ length: CATEGORY_SKELETON_COUNT }, (_, i) => (
                <div
                  key={i}
                  className="home-intro__placeholder skeleton skeleton--light"
                />
              ))}
            </div>
          ) : categories.length ? (
            <div ref={trackRef} className="home-intro__track">
              {categories.map((item) => (
                <HomeCategory key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="home-intro__empty">
              No categories are available right now.
            </div>
          )}
        </div>

        <div ref={listRef} className="home-intro__list">
          <h2 className="home-intro__title">
            <span>Shop by </span>
            <span className="home-intro__title-accent">Category</span>
          </h2>
          {isError && categories.length > 0 && (
            <div className="home-intro__refresh-error" role="alert">
              <p>Couldn&apos;t refresh categories. Showing the current list.</p>
              <RetryButton
                label="Try again"
                onClick={() => refetch()}
                loading={isFetching}
              />
            </div>
          )}

          <div className="home-intro__accordion" aria-hidden={isLoading}>
            {isLoading &&
              Array.from({ length: CATEGORY_SKELETON_COUNT }, (_, i) => (
                <div
                  key={i}
                  className={`home-intro__accordion-item home-intro__accordion-item--skeleton${i === 0 ? ' home-intro__accordion-item--active' : ''}`}
                >
                  <span className="home-intro__accordion-header">
                    <span className="skeleton skeleton--light home-intro__skeleton-category-name" />
                    <span className="skeleton skeleton--light home-intro__skeleton-category-icon" />
                  </span>
                  {i === 0 && (
                    <span className="home-intro__accordion-body">
                      <span className="home-intro__accordion-description">
                        <span className="skeleton skeleton--light home-intro__skeleton-category-description" />
                      </span>
                    </span>
                  )}
                </div>
              ))}
            {!isLoading &&
              categories.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  data-index={i}
                  className={`home-intro__accordion-item${i === 0 ? ' home-intro__accordion-item--active' : ''}`}
                  onClick={() => scrollToCardRef.current?.(i)}
                >
                  <span className="home-intro__accordion-header">
                    <span className="home-intro__accordion-name">
                      {item.name}
                    </span>
                    <span
                      className="home-intro__accordion-icon"
                      aria-hidden="true"
                    />
                  </span>
                  <span className="home-intro__accordion-body">
                    <span className="home-intro__accordion-description">
                      {item.description || 'Explore this collection.'}
                    </span>
                  </span>
                </button>
              ))}
          </div>

          <ArrowTextLink to="/products" className="home-intro__all-link">
            View all categories
          </ArrowTextLink>

          <div className="home-intro__logo">
            <svg
              viewBox="0 0 24 24"
              className="home-intro__logo-mark"
              aria-hidden="true"
            >
              <path d="M12 2 L13.6 10.4 L22 12 L13.6 13.6 L12 22 L10.4 13.6 L2 12 L10.4 10.4 Z" />
            </svg>
            <span className="home-intro__logo-text">LOREM</span>
          </div>
        </div>
      </div>

      <Marquee className="home-intro__marquee" />
    </section>
  )
}
