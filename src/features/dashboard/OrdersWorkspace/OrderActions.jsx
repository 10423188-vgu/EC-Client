import { FiMoreHorizontal, FiRotateCcw } from 'react-icons/fi'
import { PanelButton } from '../../../shared/components'

const STATUS_ACTIONS = {
  PROCESS: { status: 'PROCESSING', label: 'Process' },
  SHIP: { status: 'SHIPPED', label: 'Ship' },
  DISPATCH: { status: 'OUT_FOR_DELIVERY', label: 'Dispatch' },
  DELIVER: { status: 'DELIVERED', label: 'Deliver' },
}

const UNDO_ACTION = {
  status: 'PAID',
  label: 'Undo',
  message:
    'Return this order to Paid? The warehouse can correct the processing step before shipping.',
  requiresReason: true,
}

export default function OrderActions({
  order,
  availableActions,
  onRequestUpdate,
  onRequestRefund,
  onView,
}) {
  const returnStatus = order.returnRequests?.[0]?.status
  const hasReturnToReview = ['REQUESTED', 'INSPECTING'].includes(returnStatus)
  const nextAction = Object.entries(STATUS_ACTIONS).find(([action]) =>
    availableActions.has(action),
  )?.[1]

  return (
    <div className="orders-workspace__actions">
      {hasReturnToReview && (
        <PanelButton
          variant="tertiary"
          label="Review return"
          className="orders-workspace__table-action orders-workspace__table-action--return"
          onClick={() => onView(order.id)}
        />
      )}
      {availableActions.has('CONFIRM_PAYMENT') && (
        <PanelButton
          variant="tertiary"
          label="Confirm"
          className="orders-workspace__table-action"
          onClick={() =>
            onRequestUpdate({
              order,
              targetStatus: 'PAID',
              confirmLabel: 'Confirm payment',
              message: 'Confirm payment for this order?',
            })
          }
        />
      )}
      {nextAction && (
        <PanelButton
          variant="tertiary"
          label={nextAction.label}
          title={`Mark order as ${nextAction.status.toLowerCase().replaceAll('_', ' ')}`}
          className="orders-workspace__table-action"
          onClick={() =>
            onRequestUpdate({
              order,
              targetStatus: nextAction.status,
              confirmLabel: nextAction.label,
              message: `Mark this order as ${nextAction.status.toLowerCase().replaceAll('_', ' ')}?`,
            })
          }
        />
      )}
      {availableActions.has('UNDO') && (
        <button
          type="button"
          title={UNDO_ACTION.message}
          className="orders-workspace__undo-action"
          onClick={() =>
            onRequestUpdate({
              order,
              targetStatus: UNDO_ACTION.status,
              confirmLabel: UNDO_ACTION.label,
              message: UNDO_ACTION.message,
              requiresReason: UNDO_ACTION.requiresReason,
            })
          }
          aria-label={UNDO_ACTION.message}
        >
          <FiRotateCcw aria-hidden="true" />
        </button>
      )}
      {availableActions.has('CANCEL') && (
        <PanelButton
          variant="tertiary"
          label="Cancel"
          className="orders-workspace__table-action orders-workspace__table-action--danger"
          onClick={() =>
            onRequestUpdate({
              operation: 'cancel',
              order,
              confirmLabel: 'Cancel order',
              message: 'Cancel this unpaid order?',
              requiresReason: true,
              reasonLabel: 'Cancellation reason',
              reasonPlaceholder: 'Explain why this order is being cancelled...',
            })
          }
        />
      )}
      {availableActions.has('REFUND') && (
        <PanelButton
          variant="tertiary"
          label="Refund"
          className="orders-workspace__table-action orders-workspace__table-action--danger"
          onClick={() => onRequestRefund(order)}
        />
      )}
      <button
        type="button"
        className="orders-workspace__more-action"
        onClick={() => onView(order.id)}
        aria-label={`View details for order ${order.id}`}
      >
        <FiMoreHorizontal aria-hidden="true" />
      </button>
    </div>
  )
}
