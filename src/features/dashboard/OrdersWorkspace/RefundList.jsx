import { formatLib } from '../../../shared/utils'
import { formatDateTime, formatStatus } from './orderDetails.utils'

export default function RefundList({ refunds }) {
  if (!refunds?.length) return null

  return (
    <div className="order-details__refunds">
      {refunds.map((refund) => (
        <article key={refund.id}>
          <header>
            <strong>{formatLib.vnd(refund.amount)}</strong>
            <span>{formatStatus(refund.status)}</span>
          </header>
          <p>{refund.reason}</p>
          <small>
            {refund.transactionId} ·{' '}
            {refund.approvedByUser?.name ?? refund.approvedBy.slice(0, 8)} ·{' '}
            {formatDateTime(refund.processedAt)}
          </small>
        </article>
      ))}
    </div>
  )
}
