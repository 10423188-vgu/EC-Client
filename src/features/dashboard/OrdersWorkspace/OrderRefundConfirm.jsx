import { useState } from 'react'
import { Modal, PanelButton } from '../../../shared/components'
import { formatLib } from '../../../shared/utils'
import './OrderRefundConfirm.css'
export default function OrderRefundConfirm({
  order,
  isPending,
  onCancel,
  onConfirm,
}) {
  const refundableAmount = Number(order.refundableAmount ?? 0)
  const approvedAmount = Number(
    order.returnRequests?.find((request) => request.status === 'APPROVED')
      ?.refundAmount ?? refundableAmount,
  )
  const [reason, setReason] = useState('')
  const [transactionId, setTransactionId] = useState('')
  const canConfirm =
    approvedAmount > 0 &&
    reason.trim().length >= 3 &&
    transactionId.trim().length >= 3
  return (
    <Modal
      title="Record completed refund"
      maxWidth="400px"
      onClose={isPending ? () => {} : onCancel}
    >
      <div className="order-refund-confirm">
        <p className="order-refund-confirm__eyebrow">
          Order #{order.id.slice(0, 8).toUpperCase()}
        </p>
        <p className="order-refund-confirm__available">
          Refundable
          <strong>{formatLib.vnd(approvedAmount)}</strong>
        </p>
        <label className="order-refund-confirm__field">
          <span>Bank transfer reference</span>
          <input
            value={transactionId}
            maxLength={100}
            placeholder="Bank refund reference"
            onChange={(event) => setTransactionId(event.target.value)}
          />
        </label>
        <label className="order-refund-confirm__field">
          <span>Refund reason</span>
          <textarea
            value={reason}
            maxLength={500}
            placeholder="Explain why this refund is being issued..."
            onChange={(event) => setReason(event.target.value)}
          />
        </label>
        <p className="order-refund-confirm__notice">
          Send the refund through your bank before recording it here. This form
          only records a completed transfer; it does not move money. The amount
          is fixed by the approved return inspection.
        </p>
        <div className="order-refund-confirm__actions">
          <PanelButton
            type="button"
            variant="cancel"
            label="Cancel"
            onClick={onCancel}
            disabled={isPending}
          />
          <PanelButton
            type="button"
            variant="save"
            label="Record completed refund"
            loadingLabel="Recording..."
            loading={isPending}
            onClick={() =>
              onConfirm({
                amount: approvedAmount,
                reason: reason.trim(),
                transactionId: transactionId.trim(),
                returnRequestId: order.approvedReturnId,
              })
            }
            disabled={isPending || !canConfirm}
          />
        </div>
      </div>
    </Modal>
  )
}
