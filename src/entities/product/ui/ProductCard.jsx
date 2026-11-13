import './ProductCard.css'
import { FaHeart, FaExchangeAlt } from 'react-icons/fa'
import {
  AddToCartButton,
  ArrowTextLink,
  Tooltip,
} from '../../../shared/components'
import { formatLib } from '../../../shared/utils'
const STAR_INDICES = [0, 1, 2, 3, 4]
export function ProductCard({
  product,
  isWishlisted,
  isInCompare,
  addingToCart,
  onWishlist,
  onCompare,
  onAddToCart,
}) {
  const { id, name, description, images, variants, rating = 0 } = product
  const variant = variants?.[0]
  const price = variant?.price != null ? Number(variant.price) : null
  const salePrice =
    variant?.salePrice != null ? Number(variant.salePrice) : null
  const discount =
    price != null && salePrice != null
      ? Math.round(((price - salePrice) / price) * 100)
      : null
  const imageUrl = images?.[0]?.url ?? variant?.images?.[0]?.url
  return (
    <article className="product-card">
      {discount > 0 && <div className="product-card__badge">-{discount}%</div>}

      <div className="product-card__media">
        <div className="product-card__image-frame">
          <img
            src={imageUrl}
            alt={name}
            className="product-card__image"
            loading="lazy"
          />
        </div>

        <div className="product-card__quick-actions">
          <Tooltip
            content={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            placement="left"
            wrapperClassName="product-card__quick-tooltip"
          >
            <button
              type="button"
              className={`product-card__quick-action${isWishlisted ? ' product-card__quick-action--active' : ''}`}
              onClick={onWishlist}
              aria-label={
                isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'
              }
            >
              <FaHeart />
            </button>
          </Tooltip>
          <Tooltip
            content={isInCompare ? 'Remove from compare' : 'Add to compare'}
            placement="left"
            wrapperClassName="product-card__quick-tooltip"
          >
            <button
              type="button"
              className={`product-card__quick-action${isInCompare ? ' product-card__quick-action--active product-card__quick-action--compare' : ''}`}
              onClick={onCompare}
              aria-label={
                isInCompare ? 'Remove from compare' : 'Add to compare'
              }
            >
              <FaExchangeAlt />
            </button>
          </Tooltip>
        </div>
      </div>

      <div className="product-card__body">
        <div>
          <h3 className="product-card__name">{name}</h3>
          <p className="product-card__description">{description}</p>
          <div className="product-card__stars">
            {STAR_INDICES.map((i) => (
              <span
                key={i}
                className={`product-card__star${i < rating ? ' product-card__star--active' : ''}`}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        <ArrowTextLink to={`/products/${id}`}>Details</ArrowTextLink>

        <div className="product-card__prices">
          {salePrice != null ? (
            <>
              <span className="product-card__price product-card__price--original">
                {formatLib.vnd(price)}
              </span>
              <span className="product-card__price product-card__price--on-sale">
                {formatLib.vnd(salePrice)}
              </span>
            </>
          ) : (
            <span className="product-card__price">{formatLib.vnd(price)}</span>
          )}
        </div>

        <AddToCartButton
          onClick={onAddToCart}
          disabled={!variant || addingToCart}
        />
      </div>
    </article>
  )
}
