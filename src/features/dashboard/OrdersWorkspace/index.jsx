import SelectionToolbar from '../SelectionToolbar'
import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { RiDownloadLine, RiPrinterLine } from 'react-icons/ri'
import { Checkbox, Pagination, RetryButton } from '../../../shared/components'
import {
  orderService,
  useAdminOrders,
  useAdminOrderMetrics,
  useAdminUpdateOrderStatus,
  useAdminCancelOrder,
  useAdminRefundOrder,
  useAdminExportOrders,
} from '../../../entities/order'
import { useConfirmPayment } from '../../../entities/payment'
import OrderPrintTable from './OrderPrintTable'
import OrderDetails from './OrderDetails'
import OrderFilters from './OrderFilters'
import OrderOverview from './OrderOverview'
import OrderRefundConfirm from './OrderRefundConfirm'
import OrderRow from './OrderRow'
import OrderStatusConfirm from './OrderStatusConfirm'
import DashboardWorkspaceSkeleton from '../DashboardWorkspaceSkeleton'
import {
  OrdersOverviewSkeleton,
  OrdersTableSkeleton,
} from './OrdersWorkspaceSkeleton'
import DashboardSortHeader from '../DashboardSortHeader'
import '../workspaceControls.css'
import './OrdersWorkspace.css'

const PAGE_LIMIT = 10
const POLL_MS = 5000
const METRICS_POLL_MS = 30000
const PRINT_LIMIT = 200
const SELECTION_LIMIT = 2000

export default function OrdersWorkspace() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const status = searchParams.get('status') ?? ''
  const paymentStatus = searchParams.get('paymentStatus') ?? ''
  const search = searchParams.get('search') ?? ''
  const dateFrom = searchParams.get('dateFrom') ?? ''
  const dateTo = searchParams.get('dateTo') ?? ''
  const overdue = searchParams.get('overdue') === 'true'
  const sortBy = searchParams.get('sortBy') ?? ''
  const sortOrder = searchParams.get('sortOrder') ?? 'desc'
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [selection, setSelection] = useState({ key: '', ids: [] })
  const [printOrders, setPrintOrders] = useState([])
  const [isLoadingSelected, setIsLoadingSelected] = useState(false)
  const [pendingUpdate, setPendingUpdate] = useState(null)
  const [pendingRefund, setPendingRefund] = useState(null)
  const metricsFilters = {
    status: status || undefined,
    paymentStatus: paymentStatus || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    overdue: overdue || undefined,
  }
  const filters = {
    ...metricsFilters,
    search: search || undefined,
  }
  // why: selection spans pages, but a browser Back/Forward filter change must
  // not expose orders selected under a different result set.
  const selectionKey = JSON.stringify({ ...filters, sortBy, sortOrder })
  const selectedOrders = selection.key === selectionKey ? selection.ids : []
  useEffect(() => {
    setSelection((current) =>
      current.key !== selectionKey && current.ids.length
        ? { key: selectionKey, ids: [] }
        : current,
    )
  }, [selectionKey])
  const setSelectedOrders = (update) =>
    setSelection((current) => ({
      key: selectionKey,
      ids:
        typeof update === 'function'
          ? update(current.key === selectionKey ? current.ids : [])
          : update,
    }))
  const updateFilters = (updates) => {
    const next = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(updates)) {
      if (value) next.set(key, String(value))
      else next.delete(key)
    }
    if (
      ('dateFrom' in updates || 'dateTo' in updates) &&
      !('datePreset' in updates)
    ) {
      next.delete('datePreset')
    }
    if (!('page' in updates)) next.delete('page')
    if (!('page' in updates)) setSelectedOrders([])
    setSearchParams(next)
  }
  const handleSort = (field) => {
    const nextOrder =
      sortBy === field
        ? sortOrder === 'asc'
          ? 'desc'
          : 'asc'
        : field === 'customerName'
          ? 'asc'
          : 'desc'
    updateFilters({ sortBy: field, sortOrder: nextOrder })
  }
  const { data, isLoading, isFetching, isPlaceholderData, isError, refetch } =
    useAdminOrders(
      {
        page,
        limit: PAGE_LIMIT,
        ...filters,
        sortBy: sortBy || undefined,
        sortOrder: sortBy ? sortOrder : undefined,
      },
      { refetchInterval: status === 'AWAITING_PAYMENT' ? POLL_MS : undefined },
    )
  const {
    data: metrics,
    isLoading: isMetricsLoading,
    isError: isMetricsError,
    isFetching: isMetricsFetching,
    refetch: refetchMetrics,
  } = useAdminOrderMetrics(metricsFilters, {
    refetchInterval:
      status === 'AWAITING_PAYMENT' ? METRICS_POLL_MS : undefined,
  })
  const { mutate: confirmPayment, isPending: isConfirming } =
    useConfirmPayment()
  const { mutate: updateStatus, isPending: isUpdating } =
    useAdminUpdateOrderStatus()
  const { mutate: cancelOrder, isPending: isCancelling } = useAdminCancelOrder()
  const { mutate: refundOrder, isPending: isRefunding } = useAdminRefundOrder()
  const { mutateAsync: exportOrders, isPending: isExporting } =
    useAdminExportOrders()
  const orders = data?.data ?? []
  const selectedOrderIds = new Set(selectedOrders)
  const allVisibleOrdersSelected =
    orders.length > 0 && orders.every((order) => selectedOrderIds.has(order.id))
  const totalPages = data?.pagination?.totalPages ?? 1
  const showOrdersError = isError && !data
  const isUpdatingOrders = isFetching && isPlaceholderData
  const orderUpdateFailed = isError && Boolean(data)
  const handleConfirmUpdate = (reason) => {
    if (!pendingUpdate) return
    const { operation, order, targetStatus } = pendingUpdate
    if (operation === 'cancel') {
      cancelOrder(
        {
          id: order.id,
          reason,
        },
        {
          onSuccess: () => {
            toast.success('Order cancelled')
            setPendingUpdate(null)
          },
          onError: (error) =>
            toast.error(
              error.response?.data?.message ?? 'Failed to cancel order',
            ),
        },
      )
      return
    }
    if (order.status === 'AWAITING_PAYMENT' && targetStatus === 'PAID') {
      confirmPayment(order.id, {
        onSuccess: () => {
          toast.success('Payment confirmed')
          setPendingUpdate(null)
        },
        onError: (error) =>
          toast.error(
            error.response?.data?.message ?? 'Failed to confirm payment',
          ),
      })
      return
    }
    updateStatus(
      {
        id: order.id,
        status: targetStatus,
        reason: reason || undefined,
      },
      {
        onSuccess: () => {
          toast.success(`Order marked ${targetStatus.toLowerCase()}`)
          setPendingUpdate(null)
        },
        onError: (error) =>
          toast.error(
            error.response?.data?.message ?? 'Failed to update order',
          ),
      },
    )
  }
  const handleConfirmRefund = (refund) => {
    if (!pendingRefund) return
    refundOrder(
      {
        id: pendingRefund.id,
        ...refund,
      },
      {
        onSuccess: () => {
          toast.success('Refund recorded')
          setPendingRefund(null)
        },
        onError: (error) =>
          toast.error(
            error.response?.data?.message ?? 'Failed to record refund',
          ),
      },
    )
  }
  const handleExport = async (exportAllOrders = false, ids) => {
    if (isExporting || isUpdatingOrders || orderUpdateFailed) return
    try {
      const csv = await exportOrders({
        filters: exportAllOrders ? {} : filters,
        ids,
      })
      const downloadUrl = URL.createObjectURL(csv)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `orders-${ids ? 'selected' : exportAllOrders ? 'all' : 'filtered'}-${new Date().toISOString().slice(0, 10)}.csv`
      link.click()
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 0)
    } catch (error) {
      let message = error.response?.data?.message
      if (error.response?.data instanceof Blob) {
        try {
          message = JSON.parse(await error.response.data.text()).message
        } catch {
          // why: interrupted CSV downloads may not have a JSON error body.
        }
      }
      toast.error(message ?? 'Failed to export orders')
    }
  }
  useEffect(() => {
    const finishPrinting = () => setPrintOrders([])
    window.addEventListener('afterprint', finishPrinting)
    return () => window.removeEventListener('afterprint', finishPrinting)
  }, [])
  const handleToggleOrder = (order) => {
    if (
      !selectedOrderIds.has(order.id) &&
      selectedOrders.length >= SELECTION_LIMIT
    )
      return toast.error(
        'Select up to 2,000 orders. Use filtered export for more.',
      )
    setSelectedOrders((current) =>
      current.includes(order.id)
        ? current.filter((id) => id !== order.id)
        : [...current, order.id],
    )
  }
  const handleToggleVisibleOrders = () => {
    if (
      !allVisibleOrdersSelected &&
      new Set([...selectedOrders, ...orders.map((order) => order.id)]).size >
        SELECTION_LIMIT
    )
      return toast.error(
        'Select up to 2,000 orders. Use filtered export for more.',
      )
    setSelectedOrders((current) => {
      const visibleIds = new Set(orders.map((order) => order.id))
      if (allVisibleOrdersSelected) {
        return current.filter((id) => !visibleIds.has(id))
      }
      return [...new Set([...current, ...visibleIds])]
    })
  }
  const loadSelectedOrders = async () => {
    if (selectedOrders.length > PRINT_LIMIT)
      throw new Error(
        'Print up to 200 orders at a time. Use CSV export for larger selections.',
      )
    const response = await orderService.adminSelected(selectedOrders)
    const result = response.data.data
    if (result.length !== selectedOrders.length) {
      throw new Error('Some selected orders are unavailable. Refresh the list.')
    }
    return result
  }
  const handleExportSelected = () => handleExport(false, selectedOrders)
  const handlePrintSelected = async () => {
    if (isLoadingSelected || isUpdatingOrders || orderUpdateFailed) return
    setIsLoadingSelected(true)
    try {
      const selected = await loadSelectedOrders()
      // why: print reads the DOM immediately; commit all selected pages first.
      flushSync(() => setPrintOrders(selected))
      window.print()
    } catch (error) {
      setPrintOrders([])
      toast.error(error.response?.data?.message ?? error.message)
    } finally {
      setIsLoadingSelected(false)
    }
  }
  if (isLoading && isMetricsLoading) {
    return <DashboardWorkspaceSkeleton section="orders" />
  }
  if (isLoading) {
    return (
      <div className="orders-workspace workspace-controls">
        <OrdersTableSkeleton />
        <OrderOverview
          metrics={metrics}
          isError={isMetricsError}
          isFetching={isMetricsFetching}
          onRetry={refetchMetrics}
        />
      </div>
    )
  }
  return (
    <>
      <div className="orders-workspace workspace-controls">
        <section className="orders-workspace__table-panel">
          <OrderFilters
            filters={{
              status,
              paymentStatus,
              search,
              dateFrom,
              dateTo,
              overdue,
              sortBy,
            }}
            resultCount={data?.pagination?.total ?? 0}
            isUpdating={isUpdatingOrders}
            updateFailed={orderUpdateFailed}
            onChange={updateFilters}
          />
          {showOrdersError && (
            <div className="orders-workspace__error">
              <p>Could not load orders.</p>
              <RetryButton onClick={() => refetch()} loading={isFetching} />
            </div>
          )}
          {!showOrdersError && !orders.length && (
            <p className="orders-workspace__message">No orders found.</p>
          )}
          {!showOrdersError && (
            <div
              className="orders-workspace__table-wrapper"
              inert={isUpdatingOrders || orderUpdateFailed}
              aria-busy={isFetching}
            >
              <table className="orders-workspace__table">
                <thead>
                  <tr>
                    <th scope="col" className="orders-workspace__select-cell">
                      <Checkbox
                        className="workspace-controls__row-checkbox"
                        checked={allVisibleOrdersSelected}
                        onChange={handleToggleVisibleOrders}
                        aria-label="Select all orders on this page"
                      />
                    </th>
                    <th>Order</th>
                    <DashboardSortHeader
                      field="customerName"
                      label="Customer"
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      onSort={handleSort}
                    />
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Items</th>
                    <DashboardSortHeader
                      field="total"
                      label="Total"
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      onSort={handleSort}
                    />
                    <th>Date</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <OrderRow
                      key={order.id}
                      order={order}
                      isSelected={selectedOrderIds.has(order.id)}
                      onToggleSelection={handleToggleOrder}
                      onRequestUpdate={setPendingUpdate}
                      onRequestRefund={setPendingRefund}
                      onView={setSelectedOrderId}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!showOrdersError && (
            <Pagination
              className="orders-workspace__pagination"
              page={page}
              totalPages={totalPages}
              onPageChange={(nextPage) => updateFilters({ page: nextPage })}
            />
          )}
          {data?.pagination?.isLimited && (
            <p className="orders-workspace__message">
              Narrow your filters to browse more orders, or export all matching
              results.
            </p>
          )}
        </section>
        {isMetricsLoading ? (
          <OrdersOverviewSkeleton />
        ) : (
          <OrderOverview
            metrics={metrics}
            isError={isMetricsError}
            isFetching={isMetricsFetching}
            onRetry={refetchMetrics}
          />
        )}
      </div>
      {selectedOrders.length > 0 && (
        <SelectionToolbar
          count={selectedOrders.length}
          onClear={() => setSelectedOrders([])}
          clearLabel="Clear selected orders"
          ariaLabel="Selected order actions"
          moreLabel="More export options"
          actions={[
            {
              id: 'export',
              label: 'Export selected',
              icon: RiDownloadLine,
              onClick: handleExportSelected,
              disabled:
                isLoadingSelected ||
                isExporting ||
                isUpdatingOrders ||
                orderUpdateFailed,
            },
            {
              id: 'print',
              label: 'Print',
              icon: RiPrinterLine,
              onClick: handlePrintSelected,
              disabled:
                isLoadingSelected || isUpdatingOrders || orderUpdateFailed,
            },
          ]}
          menuActions={[
            {
              id: 'filtered',
              label: 'Export current filtered results',
              onClick: () => handleExport(false),
              disabled: isExporting || isUpdatingOrders || orderUpdateFailed,
            },
            {
              id: 'all',
              label: 'Export all orders',
              onClick: () => handleExport(true),
              disabled: isExporting || isUpdatingOrders || orderUpdateFailed,
            },
          ]}
        />
      )}
      {printOrders.length > 0 && <OrderPrintTable orders={printOrders} />}
      {selectedOrderId && (
        <OrderDetails
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
        />
      )}
      {pendingUpdate && (
        <OrderStatusConfirm
          action={pendingUpdate}
          onCancel={() => setPendingUpdate(null)}
          onConfirm={handleConfirmUpdate}
          isPending={isConfirming || isUpdating || isCancelling}
        />
      )}
      {pendingRefund && (
        <OrderRefundConfirm
          order={pendingRefund}
          onCancel={() => setPendingRefund(null)}
          onConfirm={handleConfirmRefund}
          isPending={isRefunding}
        />
      )}
    </>
  )
}
