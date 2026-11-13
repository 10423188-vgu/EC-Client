import { useCouponById } from '../../../entities/coupon'
import {
  Modal,
  PanelButton,
  RetryButton,
  StatusBadge,
} from '../../../shared/components'
import { formatLib } from '../../../shared/utils'
import {
  COUPON_TYPE_LABELS,
  formatCouponValue,
  getCouponStatus,
} from './couponDisplay'
import CouponModalSkeleton from './CouponModalSkeleton'

const formatDate = (value) =>
  value ? new Date(value).toLocaleString('en-US') : 'Not set'

export default function CouponDetails({ id, onClose, onEdit }) {
  const query = useCouponById(id)
  const coupon = query.data
  const state = coupon && getCouponStatus(coupon)

  return (
    <Modal title="Coupon details" maxWidth="560px" onClose={onClose}>
      {query.isPending && !coupon ? (
        <CouponModalSkeleton />
      ) : query.isError && !coupon ? (
        <div className="coupons-workspace__modal-message" role="alert">
          <p>Could not load this coupon.</p>
          <RetryButton
            onClick={() => query.refetch()}
            loading={query.isFetching}
          />
        </div>
      ) : (
        <div className="coupons-workspace__detail">
          {query.isError && (
            <div className="coupons-workspace__error" role="alert">
              <p>Could not refresh this coupon.</p>
              <RetryButton
                onClick={() => query.refetch()}
                loading={query.isFetching}
              />
            </div>
          )}
          <header>
            <div>
              <strong>{coupon.code}</strong>
              <p>{coupon.name}</p>
            </div>
            <StatusBadge size="compact" tone={state.tone}>
              {state.label}
            </StatusBadge>
          </header>
          <dl>
            <div>
              <dt>Discount</dt>
              <dd>{formatCouponValue(coupon)}</dd>
            </div>
            <div>
              <dt>Type</dt>
              <dd>{COUPON_TYPE_LABELS[coupon.type]}</dd>
            </div>
            <div>
              <dt>Applies to</dt>
              <dd>{coupon.scope === 'ALL' ? 'All products' : coupon.scope}</dd>
            </div>
            {coupon.scope !== 'ALL' && (
              <div>
                <dt>Scope IDs</dt>
                <dd>{coupon.scopeIds.join(', ')}</dd>
              </div>
            )}
            <div>
              <dt>Usage</dt>
              <dd>
                {coupon.usageCount} / {coupon.usageLimit ?? 'Unlimited'}
              </dd>
            </div>
            <div>
              <dt>Per customer</dt>
              <dd>{coupon.perUserLimit}</dd>
            </div>
            <div>
              <dt>Minimum order</dt>
              <dd>
                {coupon.minOrderAmount
                  ? formatLib.vnd(coupon.minOrderAmount)
                  : 'None'}
              </dd>
            </div>
            {coupon.type === 'PERCENTAGE' && (
              <div>
                <dt>Maximum discount</dt>
                <dd>
                  {coupon.maxDiscount
                    ? formatLib.vnd(coupon.maxDiscount)
                    : 'None'}
                </dd>
              </div>
            )}
            <div>
              <dt>Starts</dt>
              <dd>{formatDate(coupon.startsAt)}</dd>
            </div>
            <div>
              <dt>Expires</dt>
              <dd>{formatDate(coupon.expiresAt)}</dd>
            </div>
          </dl>
          {coupon.description && <p>{coupon.description}</p>}
          <div className="coupons-workspace__dialog-actions">
            <PanelButton variant="cancel" label="Close" onClick={onClose} />
            <PanelButton label="Edit coupon" onClick={onEdit} />
          </div>
        </div>
      )}
    </Modal>
  )
}
