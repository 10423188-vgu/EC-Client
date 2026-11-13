import '../../styles/shake.css'
import './QuantityStepper.css'
import { FaMinus, FaPlus } from 'react-icons/fa'
export function QuantityStepper({
  value,
  onDecrement,
  onIncrement,
  decrementDisabled = false,
  incrementDisabled = false,
  size = 'sm',
  editable = false,
  inputProps,
  shake = false,
  onShakeEnd,
}) {
  const iconSize = size === 'lg' ? 9 : 8
  return (
    <div
      className={`quantity-stepper quantity-stepper--${size}${shake ? ' shake' : ''}`}
      onAnimationEnd={onShakeEnd}
    >
      <button
        type="button"
        className="quantity-stepper__button"
        onClick={onDecrement}
        disabled={decrementDisabled}
      >
        <FaMinus size={iconSize} />
      </button>

      {editable ? (
        <input
          type="text"
          inputMode="numeric"
          className="quantity-stepper__input"
          {...inputProps}
        />
      ) : (
        <span className="quantity-stepper__value">{value}</span>
      )}

      <button
        type="button"
        className="quantity-stepper__button"
        onClick={onIncrement}
        disabled={incrementDisabled}
      >
        <FaPlus size={iconSize} />
      </button>
    </div>
  )
}
