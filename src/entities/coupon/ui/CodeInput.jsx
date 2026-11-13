import { useState } from 'react'
import { FaCheck } from 'react-icons/fa'
import { useShake } from '../../../shared/hooks/useShake'
import '../../../shared/styles/shake.css'
import '../../../shared/styles/spinner.css'
import './CodeInput.css'
export function CodeInput({
  icon: Icon,
  value,
  onChange,
  onSubmit,
  placeholder,
  ariaLabel,
  buttonLabel = 'Apply',
  loading = false,
  disabled = false,
  error,
}) {
  const { shake, trigger, onShakeEnd } = useShake()
  // why: adjust state during render (not an effect) when a new error comes in — the sanctioned
  // React pattern for "react to a prop change" without an extra render-then-effect round trip
  const [prevError, setPrevError] = useState(error)
  if (error !== prevError) {
    setPrevError(error)
    if (error) trigger()
  }
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onSubmit?.()
    }
  }
  return (
    <div className="code-input">
      <div
        className={`code-input__row${error ? ' code-input__row--error' : ''}${shake ? ' shake' : ''}`}
        onAnimationEnd={onShakeEnd}
      >
        {Icon && <Icon className="code-input__icon" aria-hidden="true" />}
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          className="code-input__field"
          onChange={onChange}
          onKeyDown={handleKeyDown}
          disabled={disabled || loading}
          aria-label={ariaLabel}
          aria-describedby={error ? 'code-input-error' : undefined}
        />
        <button
          type="button"
          className="code-input__submit-button"
          onClick={onSubmit}
          disabled={!value?.trim() || disabled || loading}
        >
          {loading ? (
            <span className="spinner" aria-hidden="true" />
          ) : (
            <>
              {buttonLabel}
              <FaCheck
                className="code-input__submit-button-icon"
                aria-hidden="true"
              />
            </>
          )}
        </button>
      </div>
      {error && (
        <span id="code-input-error" className="code-input__error" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}
