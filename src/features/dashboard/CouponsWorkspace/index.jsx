import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FiEdit2, FiEye, FiTrash2 } from 'react-icons/fi'
import { useCoupons, useDeleteCoupon } from '../../../entities/coupon'
import {
  CreateButton,
  Pagination,
  RetryButton,
  SelectField,
  StatusBadge,
} from '../../../shared/components'
import DashboardWorkspaceSkeleton from '../DashboardWorkspaceSkeleton'
import DashboardIconAction from '../DashboardIconAction'
import CouponDetails from './CouponDetails'
import CouponEditor from './CouponEditor'
import CouponDeleteConfirm from './CouponDeleteConfirm'
import {
  COUPON_TYPE_LABELS,
  formatCouponValue,
  getCouponStatus,
} from './couponDisplay'
import '../workspaceControls.css'
import './CouponsWorkspace.css'

export default function CouponsWorkspace() {
  const [params, setParams] = useSearchParams()
  const page = Math.max(1, Number(params.get('couponPage')) || 1)
  const requestedLimit = Number(params.get('couponLimit'))
  const limit = [10, 20, 50].includes(requestedLimit) ? requestedLimit : 10
  const status = params.get('couponStatus') ?? ''
  const type = params.get('couponType') ?? ''
  const [viewing, setViewing] = useState(null)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const list = useCoupons({
    page,
    limit,
    isActive: status || undefined,
    type: type || undefined,
  })
  const deleteMutation = useDeleteCoupon()
  const coupons = list.data?.data ?? []
  const pagination = list.data?.pagination
  const stale = list.isPlaceholderData || list.isError

  const changeFilters = (updates) => {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(updates)) {
      if (value) next.set(key, String(value))
      else next.delete(key)
    }
    if (!('couponPage' in updates)) next.delete('couponPage')
    setParams(next)
  }

  if (list.isPending) return <DashboardWorkspaceSkeleton section="coupons" />

  return (
    <section className="coupons-workspace">
      <header className="coupons-workspace__header">
        <CreateButton onClick={() => setEditing('create')}>
          Add coupon
        </CreateButton>
      </header>

      <div className="coupons-workspace__filters">
        <SelectField
          value={status}
          wrapperClassName="workspace-controls__select"
          onChange={(event) =>
            changeFilters({ couponStatus: event.target.value })
          }
          aria-label="Filter coupon activity"
        >
          <option value="">All activity</option>
          <option value="true">Enabled</option>
          <option value="false">Disabled</option>
        </SelectField>
        <SelectField
          value={type}
          wrapperClassName="workspace-controls__select"
          onChange={(event) =>
            changeFilters({ couponType: event.target.value })
          }
          aria-label="Filter coupon type"
        >
          <option value="">All types</option>
          {Object.entries(COUPON_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </SelectField>
      </div>
      <p className="coupons-workspace__notice">
        Create a code here, then apply it at checkout. Codes with usage history
        can be deactivated but not deleted.
      </p>

      <div
        className="workspace-controls__summary"
        role="status"
        aria-busy={list.isFetching && !list.isError}
      >
        <output>{pagination?.total ?? 0} coupons</output>
      </div>
      {list.isError && (
        <div className="coupons-workspace__error" role="alert">
          <p>
            {list.data
              ? 'Could not refresh coupons. Showing previous results.'
              : 'Could not load coupons.'}
          </p>
          <RetryButton
            onClick={() => list.refetch()}
            loading={list.isFetching}
          />
        </div>
      )}
      {coupons.length ? (
        <div
          className="coupons-workspace__table-wrapper"
          inert={stale ? true : undefined}
        >
          <table className="coupons-workspace__table">
            <thead>
              <tr>
                <th scope="col">Code</th>
                <th scope="col">Discount</th>
                <th scope="col">Ends</th>
                <th scope="col" className="coupons-workspace__count">
                  Used
                </th>
                <th scope="col" className="coupons-workspace__status">
                  Status
                </th>
                <th scope="col" className="coupons-workspace__action-cell">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => {
                const state = getCouponStatus(coupon)
                return (
                  <tr key={coupon.id}>
                    <td>
                      <div className="coupons-workspace__identity">
                        <span
                          className="coupons-workspace__initial"
                          aria-hidden="true"
                        >
                          {coupon.code.slice(0, 1)}
                        </span>
                        <span>
                          <strong>{coupon.code}</strong>
                          <small>{coupon.name}</small>
                        </span>
                      </div>
                    </td>
                    <td>{formatCouponValue(coupon)}</td>
                    <td>
                      {coupon.expiresAt
                        ? new Date(coupon.expiresAt).toLocaleDateString('en-US')
                        : 'No expiry'}
                    </td>
                    <td className="coupons-workspace__count">
                      {coupon.usageCount}
                      {coupon.usageLimit === null
                        ? ''
                        : ` / ${coupon.usageLimit}`}
                    </td>
                    <td className="coupons-workspace__status">
                      <StatusBadge size="compact" tone={state.tone}>
                        {state.label}
                      </StatusBadge>
                    </td>
                    <td className="coupons-workspace__action-cell">
                      <div className="coupons-workspace__actions">
                        <DashboardIconAction
                          icon={FiEye}
                          label={`View ${coupon.code}`}
                          onClick={() => setViewing(coupon.id)}
                          disabled={stale}
                        />
                        <DashboardIconAction
                          icon={FiEdit2}
                          label={`Edit ${coupon.code}`}
                          onClick={() => setEditing(coupon.id)}
                          disabled={stale}
                        />
                        <span
                          title={
                            coupon.usageCount > 0
                              ? 'Deactivate used coupons instead'
                              : 'Delete unused coupon'
                          }
                        >
                          <DashboardIconAction
                            icon={FiTrash2}
                            label={`Delete ${coupon.code}`}
                            danger
                            onClick={() => setDeleting(coupon)}
                            disabled={stale || coupon.usageCount > 0}
                          />
                        </span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : !list.isError ? (
        <p className="coupons-workspace__empty">
          No coupons match these filters.
        </p>
      ) : null}

      <footer className="coupons-workspace__footer">
        <Pagination
          page={page}
          totalPages={pagination?.totalPages ?? 0}
          onPageChange={(nextPage) => changeFilters({ couponPage: nextPage })}
        />
        <SelectField
          value={limit}
          wrapperClassName="workspace-controls__select"
          onChange={(event) =>
            changeFilters({ couponLimit: event.target.value })
          }
          aria-label="Coupons per page"
        >
          {[10, 20, 50].map((value) => (
            <option key={value} value={value}>
              Show {value}
            </option>
          ))}
        </SelectField>
      </footer>

      {viewing && (
        <CouponDetails
          id={viewing}
          onClose={() => setViewing(null)}
          onEdit={() => {
            setEditing(viewing)
            setViewing(null)
          }}
        />
      )}
      {editing && (
        <CouponEditor
          id={editing === 'create' ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
      {deleting && (
        <CouponDeleteConfirm
          coupon={deleting}
          mutation={deleteMutation}
          onClose={() => setDeleting(null)}
          onDeleted={() => {
            setDeleting(null)
            if (coupons.length === 1 && page > 1) {
              changeFilters({ couponPage: page - 1 })
            }
          }}
        />
      )}
    </section>
  )
}
