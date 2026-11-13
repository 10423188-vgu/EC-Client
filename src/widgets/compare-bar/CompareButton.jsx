import './CompareButton.css'
import { FaExchangeAlt } from 'react-icons/fa'
export function CompareButton({ onClick, disabled, label = 'Compare Now' }) {
  return (
    <button
      type="button"
      className={`compare-button${disabled ? ' compare-button--disabled' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="compare-button__decor" />
      <div className="compare-button__content">
        <span className="compare-button__icon">
          <FaExchangeAlt size={15} />
        </span>
        <span className="compare-button__text">{label}</span>
      </div>
    </button>
  )
}
