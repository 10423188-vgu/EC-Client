import { useRef } from 'react'
import { FaCalendarAlt } from 'react-icons/fa'

export default function CouponDateRangeFields({
  startsAt,
  expiresAt,
  onChange,
}) {
  const startsAtRef = useRef(null)
  const expiresAtRef = useRef(null)
  const openDatePicker = (ref) => {
    const input = ref.current
    if (input?.showPicker) input.showPicker()
    else input?.focus()
  }

  return (
    <fieldset className="coupons-workspace__date-range">
      <legend>Coupon availability dates</legend>
      <label className="coupons-workspace__date-field">
        <span>From</span>
        <input
          ref={startsAtRef}
          type="date"
          value={startsAt.slice(0, 10)}
          onChange={(event) =>
            onChange(
              'startsAt',
              event.target.value ? `${event.target.value}T00:00` : '',
            )
          }
          aria-label="Coupon start date"
        />
        <button
          type="button"
          className="coupons-workspace__date-icon"
          onClick={() => openDatePicker(startsAtRef)}
          aria-label="Choose coupon start date"
        >
          <FaCalendarAlt aria-hidden="true" />
        </button>
      </label>
      <span className="coupons-workspace__date-separator" aria-hidden="true">
        to
      </span>
      <label className="coupons-workspace__date-field">
        <span>To</span>
        <input
          ref={expiresAtRef}
          type="date"
          value={expiresAt.slice(0, 10)}
          onChange={(event) =>
            onChange(
              'expiresAt',
              event.target.value ? `${event.target.value}T23:59:59.999` : '',
            )
          }
          aria-label="Coupon expiry date"
        />
        <button
          type="button"
          className="coupons-workspace__date-icon"
          onClick={() => openDatePicker(expiresAtRef)}
          aria-label="Choose coupon expiry date"
        >
          <FaCalendarAlt aria-hidden="true" />
        </button>
      </label>
    </fieldset>
  )
}
