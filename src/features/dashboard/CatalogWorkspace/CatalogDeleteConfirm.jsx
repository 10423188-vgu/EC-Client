import { toast } from 'sonner'
import { Modal, PanelButton } from '../../../shared/components'

export default function CatalogDeleteConfirm({
  item,
  mutation,
  onClose,
  onDeleted,
}) {
  const confirm = async () => {
    if (mutation.isPending) return
    try {
      await mutation.mutateAsync({
        kind: item.kind,
        action: 'remove',
        id: item.record.id,
      })
      onDeleted()
      toast.success('Item deleted')
    } catch (error) {
      toast.error(error.response?.data?.message ?? 'Could not delete item')
    }
  }
  return (
    <Modal
      title={`Delete ${item.kind === 'categories' ? 'category' : 'brand'}`}
      maxWidth="440px"
      onClose={() => {
        if (!mutation.isPending) onClose()
      }}
      footer={
        <div className="catalog-workspace__dialog-actions">
          <PanelButton
            variant="cancel"
            label="Cancel"
            onClick={onClose}
            disabled={mutation.isPending}
          />
          <PanelButton
            variant="danger"
            label="Delete"
            onClick={confirm}
            loading={mutation.isPending}
          />
        </div>
      }
    >
      <p>
        Permanently delete “{item.record.name}”? The server checks that no
        products or child categories still reference it.
      </p>
    </Modal>
  )
}
