import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ORDER_STATUS_LABELS } from '../../../entities/order'
import {
  formatAddress,
  useAdminCustomer,
  userService,
} from '../../../entities/user'
import {
  Modal,
  Pagination,
  PanelButton,
  RetryButton,
  StatusBadge,
} from '../../../shared/components'

const formatMoney = (amount) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
    Number(amount),
  )

export default function CustomerDetails({ customer, onClose }) {
  const [page, setPage] = useState(1)
  const [confirming, setConfirming] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [actionError, setActionError] = useState('')
  const queryClient = useQueryClient()
  const query = useAdminCustomer(customer.id, page)
  const details = query.data?.id === customer.id ? query.data : null
  const suspended = Boolean(
    details ? details.suspendedAt : customer.suspendedAt,
  )

  const changeSuspension = async () => {
    if (isSaving) return
    setIsSaving(true)
    setActionError('')
    try {
      await userService.setCustomerSuspension(customer.id, !suspended)
      queryClient.setQueriesData(
        { queryKey: ['adminCustomer', customer.id] },
        (current) =>
          current
            ? {
                ...current,
                suspendedAt: suspended ? null : new Date().toISOString(),
              }
            : current,
      )
      setConfirming(false)
      toast.success(suspended ? 'Customer restored' : 'Customer suspended')
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['adminCustomers'] }),
        queryClient.invalidateQueries({
          queryKey: ['adminCustomer', customer.id],
        }),
        queryClient.invalidateQueries({ queryKey: ['adminCustomerOverview'] }),
      ])
    } catch (error) {
      setActionError(
        error.response?.data?.message ?? 'Could not update customer access.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Modal
      title={customer.name}
      maxWidth="620px"
      onClose={isSaving ? () => {} : onClose}
    >
      {query.isPending && !details ? (
        <div className="customers-workspace__detail-loading" aria-busy="true">
          <p>Loading customer details…</p>
          <div
            className="customers-workspace__detail-placeholder"
            aria-hidden="true"
          />
          <div
            className="customers-workspace__detail-placeholder"
            aria-hidden="true"
          />
          <div
            className="customers-workspace__detail-placeholder"
            aria-hidden="true"
          />
        </div>
      ) : query.isError && !details ? (
        <div className="customers-workspace__message" role="alert">
          <p>Could not load customer details.</p>
          <RetryButton
            onClick={() => query.refetch()}
            loading={query.isFetching}
          />
        </div>
      ) : details ? (
        <div className="customers-workspace__detail-content">
          <dl className="customers-workspace__details">
            <div>
              <dt>Email</dt>
              <dd>{details.email}</dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>{details.phone || 'Not provided'}</dd>
            </div>
            <div>
              <dt>Orders</dt>
              <dd>{details.ordersCount}</dd>
            </div>
            <div>
              <dt>Total spent</dt>
              <dd>{formatMoney(details.totalSpent)}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{suspended ? 'Suspended' : 'Active'}</dd>
            </div>
          </dl>

          <section className="customers-workspace__detail-section">
            <h3>Addresses</h3>
            {details.addresses.length ? (
              <ul className="customers-workspace__address-list">
                {details.addresses.map((address) => (
                  <li key={address.id}>
                    <strong>
                      {address.fullName}
                      {address.isDefault && ' · Default'}
                    </strong>
                    <span>{address.phone}</span>
                    <span>{formatAddress(address)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No saved addresses.</p>
            )}
          </section>

          <section
            className="customers-workspace__detail-section"
            aria-busy={query.isFetching && !query.isError}
          >
            <h3>Order history</h3>
            {query.isError && (
              <div role="alert">
                <p>Could not refresh orders.</p>
                <RetryButton
                  onClick={() => query.refetch()}
                  loading={query.isFetching}
                />
              </div>
            )}
            {details.orders.length ? (
              <ul className="customers-workspace__order-list">
                {details.orders.map((order) => {
                  const status = ORDER_STATUS_LABELS[order.status]
                  return (
                    <li key={order.id}>
                      <div>
                        <strong title={order.id}>
                          #{order.id.slice(0, 8)}
                        </strong>
                        <span>
                          {new Date(order.createdAt).toLocaleDateString(
                            'en-US',
                          )}
                        </span>
                      </div>
                      <StatusBadge
                        tone={status?.tone ?? 'neutral'}
                        size="compact"
                      >
                        {status?.label ?? order.status}
                      </StatusBadge>
                      <strong>{formatMoney(order.total)}</strong>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p>No orders yet.</p>
            )}
            {details.pagination.totalPages > 1 && (
              <Pagination
                page={page}
                totalPages={details.pagination.totalPages}
                onPageChange={setPage}
              />
            )}
          </section>

          {actionError && !confirming && (
            <p className="customers-workspace__action-error" role="alert">
              {actionError}
            </p>
          )}
          {confirming ? (
            <section className="customers-workspace__confirmation">
              <p>
                {suspended
                  ? `Restore ${details.name}'s access?`
                  : `Suspend ${details.name}'s access? Active sessions will be revoked.`}
              </p>
              {actionError && <p role="alert">{actionError}</p>}
              <div className="customers-workspace__detail-actions">
                <PanelButton
                  variant="cancel"
                  label="Cancel"
                  onClick={() => {
                    setConfirming(false)
                    setActionError('')
                  }}
                  disabled={isSaving}
                />
                <PanelButton
                  variant={suspended ? 'save' : 'danger'}
                  label={suspended ? 'Restore customer' : 'Suspend customer'}
                  loadingLabel={suspended ? 'Restoring…' : 'Suspending…'}
                  loading={isSaving}
                  onClick={changeSuspension}
                />
              </div>
            </section>
          ) : (
            <div className="customers-workspace__detail-actions">
              <PanelButton
                variant={suspended ? 'save' : 'danger'}
                label={suspended ? 'Restore customer' : 'Suspend customer'}
                onClick={() => {
                  setActionError('')
                  setConfirming(true)
                }}
              />
            </div>
          )}
        </div>
      ) : null}
    </Modal>
  )
}
