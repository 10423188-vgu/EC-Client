import { SelectField } from '../../../shared/components'
import { COUPON_TYPE_LABELS } from './couponDisplay'

export default function CouponDetailsFields({ form, change, editing, coupon }) {
  const minimumOrderField = (
    <label>
      Minimum order (₫)
      <input
        type="number"
        value={form.minOrderAmount}
        onChange={(event) => change('minOrderAmount', event.target.value)}
        min="0.01"
        step="0.01"
        placeholder="No minimum"
      />
    </label>
  )

  return (
    <>
      <div className="coupons-workspace__form-grid">
        <label>
          Code
          <input
            type="text"
            value={form.code}
            onChange={(event) =>
              change('code', event.target.value.toUpperCase())
            }
            maxLength={50}
            placeholder="DEMO10"
            readOnly={editing}
            required
          />
        </label>
        <label>
          Name
          <input
            type="text"
            value={form.name}
            onChange={(event) => change('name', event.target.value)}
            minLength={2}
            maxLength={100}
            placeholder="Demo discount"
            required
          />
        </label>
      </div>
      <label>
        Description
        <textarea
          value={form.description}
          onChange={(event) => change('description', event.target.value)}
          maxLength={500}
          rows={2}
          placeholder="Optional internal description"
        />
      </label>
      <div className="coupons-workspace__form-grid">
        <label>
          Discount type
          <SelectField
            value={form.type}
            onChange={(event) => change('type', event.target.value)}
            disabled={editing}
          >
            {Object.entries(COUPON_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </SelectField>
        </label>
        {form.type !== 'FREE_SHIPPING' && (
          <label>
            {form.type === 'PERCENTAGE' ? 'Discount (%)' : 'Discount (₫)'}
            <input
              type="number"
              value={form.value}
              onChange={(event) => change('value', event.target.value)}
              min="0.01"
              max={form.type === 'PERCENTAGE' ? 100 : undefined}
              step="0.01"
              required
            />
          </label>
        )}
        {form.type === 'FREE_SHIPPING' && minimumOrderField}
      </div>
      {editing && coupon.scope !== 'ALL' && (
        <p className="coupons-workspace__form-note">
          This code applies to {coupon.scope.toLowerCase()} items. Its scope and
          type cannot be changed.
        </p>
      )}
      {form.type !== 'FREE_SHIPPING' && (
        <div className="coupons-workspace__form-grid">
          {form.type === 'PERCENTAGE' && (
            <label>
              Maximum discount (₫)
              <input
                type="number"
                value={form.maxDiscount}
                onChange={(event) => change('maxDiscount', event.target.value)}
                min="0.01"
                step="0.01"
                placeholder="No maximum"
              />
            </label>
          )}
          {minimumOrderField}
        </div>
      )}
    </>
  )
}
