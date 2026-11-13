import './BuyButton.css'
import { FaBolt } from 'react-icons/fa'
export function BuyButton({ disabled, onClick }) {
  return (
    <button
      type="button"
      className="buy-button"
      onClick={onClick}
      disabled={disabled}
    >
      Buy Product
      <span className="buy-button__icon">
        <FaBolt size={12} className="buy-button__icon-bolt" />
      </span>
    </button>
  )
}
