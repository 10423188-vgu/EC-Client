import ReturnReview from './ReturnReview'
import { StatusBadge } from '../../../shared/components'
import { formatLib } from '../../../shared/utils'
import { formatDateTime, formatStatus } from './orderDetails.utils'

const RETURN_TONES = {
  REQUESTED: 'warning',
  INSPECTING: 'info',
  APPROVED: 'primary',
  REJECTED: 'danger',
  REFUNDED: 'success',
  NO_REFUND: 'neutral',
}

export default function ReturnRequestDetails({ request }) {
  return (
    <article className="order-details__return">
      <header className="order-details__return-header">
        <strong>Return request</strong>
        <StatusBadge
          size="compact"
          tone={RETURN_TONES[request.status] ?? 'neutral'}
        >
          {formatStatus(request.status)}
        </StatusBadge>
      </header>
      <p className="order-details__return-reason">{request.reason}</p>
      {request.customerNote && (
        <p className="order-details__return-note">{request.customerNote}</p>
      )}
      <ul className="order-details__return-items">
        {request.items.map((item) => (
          <li key={item.orderItemId}>
            <span>{item.orderItem?.productName ?? 'Item'}</span>
            <strong>× {item.quantity}</strong>
            {item.restockable && <small>Selected for restock</small>}
          </li>
        ))}
      </ul>
      {request.refundAmount !== null && (
        <p className="order-details__return-result">
          Approved refund: {formatLib.vnd(request.refundAmount)}
        </p>
      )}
      {!!request.evidenceImages?.length && (
        <div className="order-details__evidence">
          {request.evidenceImages.map((imageUrl) => (
            <a key={imageUrl} href={imageUrl} target="_blank" rel="noreferrer">
              <img src={imageUrl} alt="Return evidence" />
            </a>
          ))}
        </div>
      )}
      {request.inspectionResult && (
        <p className="order-details__return-result">
          Inspection: {request.inspectionResult}
        </p>
      )}
      <small className="order-details__return-meta">
        Inspector: {request.inspector?.name ?? 'Not assigned'} ·{' '}
        {formatDateTime(request.inspectedAt)}
      </small>
      <ReturnReview key={request.id} request={request} />
    </article>
  )
}
