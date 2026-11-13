// why: PENDING and AWAITING_PAYMENT are two distinct backend OrderStatus values
// (see server/prisma/schema.prisma) that this UI intentionally renders identically.
export const ORDER_STATUS_LABELS = {
  PENDING: { label: 'Awaiting payment', tone: 'warning' },
  AWAITING_PAYMENT: { label: 'Awaiting payment', tone: 'warning' },
  PAID: { label: 'Paid', tone: 'info' },
  PROCESSING: { label: 'Processing', tone: 'info' },
  SHIPPED: { label: 'Shipped', tone: 'primary' },
  OUT_FOR_DELIVERY: { label: 'Out for delivery', tone: 'primary' },
  DELIVERED: { label: 'Delivered', tone: 'success' },
  CANCELLED: { label: 'Cancelled', tone: 'danger' },
  REFUNDED: { label: 'Refunded', tone: 'neutral' },
}

export const CANCELLABLE_ORDER_STATUSES = ['AWAITING_PAYMENT']

export const CHECKOUT_STEPS = ['Cart', 'Checkout', 'Payment']
