import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { FaChevronDown, FaFilter } from 'react-icons/fa'
import { RiDownloadLine } from 'react-icons/ri'
import { toast } from 'sonner'
import {
  useAdminCustomers,
  useAdminCustomerOverview,
  userService,
} from '../../../entities/user'
import {
  CreateButton,
  Pagination,
  SearchField,
  SelectField,
  RetryButton,
} from '../../../shared/components'
import SelectionToolbar from '../SelectionToolbar'
import CustomerOverview from './CustomerOverview'
import CustomerTable from './CustomerTable'
import CustomerCreateModal from './CustomerCreateModal'
import CustomerDetails from './CustomerDetails'
import { DASHBOARD_PERIOD_DAYS } from '../dashboardPeriodDays'
import DashboardWorkspaceSkeleton from '../DashboardWorkspaceSkeleton'
import { CustomersListSkeleton } from './CustomersWorkspaceSkeleton'
import '../workspaceControls.css'
import './CustomersWorkspace.css'

export default function CustomersWorkspace() {
  const [params, setParams] = useSearchParams()
  const queryClient = useQueryClient()
  const page = Math.max(1, Number(params.get('customerPage')) || 1)
  const limit = Number(params.get('customerLimit')) || 10
  const search = params.get('customerSearch') ?? ''
  const status = params.get('customerStatus') ?? ''
  const requestedSortBy = params.get('customerSortBy')
  const sortBy = ['name', 'orders'].includes(requestedSortBy)
    ? requestedSortBy
    : 'registered'
  const sortOrder = params.get('customerSort') === 'asc' ? 'asc' : 'desc'
  const [days, setDays] = useState(7)
  const [selection, setSelection] = useState({ key: '', ids: [] })
  const [viewing, setViewing] = useState(null)
  const [creating, setCreating] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [areMoreFiltersOpen, setAreMoreFiltersOpen] = useState(false)
  const filters = {
    page,
    limit,
    search: search || undefined,
    status: status || undefined,
    sortBy,
    sortOrder,
  }
  const selectionKey = JSON.stringify(filters)
  const selected = selection.key === selectionKey ? selection.ids : []
  // why: browser Back/Forward bypasses updateFilters, so clear stale selection
  // after the active page or filters change.
  useEffect(() => {
    setSelection((current) =>
      current.key !== selectionKey && current.ids.length
        ? { key: selectionKey, ids: [] }
        : current,
    )
  }, [selectionKey])
  const setSelected = (update) =>
    setSelection((current) => ({
      key: selectionKey,
      ids:
        typeof update === 'function'
          ? update(current.key === selectionKey ? current.ids : [])
          : update,
    }))
  const list = useAdminCustomers(filters)
  const overview = useAdminCustomerOverview(days)
  const customers = list.data?.data ?? []
  const pagination = list.data?.pagination
  const stale = list.isPlaceholderData || list.isError
  const activeExtraFilterCount =
    sortBy !== 'registered' || sortOrder !== 'desc' ? 1 : 0
  const hasFilters = Boolean(search || status || activeExtraFilterCount)

  const updateFilters = (updates) => {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(updates)) {
      if (value) next.set(key, String(value))
      else next.delete(key)
    }
    if (!('customerPage' in updates)) next.delete('customerPage')
    setSelected([])
    setParams(next)
  }
  const updateSort = (field) =>
    updateFilters({
      customerSortBy: field,
      customerSort:
        sortBy === field
          ? sortOrder === 'asc'
            ? 'desc'
            : 'asc'
          : field === 'name'
            ? 'asc'
            : 'desc',
    })

  const toggleSelected = (id) =>
    setSelected((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    )

  const toggleAll = () => {
    const pageIds = customers.map((customer) => customer.id)
    setSelected((current) =>
      pageIds.every((id) => current.includes(id)) ? [] : pageIds,
    )
  }

  const downloadCsv = async (ids) => {
    if (isExporting || stale) return
    setIsExporting(true)
    try {
      const response = await userService.exportAdminCustomers(
        {
          search: search || undefined,
          status: status || undefined,
          sortBy,
          sortOrder,
        },
        ids,
      )
      const url = URL.createObjectURL(response.data)
      const link = document.createElement('a')
      link.href = url
      link.download = `customers-${ids ? 'selected' : 'filtered'}-${new Date().toISOString().slice(0, 10)}.csv`
      link.click()
      setTimeout(() => URL.revokeObjectURL(url), 0)
    } catch (error) {
      let message = error.response?.data?.message
      if (error.response?.data instanceof Blob) {
        try {
          message = JSON.parse(await error.response.data.text()).message
        } catch {
          // why: a disconnected CSV stream may not contain JSON.
        }
      }
      toast.error(message ?? 'Could not export customers')
    } finally {
      setIsExporting(false)
    }
  }
  if (list.isPending && overview.isPending) {
    return <DashboardWorkspaceSkeleton section="customers" />
  }
  if (list.isPending) {
    return (
      <section className="customers-workspace">
        <CustomerOverview days={days} query={overview}>
          <CustomersListSkeleton />
        </CustomerOverview>
      </section>
    )
  }

  return (
    <section className="customers-workspace">
      <CustomerOverview days={days} query={overview}>
        <section
          className="customers-workspace__list-panel"
          aria-label="Customer list"
        >
          <header className="customers-workspace__list-header">
            <div>
              <h2 className="customers-workspace__list-title">
                Customers list
              </h2>
              <p>Search and review customer accounts</p>
            </div>
            <div className="customers-workspace__list-header-actions">
              <SelectField
                value={days}
                wrapperClassName="workspace-controls__select"
                onChange={(event) => setDays(Number(event.target.value))}
                aria-label="Customer overview period"
              >
                {DASHBOARD_PERIOD_DAYS.map((days) => (
                  <option key={days} value={days}>
                    Last {days} days
                  </option>
                ))}
              </SelectField>
              <CreateButton onClick={() => setCreating(true)}>
                Add customer
              </CreateButton>
            </div>
          </header>
          <div className="workspace-controls__filters customers-workspace__filters">
            <SearchField
              value={search}
              onSearch={(value) => updateFilters({ customerSearch: value })}
              placeholder="Search name, email or phone"
              ariaLabel="Search customers"
            />
            <SelectField
              value={status}
              wrapperClassName="workspace-controls__select"
              onChange={(event) =>
                updateFilters({ customerStatus: event.target.value })
              }
              aria-label="Filter customer status"
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </SelectField>
            <button
              type="button"
              className="workspace-controls__more-filters"
              onClick={() => setAreMoreFiltersOpen((isOpen) => !isOpen)}
              aria-expanded={areMoreFiltersOpen}
              aria-controls="customers-workspace-advanced-filters"
            >
              <FaFilter aria-hidden="true" />
              <span>More filters</span>
              {activeExtraFilterCount > 0 && (
                <span className="workspace-controls__filter-count">
                  {activeExtraFilterCount}
                </span>
              )}
              <FaChevronDown aria-hidden="true" />
            </button>
          </div>
          <div
            id="customers-workspace-advanced-filters"
            className="workspace-controls__advanced-filters customers-workspace__advanced-filters"
            hidden={!areMoreFiltersOpen}
          >
            <SelectField
              value={`${sortBy}:${sortOrder}`}
              wrapperClassName="workspace-controls__select"
              onChange={(event) => {
                const [nextSortBy, nextSortOrder] =
                  event.target.value.split(':')
                updateFilters({
                  customerSortBy: nextSortBy,
                  customerSort: nextSortOrder,
                })
              }}
              aria-label="Sort customers"
            >
              <option value="registered:desc">Newest registered</option>
              <option value="registered:asc">Oldest registered</option>
              <option value="name:asc">Name A–Z</option>
              <option value="name:desc">Name Z–A</option>
              <option value="orders:desc">Most orders</option>
              <option value="orders:asc">Fewest orders</option>
            </SelectField>
            {hasFilters && (
              <button
                type="button"
                className="workspace-controls__clear-filters"
                onClick={() =>
                  updateFilters({
                    customerSearch: '',
                    customerStatus: '',
                    customerSortBy: '',
                    customerSort: '',
                  })
                }
              >
                Clear filters
              </button>
            )}
          </div>
          {selected.length > 0 && (
            <SelectionToolbar
              count={selected.length}
              onClear={() => setSelected([])}
              ariaLabel="Selected customer actions"
              actions={[
                {
                  id: 'export',
                  label: isExporting ? 'Exporting…' : 'Export selected',
                  icon: RiDownloadLine,
                  onClick: () => downloadCsv(selected),
                  disabled: stale || isExporting,
                },
              ]}
              menuActions={[
                {
                  id: 'filtered',
                  label: 'Export current filtered results',
                  onClick: () => downloadCsv(),
                  disabled: stale || isExporting,
                },
              ]}
            />
          )}
          {list.isError && list.data && (
            <div className="customers-workspace__message" role="alert">
              <p>Could not refresh customers. Showing previous results.</p>
              <RetryButton
                onClick={() => list.refetch()}
                loading={list.isFetching}
              />
            </div>
          )}
          {list.isError && !list.data ? (
            <div className="customers-workspace__message" role="alert">
              <p>Could not load customers.</p>
              <RetryButton
                onClick={() => list.refetch()}
                loading={list.isFetching}
              />
            </div>
          ) : customers.length ? (
            <CustomerTable
              customers={customers}
              selected={selected}
              onToggle={toggleSelected}
              onToggleAll={toggleAll}
              onView={setViewing}
              disabled={stale}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={updateSort}
            />
          ) : (
            <p className="customers-workspace__message">
              No customers match these filters.
            </p>
          )}
          <footer className="customers-workspace__footer">
            <Pagination
              page={page}
              totalPages={pagination?.totalPages ?? 0}
              onPageChange={(value) => updateFilters({ customerPage: value })}
            />
            <span>
              Showing {customers.length} of {pagination?.total ?? 0}
            </span>
            <SelectField
              value={limit}
              wrapperClassName="workspace-controls__select"
              onChange={(event) =>
                updateFilters({ customerLimit: event.target.value })
              }
              aria-label="Customers per page"
            >
              {[10, 20, 50].map((value) => (
                <option key={value} value={value}>
                  Show {value}
                </option>
              ))}
            </SelectField>
          </footer>
        </section>
      </CustomerOverview>

      {viewing && (
        <CustomerDetails customer={viewing} onClose={() => setViewing(null)} />
      )}
      {creating && (
        <CustomerCreateModal
          onClose={() => setCreating(false)}
          onCreated={() => {
            setCreating(false)
            queryClient.invalidateQueries({ queryKey: ['adminCustomers'] })
            queryClient.invalidateQueries({
              queryKey: ['adminCustomerOverview'],
            })
          }}
        />
      )}
    </section>
  )
}
