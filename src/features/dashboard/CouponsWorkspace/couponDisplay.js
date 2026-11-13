import { formatLib } from '../../../shared/utils'

export const COUPON_TYPE_LABELS = {
  PERCENTAGE: 'Percentage',
  FIXED_AMOUNT: 'Fixed amount',
  FREE_SHIPPING: 'Free shipping',
}

export const formatCouponValue = (coupon) => {
  if (coupon.type === 'FREE_SHIPPING') return 'Free shipping'
  if (coupon.type === 'PERCENTAGE') return `${Number(coupon.value)}% off`
  return `${formatLib.vnd(coupon.value)} off`
}

export const getCouponStatus = (coupon) => {
  if (!coupon.isActive) return { label: 'Inactive', tone: 'neutral' }
  const now = Date.now()
  if (coupon.startsAt && Date.parse(coupon.startsAt) > now) {
    return { label: 'Scheduled', tone: 'info' }
  }
  if (coupon.expiresAt && Date.parse(coupon.expiresAt) < now) {
    return { label: 'Expired', tone: 'danger' }
  }
  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
    return { label: 'Exhausted', tone: 'warning' }
  }
  return { label: 'Active', tone: 'success' }
}
