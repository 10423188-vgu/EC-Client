import { FiEdit2, FiTrash2 } from 'react-icons/fi'
import { StatusBadge } from '../../../shared/components'
import DashboardIconAction from '../DashboardIconAction'
import DashboardSortHeader from '../DashboardSortHeader'

export default function CatalogTable({
  records,
  isCategory,
  parents,
  disabled,
  onEdit,
  onDelete,
  sortOrder,
  onSort,
}) {
  const names = new Map(parents.map((parent) => [parent.id, parent.name]))
  return (
    <div
      className="catalog-workspace__table-wrapper"
      inert={disabled ? true : undefined}
    >
      <table className="catalog-workspace__table">
        <thead>
          <tr>
            <DashboardSortHeader
              field="name"
              label="Name"
              sortBy="name"
              sortOrder={sortOrder}
              onSort={onSort}
            />
            <th scope="col">Slug</th>
            {isCategory && <th scope="col">Parent</th>}
            <th scope="col" className="catalog-workspace__count">
              Products
            </th>
            {isCategory && (
              <th scope="col" className="catalog-workspace__count">
                Children
              </th>
            )}
            <th scope="col" className="catalog-workspace__status">
              Status
            </th>
            <th scope="col" className="catalog-workspace__action-cell">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => {
            const image = isCategory ? record.imageUrl : record.logoUrl
            const blocked = record.productCount > 0 || record.childCount > 0
            return (
              <tr key={record.id}>
                <td>
                  <div className="catalog-workspace__identity">
                    {image ? (
                      <img src={image} alt="" loading="lazy" />
                    ) : (
                      <span
                        className="catalog-workspace__initial"
                        aria-hidden="true"
                      >
                        {record.name.slice(0, 1)}
                      </span>
                    )}
                    <strong>{record.name}</strong>
                  </div>
                </td>
                <td>{record.slug}</td>
                {isCategory && (
                  <td>
                    {record.parentId
                      ? (names.get(record.parentId) ?? '—')
                      : 'Root category'}
                  </td>
                )}
                <td className="catalog-workspace__count">
                  {record.productCount}
                </td>
                {isCategory && (
                  <td className="catalog-workspace__count">
                    {record.childCount}
                  </td>
                )}
                <td className="catalog-workspace__status">
                  <StatusBadge
                    size="compact"
                    tone={record.isActive ? 'success' : 'neutral'}
                  >
                    {record.isActive ? 'Active' : 'Inactive'}
                  </StatusBadge>
                </td>
                <td className="catalog-workspace__action-cell">
                  <div className="catalog-workspace__row-actions">
                    <DashboardIconAction
                      icon={FiEdit2}
                      label={`Edit ${record.name}`}
                      onClick={() => onEdit(record)}
                      disabled={disabled}
                    />
                    <span
                      title={
                        blocked
                          ? `Remove product references (including trash)${isCategory ? ' and child categories' : ''} before deleting`
                          : 'Delete unused item'
                      }
                    >
                      <DashboardIconAction
                        icon={FiTrash2}
                        label={`Delete ${record.name}`}
                        danger
                        onClick={() => onDelete(record)}
                        disabled={disabled || blocked}
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
  )
}
