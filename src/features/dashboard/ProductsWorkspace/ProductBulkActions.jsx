import { useState } from 'react'
import SelectionToolbar from '../SelectionToolbar'
import { RiDownloadLine } from 'react-icons/ri'
import { toast } from 'sonner'
import { useBulkAdminProducts } from '../../../entities/product'
import { Modal, PanelButton } from '../../../shared/components'
import './ProductBulkActions.css'

const ACTIONS = {
  activate: 'Activate',
  deactivate: 'Deactivate',
  trash: 'Move to trash',
  restore: 'Restore as inactive',
}

export default function ProductBulkActions({
  selected,
  isTrash,
  onCompleted,
  onClear,
  onExport,
  onExportFiltered,
  isExporting,
  disabled,
}) {
  const [confirmation, setConfirmation] = useState(null)
  const [result, setResult] = useState(null)
  const mutation = useBulkAdminProducts()
  const confirm = async () => {
    if (disabled || mutation.isPending) return
    try {
      const outcome = await mutation.mutateAsync(confirmation)
      setResult(outcome)
      setConfirmation(null)
      onCompleted(outcome, confirmation.action)
      toast[outcome.failed.length ? 'warning' : 'success'](
        `${outcome.changed.length} updated, ${outcome.skipped.length} unchanged, ${outcome.failed.length} failed`,
      )
    } catch (error) {
      toast.error(
        error.response?.data?.message ??
          'Could not update products. No changes were saved.',
      )
    }
  }
  return (
    <section className="product-bulk" aria-label="Selected product actions">
      {!!selected.length && (
        <SelectionToolbar
          count={selected.length}
          onClear={onClear}
          clearDisabled={mutation.isPending}
          ariaLabel="Selected product toolbar"
          moreLabel="More product actions"
          actions={[
            {
              id: 'export',
              label: isExporting ? 'Exporting…' : 'Export selected',
              icon: RiDownloadLine,
              onClick: onExport,
              disabled: disabled || mutation.isPending || isExporting,
            },
          ]}
          menuActions={[
            ...(isTrash
              ? ['restore']
              : ['activate', 'deactivate', 'trash']
            ).map((action) => ({
              id: action,
              label: ACTIONS[action],
              onClick: () => setConfirmation({ action, ids: [...selected] }),
              disabled: disabled || mutation.isPending,
            })),
            {
              id: 'filtered',
              label: 'Export current filtered results',
              onClick: onExportFiltered,
              disabled: disabled || mutation.isPending || isExporting,
            },
          ]}
        />
      )}
      {result && (
        <div className="product-bulk__result" role="status">
          <p>
            {result.changed.length} updated · {result.skipped.length} unchanged
            · {result.failed.length} failed
          </p>
          {!!result.failed.length && (
            <ul>
              {result.failed.map((failure) => (
                <li key={failure.id}>
                  {failure.id}: {failure.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {confirmation && (
        <Modal
          title={`${ACTIONS[confirmation.action]} products`}
          onClose={mutation.isPending ? () => {} : () => setConfirmation(null)}
          maxWidth="440px"
          footer={
            <div className="product-bulk__confirmation-actions">
              <PanelButton
                variant="cancel"
                label="Cancel"
                onClick={() => setConfirmation(null)}
                disabled={mutation.isPending}
              />
              <PanelButton
                variant={confirmation.action === 'trash' ? 'danger' : 'save'}
                label={ACTIONS[confirmation.action]}
                loadingLabel="Updating…"
                onClick={confirm}
                disabled={disabled}
                loading={mutation.isPending}
              />
            </div>
          }
        >
          <p>
            {ACTIONS[confirmation.action]} {confirmation.ids.length} selected
            products?
          </p>
          {confirmation.action === 'trash' && (
            <p>
              Products will be hidden from customers. Images, stock and order
              history are kept.
            </p>
          )}
          {confirmation.action === 'restore' && (
            <p>Products return as inactive. Review them before activating.</p>
          )}
        </Modal>
      )}
    </section>
  )
}
