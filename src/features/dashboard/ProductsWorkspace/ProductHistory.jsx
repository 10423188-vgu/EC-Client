import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminProductService } from '../../../entities/product'
import { Pagination, RetryButton } from '../../../shared/components'
import { buildHistoryDiff } from './productHistoryDiff'
import './ProductHistory.css'

const FIELD_LABELS = {
  name: 'Name',
  slug: 'Slug',
  description: 'Description',
  categoryId: 'Category ID',
  categoryName: 'Category',
  brandId: 'Brand ID',
  brandName: 'Brand',
  tags: 'Tags',
  attributes: 'Specifications',
  images: 'Images',
  isActive: 'Active',
  isFeatured: 'Featured',
  deletedAt: 'Deleted at',
  sku: 'SKU',
  price: 'Price',
  salePrice: 'Sale price',
  weight: 'Weight',
  options: 'Options',
}
const valueText = (value) =>
  value == null
    ? '—'
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : typeof value === 'boolean'
        ? value
          ? 'Yes'
          : 'No'
        : String(value)
const ACTION_LABELS = {
  created: 'Product created',
  updated: 'Product updated',
  trashed: 'Product moved to trash',
  restored: 'Product restored',
  'variant.created': 'Variant created',
  'variant.updated': 'Variant updated',
  'variant.trashed': 'Variant moved to trash',
  'variant.restored': 'Variant restored',
  'bulk.activate': 'Activated in bulk',
  'bulk.deactivate': 'Deactivated in bulk',
  'bulk.trash': 'Moved to trash in bulk',
  'bulk.restore': 'Restored in bulk',
}
const fieldLabel = (field, variants = []) => {
  const parts = field.split('.')
  const variant = variants.find((entry) => entry.id === parts[1])
  return parts[0] === 'variants'
    ? `Variant ${variant?.sku ?? parts[1].slice(0, 8)} · ${FIELD_LABELS[parts[2]] ?? parts[2]}`
    : (FIELD_LABELS[field] ?? field)
}

function HistoryChange({ change, variants }) {
  const [isOpen, setIsOpen] = useState(false)
  const diff = isOpen
    ? buildHistoryDiff(valueText(change.before), valueText(change.after))
    : null

  return (
    <details
      className="product-history__change"
      onToggle={(event) => setIsOpen(event.currentTarget.open)}
    >
      <summary>{fieldLabel(change.field, variants)}</summary>
      {diff && (
        <div className="product-history__values">
          {['before', 'after'].map((side) => (
            <div key={side}>
              <strong>{side === 'before' ? 'Before' : 'After'}</strong>
              <pre>
                {diff[side].map((line, index) => (
                  <span
                    key={index}
                    className={`product-history__line${line.changed ? ` product-history__line--${side === 'before' ? 'removed' : 'added'}` : ''}`}
                  >
                    <span
                      className="product-history__marker"
                      aria-hidden="true"
                    >
                      {line.changed ? (side === 'before' ? '−' : '+') : ' '}
                    </span>
                    <span>{line.text || '\u00a0'}</span>
                  </span>
                ))}
              </pre>
            </div>
          ))}
        </div>
      )}
    </details>
  )
}

export default function ProductHistory({ productId }) {
  const [page, setPage] = useState(1)
  const query = useQuery({
    queryKey: ['admin-products', 'history', productId, page],
    queryFn: ({ signal }) =>
      adminProductService.history(productId, page, signal),
  })
  return (
    <section className="product-history" aria-label="Product change history">
      <p className="product-history__note">
        Changes are recorded from when this feature was enabled. Stock
        adjustments have their own inventory history.
      </p>
      <p className="product-history__legend">
        <span className="product-history__legend-removed">
          − Removed / old value
        </span>
        <span className="product-history__legend-added">
          + Added / new value
        </span>
      </p>
      {query.isLoading ? (
        <p>Loading change history…</p>
      ) : query.isError ? (
        <RetryButton
          label="Retry change history"
          onClick={() => query.refetch()}
          loading={query.isFetching}
        />
      ) : (
        <>
          {!query.data.data.length && <p>No changes recorded yet.</p>}
          {query.data.data.map((entry) => (
            <article key={entry._id} className="product-history__entry">
              <header>
                <strong>{ACTION_LABELS[entry.action] ?? entry.action}</strong>
                <span>{entry.changedByName}</span>
                <time dateTime={entry.createdAt}>
                  {new Date(entry.createdAt).toLocaleString()}
                </time>
              </header>
              {entry.changes.map((change) => (
                <HistoryChange
                  key={change.field}
                  change={change}
                  variants={entry.variants}
                />
              ))}
            </article>
          ))}
          <Pagination
            page={page}
            totalPages={query.data.pagination.totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </section>
  )
}
