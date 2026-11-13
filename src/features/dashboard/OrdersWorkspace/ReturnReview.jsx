import { useState } from 'react'
import { toast } from 'sonner'
import { useAdminUpdateReturnStatus } from '../../../entities/order'
import { Checkbox, EyeButton, PanelButton } from '../../../shared/components'

export default function ReturnReview({ request }) {
  const [inspectionResult, setInspectionResult] = useState('')
  const [restockItemIds, setRestockItemIds] = useState([])
  const { mutate: updateStatus, isPending } = useAdminUpdateReturnStatus()

  const submit = (status) => {
    updateStatus(
      {
        returnId: request.id,
        status,
        inspectionResult: inspectionResult || undefined,
        restockItemIds: status === 'APPROVED' ? restockItemIds : [],
      },
      {
        onSuccess: () => toast.success(`Return marked ${status.toLowerCase()}`),
        onError: (error) =>
          toast.error(
            error.response?.data?.message ?? 'Failed to update return',
          ),
      },
    )
  }

  const toggleRestockItem = (orderItemId, shouldRestock) => {
    setRestockItemIds((current) =>
      shouldRestock
        ? [...current, orderItemId]
        : current.filter((id) => id !== orderItemId),
    )
  }

  if (request.status === 'REQUESTED') {
    return (
      <EyeButton
        className="order-details__return-action"
        onClick={() => submit('INSPECTING')}
        disabled={isPending}
        loading={isPending}
      >
        {isPending ? 'Starting...' : 'Start inspection'}
      </EyeButton>
    )
  }

  if (request.status !== 'INSPECTING') return null

  const cannotResolve = isPending || inspectionResult.trim().length < 3

  return (
    <form
      className="order-details__return-review"
      onSubmit={(event) => event.preventDefault()}
    >
      <label className="order-details__inspection-field">
        Inspection result
        <textarea
          value={inspectionResult}
          onChange={(event) => setInspectionResult(event.target.value)}
        />
      </label>
      <fieldset className="order-details__restock-items">
        <legend>Restock only items that can be resold</legend>
        {request.items.map((item) => (
          <label key={item.orderItemId}>
            <Checkbox
              onChange={(event) =>
                toggleRestockItem(item.orderItemId, event.target.checked)
              }
              checked={restockItemIds.includes(item.orderItemId)}
            />
            Restock {item.orderItem?.productName ?? 'item'} × {item.quantity}
          </label>
        ))}
      </fieldset>
      <footer className="order-details__return-actions">
        <PanelButton
          type="button"
          variant="save"
          label="Approve"
          className="order-details__return-button"
          onClick={() => submit('APPROVED')}
          disabled={cannotResolve}
        />
        <PanelButton
          type="button"
          variant="danger"
          label="Reject"
          className="order-details__return-button"
          onClick={() => submit('REJECTED')}
          disabled={cannotResolve}
        />
      </footer>
    </form>
  )
}
