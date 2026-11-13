import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  MdAccountBalance,
  MdCheckCircle,
  MdLocationPin,
  MdOpenInNew,
} from 'react-icons/md'
import { useOrderById } from '../../../entities/order/api/order.queries.js'
import { useCancelOrder } from '../../../entities/order/api/order.mutations.js'
import {
  ORDER_STATUS_LABELS,
  CANCELLABLE_ORDER_STATUSES,
} from '../../../entities/order/model/order.constants.js'
import { AddressCard, formatAddress } from '../../../entities/user'
import {
  PanelButton,
  ArrowTextLink,
  RetryButton,
  StatusBadge,
} from '../../../shared/components'
import { formatLib } from '../../../shared/utils'
import ReturnRequestForm from './ReturnRequestForm'
import ReturnRequestHistory from './ReturnRequestHistory'
import { getRemainingReturnItems } from './returnItems'
import OrderDetailSkeleton from './OrderDetailSkeleton'
import './OrderDetail.css'
export default function OrderDetail() {
  const { id } = useParams()
  const {
    data: order,
    isLoading,
    isError,
    isFetching,
    error,
    refetch,
  } = useOrderById(id)
  const { mutate: cancelOrder, isPending: cancelling } = useCancelOrder()
  if (isLoading) return <OrderDetailSkeleton />
  if (isError || !order) {
    return (
      <div className="order-detail__error">
        <p>
          {isError && error?.response?.status !== 404
            ? 'Could not load order.'
            : 'Order not found.'}
        </p>
        {isError && error?.response?.status !== 404 && (
          <RetryButton onClick={() => refetch()} loading={isFetching} />
        )}
        <ArrowTextLink
          to="/orders"
          direction="left"
          className="order-detail__back order-detail__back--error"
        >
          Back
        </ArrowTextLink>
      </div>
    )
  }
  const status = ORDER_STATUS_LABELS[order.status] ?? {
    label: order.status,
    tone: 'neutral',
  }
  const canCancel = CANCELLABLE_ORDER_STATUSES.includes(order.status)
  const { address, payment } = order
  const returnRequests = order.returnRequests ?? []
  const activeReturn = returnRequests.some((request) =>
    ['REQUESTED', 'INSPECTING', 'APPROVED'].includes(request.status),
  )
  const hasRemainingItems = getRemainingReturnItems(order).some(
    (item) => item.remaining > 0,
  )
  const addressText = formatAddress(address)
  const mapQuery = encodeURIComponent(addressText)
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`
  const mapEmbedUrl = `https://maps.google.com/maps?q=${mapQuery}&output=embed`
  const trackingLabel = [order.shippingCarrier, order.trackingNumber]
    .filter(Boolean)
    .join(' · ')
  const progressSteps = ['Order placed', 'Processing', 'Shipped', 'Delivered']
  const progressIndex = {
    PENDING: 0,
    AWAITING_PAYMENT: 0,
    PAID: 1,
    PROCESSING: 1,
    SHIPPED: 2,
    OUT_FOR_DELIVERY: 2,
    DELIVERED: 3,
  }[order.status]
  const handleCancel = () => {
    cancelOrder(order.id, {
      onSuccess: () => toast.success('Order cancelled'),
      onError: (err) =>
        toast.error(err.response?.data?.message ?? 'Failed to cancel order'),
    })
  }
  return (
    <main className="order-detail">
      <div className="order-detail__header">
        <ArrowTextLink
          to="/orders"
          direction="left"
          className="order-detail__back"
        >
          My Orders
        </ArrowTextLink>
        <div className="order-detail__title-row">
          <h1 className="order-detail__title">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
        </div>
        <p className="order-detail__date">
          Placed on: {new Date(order.createdAt).toLocaleString('en-US')}
        </p>
      </div>

      <div className="order-detail__layout">
        <div className="order-detail__column order-detail__left">
          <section className="order-detail-section order-detail__progress-section">
            <div className="order-detail-section__header">
              <h2 className="order-detail-section__title">Order progress</h2>
              {order.trackingNumber && (
                <span className="order-detail-section__subtitle">
                  {trackingLabel}
                </span>
              )}
            </div>
            {progressIndex === undefined ? (
              <p className="order-detail__progress-terminal">
                This order is {status.label.toLowerCase()}.
              </p>
            ) : (
              <ol className="order-detail__progress">
                {progressSteps.map((step, index) => (
                  <li
                    key={step}
                    className={`order-detail__progress-step${
                      index <= progressIndex
                        ? ' order-detail__progress-step--complete'
                        : ''
                    }${
                      index < progressIndex
                        ? ' order-detail__progress-step--connector-complete'
                        : ''
                    }`}
                    aria-current={index === progressIndex ? 'step' : undefined}
                  >
                    <span className="order-detail__progress-marker">
                      {index < progressIndex ? <MdCheckCircle /> : index + 1}
                    </span>
                    <span className="order-detail__progress-label">{step}</span>
                  </li>
                ))}
              </ol>
            )}
            {order.trackingUrl && (
              <a
                className="order-detail__tracking-link"
                href={order.trackingUrl}
                target="_blank"
                rel="noreferrer"
              >
                Track shipment <MdOpenInNew aria-hidden="true" />
              </a>
            )}
          </section>

          <section className="order-detail-section">
            <div className="order-detail-section__header">
              <h2 className="order-detail-section__title">Items</h2>
              <span className="order-detail-section__subtitle">
                {order.items.length} {order.items.length > 1 ? 'items' : 'item'}
              </span>
            </div>
            <ul className="order-detail__items">
              {order.items.map((item) => (
                <li key={item.id} className="order-detail__item">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="order-detail__item-image"
                    />
                  )}
                  <div className="order-detail__item-info">
                    <span className="order-detail__item-name">
                      {item.productName}
                    </span>
                    <span className="order-detail__item-meta">
                      {item.variantName} · SKU: {item.variantSku}
                    </span>
                  </div>
                  <div className="order-detail__item-right">
                    <span className="order-detail__item-unit">
                      {formatLib.vnd(item.price)} × {item.quantity}
                    </span>
                    <span className="order-detail__item-subtotal">
                      {formatLib.vnd(item.subtotal)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
          <section className="order-detail-section">
            <AddressCard address={address} label="Shipping to" />
          </section>
        </div>

        <aside className="order-detail__column order-detail__summary">
          <section className="order-detail-section">
            <div className="order-detail-section__header">
              <h2 className="order-detail-section__title">Shipping address</h2>
              {addressText && (
                <a
                  className="order-detail__map-link"
                  href={mapUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  View map <MdOpenInNew aria-hidden="true" />
                </a>
              )}
            </div>
            {addressText ? (
              <iframe
                className="order-detail__map"
                src={mapEmbedUrl}
                title="Map showing the shipping address"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className="order-detail__map-empty">
                <MdLocationPin aria-hidden="true" />
                No shipping location available
              </div>
            )}
            <section className="order-detail-section">
              <h2 className="order-detail-section__title">Payment details</h2>
              <p className="order-detail__payment-method">
                <MdAccountBalance className="order-detail__payment-icon" />
                Bank Transfer
              </p>
              {payment?.paidAt && (
                <p className="order-detail__paid-at">
                  <MdCheckCircle className="order-detail__paid-icon" />
                  Paid on: {new Date(payment.paidAt).toLocaleString('en-US')}
                </p>
              )}
              {Number(payment?.refundedAmount) > 0 && (
                <p className="order-detail__paid-at">
                  Refunded: {formatLib.vnd(payment.refundedAmount)} of{' '}
                  {formatLib.vnd(payment.amount)}
                </p>
              )}
            </section>
          </section>

          {order.note && (
            <section className="order-detail-section">
              <h2 className="order-detail-section__title">Customer note</h2>
              <p className="order-detail__note">{order.note}</p>
            </section>
          )}

          <section className="order-detail-section">
            <h2 className="order-detail-section__title">Order summary</h2>
            <div className="order-detail__totals">
              <div className="order-detail__row">
                <span>Subtotal</span>
                <span>{formatLib.vnd(order.subtotal)}</span>
              </div>
              <div className="order-detail__row">
                <span>Shipping</span>
                <span>{formatLib.vnd(order.shippingFee)}</span>
              </div>
              {Number(order.discountAmount) > 0 && (
                <div className="order-detail__row order-detail__row--discount">
                  <span>
                    Discount {order.couponCode && `(${order.couponCode})`}
                  </span>
                  <span>-{formatLib.vnd(order.discountAmount)}</span>
                </div>
              )}
              <div className="order-detail__row order-detail__row--total">
                <span>Total</span>
                <span>{formatLib.vnd(order.total)}</span>
              </div>
            </div>
          </section>

          {canCancel && (
            <div className="order-detail__cancel-action">
              <PanelButton
                variant="danger"
                label="Cancel order"
                loadingLabel="Cancelling..."
                loading={cancelling}
                onClick={handleCancel}
              />
            </div>
          )}
        </aside>
      </div>

      {(returnRequests.length > 0 || order.status === 'DELIVERED') && (
        <div className="order-detail__follow-up">
          <ReturnRequestHistory order={order} requests={returnRequests} />
          {order.canRequestReturn && !activeReturn && hasRemainingItems ? (
            <ReturnRequestForm
              order={order}
              returnDeadlineAt={order.returnDeadlineAt}
            />
          ) : !order.canRequestReturn && !returnRequests.length ? (
            <section className="order-detail-section">
              <h2 className="order-detail-section__title">
                Return period ended
              </h2>
              <p className="order-detail__note">
                Return requests must be submitted within 30 days of delivery.
              </p>
            </section>
          ) : null}
        </div>
      )}
    </main>
  )
}
