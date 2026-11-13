import { useState } from 'react'
import { FaTag, FaTimes } from 'react-icons/fa'
import { CodeInput } from './CodeInput.jsx'
import { useValidateCoupon } from '../api/coupon.mutations.js'
import './CouponInput.css'
const TYPE_LABELS = {
  PERCENTAGE: (v) => `${v}% off`,
  FIXED_AMOUNT: (v) => `${v.toLocaleString('vi-VN')}₫ off`,
  FREE_SHIPPING: () => 'Free shipping',
}
export const CouponInput = ({ onApply, onRemove, appliedCoupon }) => {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const { mutate: validate, isPending } = useValidateCoupon()
  const handleApply = () => {
    const trimmed = code.trim().toUpperCase()
    if (!trimmed) return
    setError('')
    validate(trimmed, {
      onSuccess: (result) => {
        onApply?.(result)
        setCode('')
      },
      onError: (err) => {
        const msg = err.response?.data?.message ?? 'Invalid coupon code'
        setError(msg)
      },
    })
  }
  if (appliedCoupon) {
    const labelFn = TYPE_LABELS[appliedCoupon.coupon.type] ?? (() => 'Applied')
    return (
      <div className="coupon-input coupon-input--applied">
        <FaTag className="coupon-input__icon" />
        <div className="coupon-input__applied-info">
          <span className="coupon-input__code">
            {appliedCoupon.coupon.code}
          </span>
          <span className="coupon-input__label">
            {labelFn(appliedCoupon.coupon.value)}
          </span>
          <span className="coupon-input__saving">
            You saved{' '}
            {appliedCoupon.discountAmount.toLocaleString('vi-VN', {
              style: 'currency',
              currency: 'VND',
            })}
          </span>
        </div>
        <button
          type="button"
          className="coupon-input__remove-button"
          onClick={onRemove}
          aria-label="Remove coupon"
        >
          <FaTimes />
        </button>
      </div>
    )
  }
  return (
    <CodeInput
      icon={FaTag}
      value={code}
      placeholder="Enter discount code"
      ariaLabel="Discount code"
      buttonLabel="Apply"
      error={error}
      onChange={(e) => {
        setCode(e.target.value.toUpperCase())
        setError('')
      }}
      onSubmit={handleApply}
      loading={isPending}
    />
  )
}
