import './AddToCartButton.css'
import { FaShoppingCart, FaTshirt } from 'react-icons/fa'
export function AddToCartButton({ fullWidth, disabled, onClick }) {
  return (
    <button
      type="button"
      className={`add-to-cart-button${fullWidth ? ' add-to-cart-button--full-width' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="add-to-cart-button__icon-group">
        <FaShoppingCart size={14} className="add-to-cart-button__icon" />
        <FaTshirt size={12} className="add-to-cart-button__animated-icon" />
      </span>
      Add to Cart
    </button>
  )
}
