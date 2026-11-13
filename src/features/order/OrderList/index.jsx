import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { MdAccountBalance } from 'react-icons/md'
import { useOrders } from '../../../entities/order/api/order.queries.js'
import { useCancelOrder } from '../../../entities/order/api/order.mutations.js'
import {
  ORDER_STATUS_LABELS,
  CANCELLABLE_ORDER_STATUSES,
} from '../../../entities/order/model/order.constants.js'
import {
  ArrowButton,
  Pagination,
  PanelButton,
  RetryButton,
  StatusBadge,
  SlidingTabs,
} from '../../../shared/components'
import { formatLib } from '../../../shared/utils'
import '../../../shared/styles/skeleton.css'
import './OrderList.css'
const ORDER_CARD_VISIBLE_ITEMS = 2
export const ORDER_SKELETON_COUNT = 4
function OrderCard({ order, index, onCancel, cancelling }) {
  const status = ORDER_STATUS_LABELS[order.status] ?? {
    label: order.status,
    tone: 'neutral',
  }
  const canCancel = CANCELLABLE_ORDER_STATUSES.includes(order.status)
  const visibleItems = order.items.slice(0, ORDER_CARD_VISIBLE_ITEMS)
  const hiddenCount =
    (order.itemsCount ?? order.items.length) - visibleItems.length
  return (
    <article
      className="order-card"
      style={{
        '--order-card-i': index,
      }}
    >
      <div className="order-card__header">
        <span className="order-card__id">
          #{order.id.slice(0, 8).toUpperCase()}
        </span>
        <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
      </div>

      <ul className="order-card__items">
        {visibleItems.map((item) => (
          <li key={item.id} className="order-card__item">
            {item.image && (
              <img
                src={item.image}
                alt={item.productName}
                className="order-card__item-image"
              />
            )}
            <div className="order-card__item-info">
              <span className="order-card__item-name">{item.productName}</span>
              <span className="order-card__item-variant">
                {item.variantName}
              </span>
              <div className="order-card__item-line">
                <span className="order-card__item-price">
                  {formatLib.vnd(item.subtotal)}
                </span>
                <span className="order-card__item-quantity">
                  x{item.quantity}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <span
        className={`order-card__items-more${hiddenCount > 0 ? '' : ' order-card__items-more--empty'}`}
      >
        {hiddenCount > 0 ? `+${hiddenCount} more` : ' '}
      </span>

      <div className="order-card__footer">
        <div className="order-card__meta">
          <span className="order-card__method">
            <MdAccountBalance className="order-card__method-icon" />
            Bank Transfer
          </span>
          <span>{new Date(order.createdAt).toLocaleDateString('en-US')}</span>
        </div>
        <div className="order-card__actions">
          <span className="order-card__total">
            {formatLib.vnd(order.total)}
          </span>
          <Link
            to={`/orders/${order.id}`}
            className="order-card__detail-action"
          >
            Details
          </Link>
          {canCancel && (
            <PanelButton
              variant="danger"
              label="Cancel"
              loadingLabel="Cancelling..."
              loading={cancelling === order.id}
              onClick={() => onCancel(order.id)}
            />
          )}
        </div>
      </div>
    </article>
  )
}
export function OrderCardSkeleton() {
  return (
    <div className="order-card-skeleton" aria-hidden="true">
      <div className="order-card-skeleton__header">
        <div className="skeleton order-card-skeleton__id" />
        <div className="skeleton order-card-skeleton__status" />
      </div>
      <div className="order-card-skeleton__items">
        {Array.from({ length: ORDER_CARD_VISIBLE_ITEMS }, (_, index) => (
          <div key={index} className="order-card-skeleton__item">
            <div className="skeleton order-card-skeleton__image" />
            <div className="order-card-skeleton__item-info">
              <div className="skeleton order-card-skeleton__name" />
              <div className="skeleton order-card-skeleton__variant" />
              <div className="order-card-skeleton__item-line">
                <div className="skeleton order-card-skeleton__price" />
                <div className="skeleton order-card-skeleton__quantity" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="order-card-skeleton__items-more" />
      <div className="order-card-skeleton__footer">
        <div className="order-card-skeleton__meta">
          <div className="skeleton order-card-skeleton__method" />
          <div className="skeleton order-card-skeleton__date" />
        </div>
        <div className="order-card-skeleton__actions">
          <div className="skeleton order-card-skeleton__total" />
          <div className="skeleton order-card-skeleton__detail-action" />
        </div>
      </div>
    </div>
  )
}
const STATUS_FILTERS = [
  '',
  'AWAITING_PAYMENT',
  'PAID',
  'PROCESSING',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
]
export const ORDER_TABS = STATUS_FILTERS.map((value) => ({
  value,
  label: value === '' ? 'All' : (ORDER_STATUS_LABELS[value]?.label ?? value),
}))

export default function OrderList() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [cancellingId, setCancellingId] = useState(null)
  const { data, isLoading, isError, isFetching, refetch } = useOrders({
    page,
    limit: 12,
    status: statusFilter || undefined,
  })
  const { mutate: cancelOrder } = useCancelOrder()
  const handleCancel = (id) => {
    setCancellingId(id)
    cancelOrder(id, {
      onSuccess: () => toast.success('Order cancelled'),
      onError: (err) =>
        toast.error(err.response?.data?.message ?? 'Failed to cancel order'),
      onSettled: () => setCancellingId(null),
    })
  }
  const orders = data?.data ?? []
  const totalPages = data?.pagination?.totalPages ?? 1
  return (
    <main className="orders-page">
      <h1 className="orders-page__title">My Orders</h1>

      <div className="orders-page__filters">
        <SlidingTabs
          tabs={ORDER_TABS}
          value={statusFilter}
          className="orders-page__filters-track"
          onChange={(value) => {
            setStatusFilter(value)
            setPage(1)
          }}
          ariaLabel="Filter orders by status"
        />
      </div>

      {isLoading && (
        <div
          className="orders-page__list"
          role="status"
          aria-busy="true"
          aria-label="Orders loading"
        >
          {Array.from({ length: ORDER_SKELETON_COUNT }, (_, i) => (
            <OrderCardSkeleton key={i} />
          ))}
        </div>
      )}

      {isError && !data && (
        <div className="orders-page__empty" role="alert">
          <p>Could not load your orders.</p>
          <RetryButton onClick={() => refetch()} loading={isFetching} />
        </div>
      )}
      {isError && data && (
        <div role="alert">
          <p>Could not refresh your orders. Showing saved results.</p>
          <RetryButton onClick={() => refetch()} loading={isFetching} />
        </div>
      )}

      {!isLoading && !isError && !orders.length && (
        <div className="orders-page__empty">
          <p>You don't have any orders yet.</p>
          <ArrowButton to="/products">Shop now</ArrowButton>
        </div>
      )}

      {!isLoading && orders.length > 0 && (
        <div className="orders-page__list">
          {orders.map((order, index) => (
            <OrderCard
              key={order.id}
              order={order}
              index={index}
              onCancel={handleCancel}
              cancelling={cancellingId}
            />
          ))}
        </div>
      )}

      <Pagination
        className="orders-page__pagination"
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {!isLoading && orders.length > 0 && (
        <div className="orders-page__continue">
          <ArrowButton to="/products">Shop now</ArrowButton>
        </div>
      )}
    </main>
  )
}
