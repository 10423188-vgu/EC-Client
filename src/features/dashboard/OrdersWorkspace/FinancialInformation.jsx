import { formatLib } from '../../../shared/utils'
import RefundList from './RefundList'
import { formatDateTime, formatStatus } from './orderDetails.utils'

export default function FinancialInformation({ order }) {
  const payment = order.payment

  return (
    <section className="order-details__section">
      <header className="order-details__section-header">
        <h3>Financial information</h3>
        <span>{formatStatus(payment?.status)}</span>
      </header>
      <dl className="order-details__facts">
        <div>
          <dt>Subtotal</dt>
          <dd>{formatLib.vnd(order.subtotal)}</dd>
        </div>
        <div>
          <dt>Shipping fee</dt>
          <dd>{formatLib.vnd(order.shippingFee)}</dd>
        </div>
        <div>
          <dt>Coupon</dt>
          <dd>{order.couponCode ?? 'None'}</dd>
        </div>
        <div>
          <dt>Discount</dt>
          <dd>-{formatLib.vnd(order.discountAmount)}</dd>
        </div>
        <div className="order-details__total-row">
          <dt>Total</dt>
          <dd>{formatLib.vnd(order.total)}</dd>
        </div>
        <div>
          <dt>Payment amount</dt>
          <dd>{payment ? formatLib.vnd(payment.amount) : 'Not recorded'}</dd>
        </div>
        <div>
          <dt>Refunded amount</dt>
          <dd>{formatLib.vnd(payment?.refundedAmount ?? 0)}</dd>
        </div>
        <div>
          <dt>Transfer content</dt>
          <dd>{payment?.transferContent ?? 'Not recorded'}</dd>
        </div>
        <div>
          <dt>Paid at</dt>
          <dd>{formatDateTime(payment?.paidAt, 'Not paid')}</dd>
        </div>
        <div>
          <dt>Confirmed by</dt>
          <dd>
            {payment?.confirmedByUser
              ? `${payment.confirmedByUser.name} (${payment.confirmedByUser.role})`
              : payment?.confirmedBy
                ? `Admin ${payment.confirmedBy.slice(0, 8)}`
                : 'Not confirmed'}
          </dd>
        </div>
      </dl>
      <RefundList refunds={order.refunds} />
    </section>
  )
}
