import { Link } from 'react-router-dom'
import { formatLib } from '../../../shared/utils'
import './WishlistProductCard.css'

export function WishlistProductCard({ product, action }) {
  const price = product.salePrice ?? product.price
  const onSale = product.salePrice != null && product.salePrice < product.price
  return (
    <article className="wishlist-product-card">
      <Link
        to={`/products/${product.id}`}
        className="wishlist-product-card__image-link"
      >
        {product.image?.url && (
          <img
            src={product.image.url}
            className="wishlist-product-card__image"
            alt={product.name}
            loading="lazy"
          />
        )}
      </Link>

      <div className="wishlist-product-card__info">
        <Link
          to={`/products/${product.id}`}
          className="wishlist-product-card__name"
        >
          {product.name}
        </Link>
        <div className="wishlist-product-card__prices">
          {onSale && (
            <span className="wishlist-product-card__original">
              {formatLib.vnd(product.price)}
            </span>
          )}
          <span
            className={`wishlist-product-card__price${onSale ? ' wishlist-product-card__price--on-sale' : ''}`}
          >
            {price == null ? 'Unavailable' : formatLib.vnd(price)}
          </span>
        </div>
      </div>

      {action}
    </article>
  )
}
