import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  adminProductService,
  useAdminVariantMutation,
} from '../../../entities/product'
import { PanelButton, RetryButton } from '../../../shared/components'

export default function ProductInventory({
  productId,
  variant,
  onUpdated,
  onClose,
  onBusyChange,
  onDirtyChange,
}) {
  const [delta, setDelta] = useState('')
  const [reason, setReason] = useState('')
  const requestId = useRef(crypto.randomUUID())
  const mutation = useAdminVariantMutation()
  useEffect(() => {
    onBusyChange(mutation.isPending)
  }, [mutation.isPending, onBusyChange])
  useEffect(() => {
    onDirtyChange(Boolean(delta || reason))
  }, [delta, reason, onDirtyChange])
  const history = useQuery({
    queryKey: ['admin-products', 'stock-history', productId, variant.id],
    queryFn: ({ signal }) =>
      adminProductService.stockHistory(productId, variant.id, signal),
  })
  const change = (setter, value) => {
    requestId.current = crypto.randomUUID()
    setter(value)
  }
  return (
    <section className="product-editor__fields">
      <h3>
        Inventory · {variant.name} · Current stock: {variant.stock}
      </h3>
      <form
        className="product-editor__fields"
        onSubmit={async (event) => {
          event.preventDefault()
          if (mutation.isPending) return
          if (
            !Number.isInteger(Number(delta)) ||
            Number(delta) === 0 ||
            Math.abs(Number(delta)) > 1000000 ||
            reason.trim().length < 3
          )
            return toast.error(
              'Enter a non-zero whole quantity and a reason (at least 3 characters)',
            )
          try {
            await mutation.mutateAsync({
              action: 'adjustStock',
              id: productId,
              variantId: variant.id,
              data: {
                requestId: requestId.current,
                delta: Number(delta),
                reason: reason.trim(),
              },
            })
          } catch (error) {
            toast.error(
              error.response?.data?.message ??
                'Could not adjust stock; retry keeps the same request',
            )
            return
          }
          setDelta('')
          setReason('')
          requestId.current = crypto.randomUUID()
          toast.success('Stock adjusted')
          try {
            await onUpdated()
          } catch {
            toast.warning(
              'Stock adjusted, but the variant list could not refresh.',
            )
          }
        }}
      >
        <div className="product-editor__columns">
          <label>
            Quantity change (+ receive, − reduce)
            <input
              type="number"
              value={delta}
              onChange={(event) => change(setDelta, event.target.value)}
              disabled={mutation.isPending}
              step="1"
            />
          </label>
          <label>
            Reason
            <input
              value={reason}
              onChange={(event) => change(setReason, event.target.value)}
              disabled={mutation.isPending}
              maxLength={500}
            />
          </label>
        </div>
        <div className="product-editor__actions">
          <PanelButton
            variant="cancel"
            label="Back to variants"
            onClick={() => {
              if (
                (delta || reason) &&
                !window.confirm('Discard unsaved stock adjustment?')
              )
                return
              onDirtyChange(false)
              onClose()
            }}
            disabled={mutation.isPending}
          />
          <PanelButton
            type="submit"
            label="Apply adjustment"
            loadingLabel="Applying…"
            loading={mutation.isPending}
          />
        </div>
      </form>
      <h3>Latest 50 adjustments</h3>
      {history.isLoading && <p>Loading inventory history…</p>}
      {history.isError && (
        <RetryButton
          label="Retry history"
          onClick={() => history.refetch()}
          loading={history.isFetching}
        />
      )}
      {history.data?.length === 0 && <p>No manual stock adjustments yet.</p>}
      <ul className="product-editor__history">
        {history.data?.map((item) => (
          <li key={item._id}>
            <strong>
              {item.delta > 0 ? '+' : ''}
              {item.delta} · {item.before} → {item.after}
            </strong>
            <span>{item.reason}</span>
            <small>
              {new Date(item.createdAt).toLocaleString()} · {item.changedBy}
            </small>
          </li>
        ))}
      </ul>
    </section>
  )
}
