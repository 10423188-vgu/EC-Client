import { useState } from 'react'
import { toast } from 'sonner'
import { Modal, PanelButton } from '../../../shared/components'

export default function CouponDeleteConfirm({
  coupon,
  mutation,
  onClose,
  onDeleted,
}) {
  const [error, setError] = useState('')
  const confirm = async () => {
    if (mutation.isPending) return
    setError('')
    try {
      await mutation.mutateAsync(coupon.id)
      toast.success('Coupon deleted')
      onDeleted()
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ?? 'Could not delete coupon',
      )
    }
  }

  return (
    <Modal
      title="Delete coupon"
      maxWidth="440px"
      onClose={mutation.isPending ? () => {} : onClose}
      footer={
        <div className="coupons-workspace__dialog-actions">
          <PanelButton
            variant="cancel"
            label="Cancel"
            onClick={onClose}
            disabled={mutation.isPending}
          />
          <PanelButton
            variant="danger"
            label="Delete coupon"
            loadingLabel="Deleting…"
            loading={mutation.isPending}
            onClick={confirm}
          />
        </div>
      }
    >
      <p>Permanently delete “{coupon.code}”? This cannot be undone.</p>
      {error && (
        <p className="coupons-workspace__form-error" role="alert">
          {error}
        </p>
      )}
    </Modal>
  )
}
