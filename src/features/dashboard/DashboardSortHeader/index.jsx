import { FaSort, FaSortDown, FaSortUp } from 'react-icons/fa'

export default function DashboardSortHeader({
  field,
  label,
  sortBy,
  sortOrder,
  onSort,
}) {
  const active = sortBy === field
  const Icon = active ? (sortOrder === 'asc' ? FaSortUp : FaSortDown) : FaSort

  return (
    <th
      scope="col"
      aria-sort={
        active ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'
      }
    >
      <button
        type="button"
        className="workspace-controls__sort-button"
        onClick={() => onSort(field)}
      >
        {label} <Icon aria-hidden="true" />
      </button>
    </th>
  )
}
