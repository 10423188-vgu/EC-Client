import { FiRotateCcw } from 'react-icons/fi'
import { StatusBadge } from '../../../shared/components'
import { formatLib } from '../../../shared/utils'
import './ReturnRequestHistory.css'

const RETURN_STATUSES = {
  REQUESTED: { label: 'Requested', tone: 'warning' },
  INSPECTING: { label: 'Inspecting', tone: 'info' },
  APPROVED: { label: 'Approved', tone: 'primary' },
  REJECTED: { label: 'Rejected', tone: 'danger' },
  REFUNDED: { label: 'Refunded', tone: 'success' },
  NO_REFUND: { label: 'No refund', tone: 'neutral' },
}

export default function ReturnRequestHistory({ order, requests }) {
  const orderItems = new Map(order.items.map((item) => [item.id, item]))

  return requests.map((request) => {
    const status = RETURN_STATUSES[request.status] ?? {
      label: request.status,
      tone: 'neutral',
    }
    const itemCount = request.items.reduce(
      (total, item) => total + item.quantity,
      0,
    )

    return (
      <article key={request.id} className="return-history">
        <header className="return-history__header">
          <span className="return-history__icon">
            <FiRotateCcw aria-hidden="true" />
          </span>
          <div className="return-history__heading">
            <h2>Return request</h2>
            <time dateTime={request.createdAt}>
              Submitted{' '}
              {new Date(request.createdAt).toLocaleDateString('en-US')}
            </time>
          </div>
          <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
        </header>

        <section className="return-history__reason">
          <h3>Reason</h3>
          <p>{request.reason}</p>
        </section>

        <section className="return-history__products">
          <h3>
            Items to return <span>{itemCount}</span>
          </h3>
          <ul className="return-history__items">
            {request.items.map((item) => {
              const product = orderItems.get(item.orderItemId)
              return (
                <li key={item.orderItemId} className="return-history__item">
                  {product?.image ? (
                    <img src={product.image} alt="" />
                  ) : (
                    <span className="return-history__image-fallback">
                      {product?.productName?.slice(0, 1) ?? 'I'}
                    </span>
                  )}
                  <span className="return-history__item-name">
                    <strong>{product?.productName ?? 'Item'}</strong>
                    {product?.variantName && (
                      <small>{product.variantName}</small>
                    )}
                  </span>
                  <span className="return-history__quantity">
                    × {item.quantity}
                  </span>
                </li>
              )
            })}
          </ul>
        </section>

        {(request.inspectionResult || request.refundAmount != null) && (
          <footer className="return-history__footer">
            {request.inspectionResult && (
              <p>
                <strong>Inspection</strong>
                {request.inspectionResult}
              </p>
            )}
            {request.refundAmount != null && (
              <p>
                <strong>Refund amount</strong>
                {formatLib.vnd(request.refundAmount)}
              </p>
            )}
          </footer>
        )}
      </article>
    )
  })
}
