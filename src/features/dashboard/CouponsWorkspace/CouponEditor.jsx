import { useCouponById } from '../../../entities/coupon'
import { Modal, RetryButton } from '../../../shared/components'
import CouponModalSkeleton from './CouponModalSkeleton'
import CouponForm from './CouponForm'

export default function CouponEditor({ id, onClose }) {
  const query = useCouponById(id)
  if (id && !query.data && (query.isPending || query.isError)) {
    return (
      <Modal title="Edit coupon" maxWidth="480px" onClose={onClose}>
        {query.isPending ? (
          <CouponModalSkeleton />
        ) : (
          <div className="coupons-workspace__modal-message" role="alert">
            <p>Could not load this coupon.</p>
            <RetryButton
              onClick={() => query.refetch()}
              loading={query.isFetching}
            />
          </div>
        )}
      </Modal>
    )
  }
  return (
    <CouponForm
      key={id ?? 'new'}
      coupon={query.data ?? null}
      loadError={query.isError}
      onRetry={() => query.refetch()}
      onClose={onClose}
    />
  )
}
