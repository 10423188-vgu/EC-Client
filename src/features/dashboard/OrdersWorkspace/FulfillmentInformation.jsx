import { formatLib } from '../../../shared/utils'
import ReturnRequestDetails from './ReturnRequestDetails'
import { formatStatus } from './orderDetails.utils'

export default function FulfillmentInformation({ order }) {
  const returnRequests = order.returnRequests ?? []

  return (
    <section className="order-details__section">
      <header className="order-details__section-header">
        <h3>Fulfillment information</h3>
        <span>{formatStatus(order.status)}</span>
      </header>
      <div className="order-details__items">
        {order.items.map((item) => (
          <article key={item.id} className="order-details__item">
            <div className="order-details__image-frame">
              {item.image ? (
                <img src={item.image} alt="" />
              ) : (
                <span>{item.productName.slice(0, 1)}</span>
              )}
            </div>
            <div className="order-details__item-copy">
              <p>{item.productName}</p>
              <span>
                {item.variantName} · {item.quantity} ×{' '}
                {formatLib.vnd(item.price)}
              </span>
            </div>
            <strong>{formatLib.vnd(item.subtotal)}</strong>
          </article>
        ))}
      </div>
      {returnRequests.map((request) => (
        <ReturnRequestDetails key={request.id} request={request} />
      ))}
    </section>
  )
}
