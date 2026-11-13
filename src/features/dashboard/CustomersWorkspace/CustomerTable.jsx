import { FiEye } from 'react-icons/fi'
import { Checkbox, StatusBadge, UserAvatar } from '../../../shared/components'
import DashboardIconAction from '../DashboardIconAction'
import DashboardSortHeader from '../DashboardSortHeader'

export default function CustomerTable({
  customers,
  selected,
  onToggle,
  onToggleAll,
  onView,
  disabled,
  sortBy,
  sortOrder,
  onSort,
}) {
  const allSelected =
    customers.length > 0 &&
    customers.every((customer) => selected.includes(customer.id))

  return (
    <div
      className="customers-workspace__table-wrapper"
      inert={disabled ? true : undefined}
    >
      <table className="customers-workspace__table">
        <thead>
          <tr>
            <th scope="col" className="customers-workspace__select-cell">
              <Checkbox
                className="workspace-controls__row-checkbox"
                checked={allSelected}
                onChange={onToggleAll}
                aria-label="Select all customers on this page"
              />
            </th>
            <DashboardSortHeader
              field="name"
              label="Customer"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={onSort}
            />
            <DashboardSortHeader
              field="registered"
              label="Registered"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={onSort}
            />
            <th scope="col">Email</th>
            <DashboardSortHeader
              field="orders"
              label="Orders"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={onSort}
            />
            <th scope="col">Status</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr
              key={customer.id}
              aria-selected={selected.includes(customer.id)}
            >
              <td className="customers-workspace__select-cell">
                <Checkbox
                  className="workspace-controls__row-checkbox"
                  checked={selected.includes(customer.id)}
                  onChange={() => onToggle(customer.id)}
                  aria-label={`Select ${customer.name}`}
                />
              </td>
              <td>
                <span className="customers-workspace__identity">
                  <UserAvatar
                    src={customer.avatar}
                    name={customer.name}
                    alt=""
                    className="customers-workspace__avatar"
                  />
                  <strong>{customer.name}</strong>
                </span>
              </td>
              <td>
                {new Date(customer.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </td>
              <td>{customer.email}</td>
              <td>{customer.ordersCount}</td>
              <td>
                <StatusBadge
                  tone={customer.suspendedAt ? 'danger' : 'success'}
                  size="compact"
                >
                  {customer.suspendedAt ? 'Suspended' : 'Active'}
                </StatusBadge>
              </td>
              <td>
                <DashboardIconAction
                  icon={FiEye}
                  label={`View ${customer.name}`}
                  onClick={() => onView(customer)}
                  disabled={disabled}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
