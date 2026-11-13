import './ProductDetailSkeleton.css'
import '../../../shared/styles/skeleton.css'
// why: match the five visible thumbnail slots in ProductDetailGallery.css.
const THUMBNAIL_SKELETON_COUNT = 5
// why: show three representative variant options while product data is unknown.
const VARIANT_SKELETON_COUNT = 3
export function ProductDetailSkeleton() {
  return (
    <section
      className="product-detail-skeleton"
      role="status"
      aria-busy="true"
      aria-label="Product details loading"
    >
      <div className="product-detail-skeleton__breadcrumb skeleton" />

      <div className="product-detail__layout">
        <div className="product-detail__gallery-column">
          <div className="product-detail-skeleton__gallery">
            <div className="product-detail-skeleton__thumbnails">
              {Array.from({ length: THUMBNAIL_SKELETON_COUNT }, (_, i) => (
                <div
                  key={i}
                  className={`product-detail-skeleton__thumbnail skeleton${i === 0 ? ' product-detail-skeleton__thumbnail--active' : ''}`}
                />
              ))}
            </div>
            <div className="product-detail-skeleton__image-primary skeleton" />
          </div>
        </div>

        <div className="product-detail__info-column">
          <div className="product-detail-skeleton__info">
            <div className="product-detail-skeleton__meta skeleton" />
            <div className="product-detail-skeleton__name skeleton" />
            <div className="product-detail-skeleton__price skeleton" />
            <div className="product-detail-skeleton__details">
              <div className="product-detail-skeleton__details-toggle skeleton" />
            </div>
          </div>

          <div className="product-detail__divider" />

          <div className="product-detail-skeleton__actions">
            <div className="product-detail-skeleton__section">
              <div className="product-detail-skeleton__field-header">
                <div className="product-detail-skeleton__label skeleton" />
                <div className="product-detail-skeleton__label-value skeleton" />
              </div>
              <div className="product-detail-skeleton__variant-grid">
                {Array.from({ length: VARIANT_SKELETON_COUNT }, (_, i) => (
                  <div
                    key={i}
                    className="product-detail-skeleton__variant skeleton"
                  />
                ))}
              </div>
            </div>

            <div className="product-detail-skeleton__section">
              <div className="product-detail-skeleton__field-header">
                <div className="product-detail-skeleton__label skeleton" />
                <div className="product-detail-skeleton__stock skeleton" />
              </div>
              <div className="product-detail-skeleton__quantity skeleton" />
            </div>

            <div className="product-detail-skeleton__buttons">
              <div className="product-detail-skeleton__button skeleton" />
              <div className="product-detail-skeleton__button skeleton" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
