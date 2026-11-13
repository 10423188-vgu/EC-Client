import { useState } from 'react'
import { useShake } from '../../hooks/useShake'

// why: shared draft/focus state machine behind every editable QuantityStepper —
// caller owns clamping/dedup/fallback via onCommit since that varies (cart items
// clamp to stock and skip no-op writes, product-page qty resets to 1 on invalid input).
// onCommit returns true when the typed value got capped, which triggers the shake.
export function useQuantityInput(value, onCommit) {
  const [draft, setDraft] = useState(String(value))
  const [isFocused, setIsFocused] = useState(false)
  const { shake, trigger, onShakeEnd } = useShake()

  const handleChange = (e) => {
    const val = e.target.value
    if (val === '' || /^\d+$/.test(val)) setDraft(val)
  }

  const handleFocus = () => {
    setDraft(String(value))
    setIsFocused(true)
  }

  const handleBlur = () => {
    setIsFocused(false)
    if (onCommit(parseInt(draft, 10))) trigger()
  }

  return {
    shake,
    onShakeEnd,
    inputProps: {
      value: isFocused ? draft : String(value),
      onChange: handleChange,
      onFocus: handleFocus,
      onBlur: handleBlur,
      onKeyDown: (e) => e.key === 'Enter' && e.target.blur(),
    },
  }
}
