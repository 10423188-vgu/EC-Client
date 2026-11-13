import { useState } from 'react'
import { Modal, PanelButton } from '../../../shared/components'
import { ORDER_STATUS_LABELS } from '../../../entities/order'
import './OrderStatusConfirm.css'
export default function OrderStatusConfirm({
  action,
  isPending,
  onCancel,
  onConfirm,
}) {
  const targetLabel =
    ORDER_STATUS_LABELS[action.targetStatus]?.label ?? action.targetStatus
  const [reason, setReason] = useState('')
  const canConfirm = !action.requiresReason || reason.trim().length >= 3
  return (
    <Modal
      title="Confirm order update"
      maxWidth="400px"
      onClose={isPending ? () => {} : onCancel}
    >
      <div className="order-status-confirm">
        <p className="order-status-confirm__eyebrow">
          Order #{action.order.id.slice(0, 8).toUpperCase()}
        </p>
        <p className="order-status-confirm__message">
          {action.message ?? `Change this order to ${targetLabel}?`}
        </p>
        {action.requiresReason && (
          <label className="order-status-confirm__reason">
            <span>
              {action.reasonLabel ?? 'Why are you returning this order?'}
            </span>
            <textarea
              value={reason}
              placeholder={
                action.reasonPlaceholder ?? 'Describe the warehouse issue...'
              }
              maxLength={500}
              onChange={(event) => setReason(event.target.value)}
              autoFocus
            />
          </label>
        )}
        <p className="order-status-confirm__notice">
          The customer will receive an order-status notification after this
          update.
        </p>
        <div className="order-status-confirm__actions">
          <PanelButton
            variant="cancel"
            label="Cancel"
            onClick={onCancel}
            disabled={isPending}
          />
          <PanelButton
            variant="save"
            label={action.confirmLabel}
            loadingLabel="Updating..."
            loading={isPending}
            onClick={() => onConfirm(reason.trim())}
            disabled={!canConfirm}
          />
        </div>
      </div>
    </Modal>
  )
}
