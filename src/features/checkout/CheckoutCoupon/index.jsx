import CheckoutSection from '../CheckoutSection'
import { CouponInput } from '../../../entities/coupon'
export default function CheckoutCoupon({ appliedCoupon, onApply, onRemove }) {
  return (
    <CheckoutSection title="Discount Code">
      <CouponInput
        appliedCoupon={appliedCoupon}
        onApply={onApply}
        onRemove={onRemove}
      />
    </CheckoutSection>
  )
}
