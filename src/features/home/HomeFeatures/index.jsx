import './HomeFeatures.css'
import { useRef } from 'react'
import { ProductCardSkeleton } from '../../../entities/product'
import { useWishlistIds } from '../../../entities/wishlist'
import useFeaturesGsap from '../animations/features.gsap'
import { RetryButton } from '../../../shared/components'
import { HOME_FEATURED_PRODUCT_LIMIT } from '../constants'

export default function HomeFeatures({ featuredProductsQuery, renderProduct }) {
  const featuresRef = useRef(null)
  const { data, isLoading, isError, isFetching, refetch } =
    featuredProductsQuery
  const products = data?.products ?? []
  const { data: wishlistIds = [] } = useWishlistIds(
    products.map((product) => product.id),
  )
  useFeaturesGsap({
    featuresRef,
    ready: !isLoading && products.length > 0,
  })
  return (
    <section ref={featuresRef} className="home-features">
      <div className="home-features__header">
        <span className="home-features__eyebrow">Limited Time Offers</span>
        <h2 className="home-features__title">
          Best Deals &amp; Shocking Discounts
        </h2>
        <p className="home-features__lead">
          Grab the hottest products at unbeatable prices. These exclusive
          discounts won&apos;t last — shop now before they&apos;re gone.
        </p>
      </div>

      {isError && data && (
        <div className="home-features__refresh-error" role="alert">
          <p>Couldn&apos;t refresh featured products. Showing current deals.</p>
          <RetryButton
            label="Try again"
            onClick={() => refetch()}
            loading={isFetching}
          />
        </div>
      )}
      {isError && !data ? (
        <div className="home-features__error" role="alert">
          <h3>Featured deals unavailable</h3>
          <p>We couldn&apos;t load these products. Please try again.</p>
          <RetryButton
            label="Try again"
            onClick={() => refetch()}
            loading={isFetching}
          />
        </div>
      ) : isLoading ? (
        <div
          className="home-features__scene"
          style={{ '--n': HOME_FEATURED_PRODUCT_LIMIT }}
          role="status"
          aria-busy="true"
          aria-label="Featured products loading"
        >
          <div className="home-features__ring home-features__ring--skeleton">
            {Array.from({ length: HOME_FEATURED_PRODUCT_LIMIT }, (_, index) => (
              <div
                key={index}
                className="home-features__ring-card"
                style={{ '--i': index }}
              >
                <ProductCardSkeleton showSaleBadge />
              </div>
            ))}
          </div>
        </div>
      ) : products.length >= 4 ? (
        <div
          className="home-features__scene"
          style={{ '--n': products.length }}
          role="region"
          aria-roledescription="carousel"
          aria-label="Featured deals"
        >
          <div className="home-features__ring">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="home-features__ring-card"
                style={{ '--i': index }}
                role="group"
                aria-roledescription="slide"
                aria-label={`${product.name}, ${index + 1} of ${products.length}`}
              >
                {renderProduct(product, wishlistIds.includes(product.id))}
              </div>
            ))}
          </div>
        </div>
      ) : products.length > 0 ? (
        <div className="home-features__few-products">
          {products.map((product) => (
            <div key={product.id} className="home-features__few-product">
              {renderProduct(product, wishlistIds.includes(product.id))}
            </div>
          ))}
        </div>
      ) : (
        <div className="home-features__empty">
          No featured deals are available right now.
        </div>
      )}
    </section>
  )
}
