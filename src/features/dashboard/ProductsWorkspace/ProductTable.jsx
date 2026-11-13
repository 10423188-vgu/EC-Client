import {
  FiEdit2,
  FiExternalLink,
  FiTrash2,
  FiRotateCcw,
  FiClock,
} from 'react-icons/fi'
import { Checkbox, StatusBadge } from '../../../shared/components'
import { formatLib } from '../../../shared/utils'
import DashboardIconAction from '../DashboardIconAction'
import DashboardSortHeader from '../DashboardSortHeader'

export default function ProductTable({
  products,
  isFetching,
  isStale,
  selected,
  allSelected,
  setSelected,
  toggleSelection,
  openEditor,
  loadingEditor,
  toggleActive,
  isSaving,
  onDelete,
  onRestore,
  isRestoring,
  isTrash,
  sortBy,
  sortOrder,
  onSort,
  onHistory,
}) {
  const sortProps = { sortBy, sortOrder, onSort }
  return (
    <div
      className="products-workspace__table-wrapper"
      inert={isStale}
      aria-busy={isFetching}
    >
      <table className="products-workspace__table">
        <thead>
          <tr>
            <th scope="col" className="products-workspace__select-cell">
              <Checkbox
                className="workspace-controls__row-checkbox"
                checked={allSelected}
                onChange={() =>
                  setSelected(
                    allSelected ? [] : products.map((product) => product.id),
                  )
                }
                aria-label="Select all products on this page"
              />
            </th>
            <DashboardSortHeader
              field="name"
              label="Product name"
              {...sortProps}
            />
            <th>Category</th>
            <th>Variants</th>
            <DashboardSortHeader field="stock" label="Stock" {...sortProps} />
            <DashboardSortHeader
              field="price"
              label="Base price"
              {...sortProps}
            />
            <th>Status</th>
            {isTrash ? (
              <th>Deleted</th>
            ) : (
              <DashboardSortHeader
                field="updatedAt"
                label="Updated"
                {...sortProps}
              />
            )}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} aria-selected={selected.includes(product.id)}>
              <td className="products-workspace__select-cell">
                <Checkbox
                  className="workspace-controls__row-checkbox"
                  checked={selected.includes(product.id)}
                  onChange={() => toggleSelection(product.id)}
                  aria-label={`Select ${product.name}`}
                />
              </td>
              <td>
                <button
                  type="button"
                  className="products-workspace__product-link"
                  onClick={() => openEditor(product)}
                  disabled={loadingEditor || Boolean(product.deletedAt)}
                >
                  {product.image ? (
                    <img
                      className="products-workspace__image"
                      src={product.image}
                      alt=""
                      loading="lazy"
                    />
                  ) : (
                    <span className="products-workspace__image-placeholder">
                      {product.name[0]}
                    </span>
                  )}
                  <span>
                    <strong className="products-workspace__product-name">
                      {product.name}
                    </strong>
                    <small className="products-workspace__product-meta">
                      {product.brandName ?? product.slug}
                    </small>
                  </span>
                </button>
              </td>
              <td>{product.categoryName ?? '—'}</td>
              <td>{product.variantCount}</td>
              <td>
                <span
                  className={`products-workspace__stock${product.stock === 0 ? ' products-workspace__stock--out-of-stock' : product.stock <= 5 ? ' products-workspace__stock--low' : ''}`}
                >
                  {product.stock}
                </span>
              </td>
              <td className="products-workspace__price">
                {product.price == null ? '—' : formatLib.vnd(product.price)}
              </td>
              <td>
                <button
                  type="button"
                  className="products-workspace__status-toggle"
                  onClick={() => toggleActive(product)}
                  disabled={isSaving || Boolean(product.deletedAt)}
                  aria-label={`Toggle status of ${product.name}`}
                >
                  <StatusBadge
                    size="compact"
                    tone={
                      product.deletedAt
                        ? 'neutral'
                        : product.isActive
                          ? 'success'
                          : 'neutral'
                    }
                  >
                    {product.deletedAt
                      ? 'Deleted'
                      : product.isActive
                        ? 'Active'
                        : 'Inactive'}
                  </StatusBadge>
                </button>
              </td>
              <td>
                {new Date(
                  product.deletedAt ?? product.updatedAt,
                ).toLocaleDateString('en-GB')}
              </td>
              <td>
                <div className="products-workspace__actions">
                  <DashboardIconAction
                    icon={FiClock}
                    label={`Change history of ${product.name}`}
                    onClick={() => onHistory(product)}
                  />
                  {product.deletedAt ? (
                    <DashboardIconAction
                      icon={FiRotateCcw}
                      label={`Restore ${product.name}`}
                      onClick={() => onRestore(product)}
                      disabled={isRestoring}
                    />
                  ) : (
                    <>
                      <DashboardIconAction
                        icon={FiEdit2}
                        label={`Edit ${product.name}`}
                        onClick={() => openEditor(product)}
                        disabled={loadingEditor}
                      />
                      <DashboardIconAction
                        icon={FiExternalLink}
                        label={`View ${product.name}`}
                        href={`/products/${product.id}`}
                      />
                      <DashboardIconAction
                        icon={FiTrash2}
                        label={`Delete ${product.name}`}
                        danger
                        onClick={() => onDelete(product)}
                      />
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!products.length && (
        <p className="products-workspace__message">
          No products match these filters.
        </p>
      )}
    </div>
  )
}
