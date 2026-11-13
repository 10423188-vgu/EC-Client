import { ORDER_STATUS_LABELS } from '../../../entities/order'
import { Checkbox, StatusBadge } from '../../../shared/components'
import { formatLib } from '../../../shared/utils'
import OrderActions from './OrderActions'

export default function OrderRow({
  order,
  isSelected,
  onToggleSelection,
  onRequestUpdate,
  onRequestRefund,
  onView,
}) {
  const availableActions = new Set(order.adminActions ?? [])
  const status = ORDER_STATUS_LABELS[order.status]

  return (
    <tr aria-selected={isSelected}>
      <td className="orders-workspace__select-cell">
        <Checkbox
          className="workspace-controls__row-checkbox"
          checked={isSelected}
          onChange={() => onToggleSelection(order)}
          aria-label={`Select order ${order.id}`}
        />
      </td>
      <td>
        <button
          type="button"
          className="orders-workspace__order-link"
          onClick={() => onView(order.id)}
        >
          #{order.id.slice(0, 8).toUpperCase()}
        </button>
      </td>
      <td>
        <span className="orders-workspace__customer-name">
          {order.user?.name ?? 'Customer'}
        </span>
        <span className="orders-workspace__customer-email">
          {order.user?.email}
        </span>
      </td>
      <td>
        <span className="orders-workspace__payment-method">
          {order.payment?.method === 'BANK_TRANSFER' ? 'Bank transfer' : '—'}
        </span>
        <span className="orders-workspace__payment-status">
          {order.payment?.status?.replaceAll('_', ' ') ?? 'Not recorded'}
        </span>
      </td>
      <td>
        <StatusBadge size="compact" tone={status?.tone}>
          {status?.label ?? order.status}
        </StatusBadge>
      </td>
      <td>{order.itemsCount}</td>
      <td className="orders-workspace__total">{formatLib.vnd(order.total)}</td>
      <td>
        {new Date(order.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })}
      </td>
      <td>
        <OrderActions
          order={order}
          availableActions={availableActions}
          onRequestUpdate={onRequestUpdate}
          onRequestRefund={onRequestRefund}
          onView={onView}
        />
      </td>
    </tr>
  )
}
