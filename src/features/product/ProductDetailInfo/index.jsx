import './ProductDetailInfo.css'
import { useState } from 'react'
import { FaChevronDown, FaExternalLinkAlt } from 'react-icons/fa'
import { formatLib } from '../../../shared/utils'
export default function ProductDetailInfo({ product, selectedVariant }) {
  const [moreOpen, setMoreOpen] = useState(false)
  if (!product) return null
  const {
    name,
    description,
    category,
    brand,
    attributes = [],
    tags = [],
  } = product
  const price = selectedVariant ? Number(selectedVariant.price) : null
  const salePrice =
    selectedVariant?.salePrice != null
      ? Number(selectedVariant.salePrice)
      : null
  const hasMore = description || attributes.length > 0 || tags.length > 0
  return (
    <div className="product-detail-info">
      {(category || brand) && (
        <div className="product-detail-info__meta">
          {category && (
            <span className="product-detail-info__category">
              {category.name}
            </span>
          )}
          {brand && <span className="product-detail-info__separator">·</span>}
          {brand && (
            <span className="product-detail-info__brand">{brand.name}</span>
          )}
        </div>
      )}

      <h1 className="product-detail-info__name">{name}</h1>

      <div className="product-detail-info__price-group">
        {price != null ? (
          salePrice != null ? (
            <>
              <span className="product-detail-info__price product-detail-info__price--original">
                {formatLib.vnd(price)}
              </span>
              <span className="product-detail-info__price product-detail-info__price--on-sale">
                {formatLib.vnd(salePrice)}
              </span>
            </>
          ) : (
            <span className="product-detail-info__price">
              {formatLib.vnd(price)}
            </span>
          )
        ) : (
          <span className="product-detail-info__price-hint">
            Select a variant
          </span>
        )}
      </div>

      {hasMore && (
        <div className="product-detail-info__details">
          <button
            type="button"
            className={`product-detail-info__details-toggle${moreOpen ? ' product-detail-info__details-toggle--open' : ''}`}
            onClick={() => setMoreOpen((o) => !o)}
          >
            <span>More information</span>
            <FaChevronDown
              size={11}
              className="product-detail-info__details-toggle-icon"
            />
          </button>

          <div
            className={`product-detail-info__details-body${moreOpen ? ' product-detail-info__details-body--open' : ''}`}
          >
            {description && (
              <p className="product-detail-info__description">{description}</p>
            )}

            {attributes.length > 0 && (
              <ul className="product-detail-info__attributes">
                {attributes.map((attr) => (
                  <li key={attr.key} className="product-detail-info__attribute">
                    <span className="product-detail-info__attribute-key">
                      {attr.key}
                    </span>
                    <span className="product-detail-info__attribute-value">
                      {attr.value}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {tags.length > 0 && (
              <div className="product-detail-info__tags">
                {tags.map((tag) => (
                  <span key={tag} className="product-detail-info__tag">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
