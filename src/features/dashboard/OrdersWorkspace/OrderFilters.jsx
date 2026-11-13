import { useRef, useState } from 'react'
import { FaCalendarAlt, FaChevronDown, FaFilter } from 'react-icons/fa'
import { ORDER_STATUS_LABELS } from '../../../entities/order'
import { SearchField, SelectField } from '../../../shared/components'
import DatePresets from './DatePresets'

const FILTERABLE_STATUSES = Object.entries(ORDER_STATUS_LABELS).filter(
  ([status]) => status !== 'PENDING',
)
const PAYMENT_STATUS_LABELS = {
  PENDING: 'Pending',
  COMPLETED: 'Completed',
  PARTIALLY_REFUNDED: 'Partially refunded',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
}

export default function OrderFilters({
  filters,
  resultCount,
  isUpdating,
  updateFailed,
  onChange,
}) {
  const dateFromRef = useRef(null)
  const dateToRef = useRef(null)
  const [searchResetKey, setSearchResetKey] = useState(0)
  const [areMoreFiltersOpen, setAreMoreFiltersOpen] = useState(false)
  const activeExtraFilterCount = [
    filters.overdue,
    filters.paymentStatus,
    filters.dateFrom,
    filters.dateTo,
  ].filter(Boolean).length
  const hasFilters = Boolean(
    filters.search ||
    filters.status ||
    activeExtraFilterCount ||
    filters.sortBy,
  )

  return (
    <header>
      <div className="workspace-controls__filters">
        <SearchField
          type="text"
          name="orderSearch"
          value={filters.search ?? ''}
          placeholder="Order ID, customer or email"
          resetKey={searchResetKey}
          onSearch={(value) => onChange({ search: value })}
          ariaLabel="Search orders"
        />
        <SelectField
          wrapperClassName="workspace-controls__select"
          name="orderStatus"
          value={filters.status}
          onChange={(event) => onChange({ status: event.target.value })}
          aria-label="Order status"
        >
          <option value="">All statuses</option>
          {FILTERABLE_STATUSES.map(([value, item]) => (
            <option key={value} value={value}>
              {item.label}
            </option>
          ))}
        </SelectField>
        <button
          type="button"
          className="workspace-controls__more-filters"
          aria-expanded={areMoreFiltersOpen}
          aria-controls="orders-workspace-advanced-filters"
          onClick={() => setAreMoreFiltersOpen((isOpen) => !isOpen)}
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
        id="orders-workspace-advanced-filters"
        className="workspace-controls__advanced-filters orders-workspace__advanced-filters"
        hidden={!areMoreFiltersOpen}
      >
        <SelectField
          wrapperClassName="workspace-controls__select"
          name="overdue"
          value={filters.overdue ? 'true' : ''}
          onChange={(event) =>
            onChange({ overdue: event.target.value === 'true' })
          }
          aria-label="Order SLA status"
        >
          <option value="">All SLA statuses</option>
          <option value="true">Overdue only</option>
        </SelectField>
        <SelectField
          wrapperClassName="workspace-controls__select"
          name="paymentStatus"
          value={filters.paymentStatus}
          onChange={(event) => onChange({ paymentStatus: event.target.value })}
          aria-label="Payment status"
        >
          <option value="">All payments</option>
          {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </SelectField>
        <fieldset className="orders-workspace__date-range">
          <legend>Date range</legend>
          <label className="orders-workspace__date-field">
            <span>From</span>
            <input
              ref={dateFromRef}
              type="date"
              name="dateFrom"
              value={filters.dateFrom}
              onChange={(event) =>
                onChange({
                  dateFrom: event.target.value,
                  dateTo: filters.dateTo,
                })
              }
            />
            <button
              type="button"
              className="orders-workspace__date-icon"
              onClick={() => dateFromRef.current?.focus()}
              aria-label="Focus start date"
            >
              <FaCalendarAlt aria-hidden="true" />
            </button>
          </label>
          <span className="orders-workspace__date-separator" aria-hidden="true">
            to
          </span>
          <label className="orders-workspace__date-field">
            <span>To</span>
            <input
              ref={dateToRef}
              type="date"
              name="dateTo"
              value={filters.dateTo}
              onChange={(event) =>
                onChange({
                  dateFrom: filters.dateFrom,
                  dateTo: event.target.value,
                })
              }
            />
            <button
              type="button"
              className="orders-workspace__date-icon"
              onClick={() => dateToRef.current?.focus()}
              aria-label="Focus end date"
            >
              <FaCalendarAlt aria-hidden="true" />
            </button>
          </label>
        </fieldset>
        <DatePresets
          dateFrom={filters.dateFrom}
          dateTo={filters.dateTo}
          onChange={onChange}
        />
      </div>
      <div className="workspace-controls__summary" aria-busy={isUpdating}>
        {hasFilters && (
          <button
            type="button"
            className="workspace-controls__clear-filters"
            onClick={() => {
              setSearchResetKey((key) => key + 1)
              onChange({
                status: '',
                paymentStatus: '',
                search: '',
                dateFrom: '',
                dateTo: '',
                datePreset: 'all',
                overdue: '',
                sortBy: '',
                sortOrder: '',
              })
            }}
          >
            Clear filters
          </button>
        )}
        <output>{resultCount} results</output>
        {updateFailed && (
          <span className="workspace-controls__update-error" role="status">
            Update failed; showing previous results
          </span>
        )}
      </div>
    </header>
  )
}
