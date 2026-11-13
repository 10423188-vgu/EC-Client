import { SkeletonBlock } from '../DashboardWorkspaceSkeleton/SkeletonPrimitives'

export default function CouponModalSkeleton() {
  return (
    <div className="coupons-workspace__modal-skeleton" aria-busy="true">
      <p>Loading coupon…</p>
      <div aria-hidden="true">
        <SkeletonBlock className="coupons-workspace__modal-skeleton-title" />
        <SkeletonBlock className="coupons-workspace__modal-skeleton-row" />
        <SkeletonBlock className="coupons-workspace__modal-skeleton-row" />
        <SkeletonBlock className="coupons-workspace__modal-skeleton-row" />
      </div>
    </div>
  )
}
