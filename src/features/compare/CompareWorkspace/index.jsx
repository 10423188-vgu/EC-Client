import './CompareWorkspace.css'
import { Link } from 'react-router-dom'
import { FaTimes } from 'react-icons/fa'
import { useCompareStore, useProduct } from '../../../entities/product'
import { formatLib } from '../../../shared/utils'
import { ArrowTextLink, RetryButton } from '../../../shared/components'
const STAR_INDICES = [0, 1, 2, 3, 4]
function CompareColumn({ item, onRemove }) {
  const {
    data: product,
    isLoading,
    isError,
    isFetching,
    error,
    refetch,
  } = useProduct(item.id)
  const rating = product?.rating ?? 0
  const description = product?.description ?? ''
  const imageUrl = item.imageUrl || product?.images?.[0]?.url
  const variant = product?.variants?.[0]
  const price = variant ? Number(variant.price) : item.price
  const salePrice =
    variant?.salePrice != null ? Number(variant.salePrice) : null
  return (
    <div className="compare-column">
      <button
        className="compare-column__remove"
        onClick={onRemove}
        aria-label="Remove"
      >
        <FaTimes />
      </button>

      <div className="compare-column__image-frame">
        {isLoading ? (
          <div className="compare-column__image-skeleton" />
        ) : (
          <img
            src={imageUrl}
            alt={item.name}
            className="compare-column__image"
          />
        )}
      </div>

      <div className="compare-column__body">
        {isError && !product && (
          <div className="compare-column__error" role="alert">
            <p>
              {error?.response?.status === 404
                ? 'Product unavailable.'
                : 'Could not load product details.'}
            </p>
            {error?.response?.status !== 404 && (
              <RetryButton onClick={() => refetch()} loading={isFetching} />
            )}
          </div>
        )}
        <Link to={`/products/${item.id}`} className="compare-column__name">
          {item.name}
        </Link>

        <div className="compare-column__stars">
          {STAR_INDICES.map((i) => (
            <span
              key={i}
              className={`compare-column__star${i < rating ? ' compare-column__star--active' : ''}`}
            >
              ★
            </span>
          ))}
        </div>

        <div className="compare-column__prices">
          {salePrice != null ? (
            <>
              <span className="compare-column__price compare-column__price--original">
                {formatLib.vnd(price)}
              </span>
              <span className="compare-column__price compare-column__price--on-sale">
                {formatLib.vnd(salePrice)}
              </span>
            </>
          ) : (
            <span className="compare-column__price">
              {formatLib.vnd(price)}
            </span>
          )}
        </div>

        {description && (
          <p className="compare-column__description">{description}</p>
        )}

        <ArrowTextLink to={`/products/${item.id}`}>View Details</ArrowTextLink>
      </div>
    </div>
  )
}
export default function CompareWorkspace() {
  const items = useCompareStore((s) => s.items)
  const remove = useCompareStore((s) => s.remove)
  if (items.length === 0) {
    return (
      <main className="compare">
        <div className="compare-empty">
          <p>No products selected for comparison</p>
          <ArrowTextLink to="/products" className="compare-empty__link">
            Browse Products
          </ArrowTextLink>
        </div>
      </main>
    )
  }
  return (
    <main className="compare">
      <ArrowTextLink to="/products" direction="left" className="compare-back">
        Back to Products
      </ArrowTextLink>

      <div
        className="compare-grid"
        style={{
          '--col-count': items.length,
        }}
      >
        {items.map((item) => (
          <CompareColumn
            key={item.id}
            item={item}
            onRemove={() => remove(item.id)}
          />
        ))}
      </div>
    </main>
  )
}
