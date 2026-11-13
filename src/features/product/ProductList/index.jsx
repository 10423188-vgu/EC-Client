import './ProductList.css'
import ProductCard from '../ProductCard'
import { useCallback } from 'react'
import { FaSlidersH } from 'react-icons/fa'
import { SORT_OPTIONS } from '../../../entities/product'
import { useWishlistIds } from '../../../entities/wishlist'
import {
  Pagination,
  RetryButton,
  SelectField,
} from '../../../shared/components'
import { ProductListSkeleton } from './ProductListSkeleton'
export default function ProductList({
  products,
  pagination,
  isLoading,
  isError,
  isFetching,
  isPlaceholderData,
  hasData,
  onRetry,
  params,
  filterOpen,
  onParamsChange,
  onToggleFilter,
}) {
  const { data: wishlistIds = [] } = useWishlistIds(
    products.map((product) => product.id ?? product._id),
  )
  const sortValue = `${params.sortBy}_${params.sortOrder}`
  const gridClass = `product-list__grid${filterOpen ? '' : ' product-list__grid--expanded'}`
  const handleSortChange = useCallback(
    (value) => {
      const parts = value.split('_')
      const sortOrder = parts.pop()
      const sortBy = parts.join('_')
      onParamsChange({
        sortBy,
        sortOrder,
      })
    },
    [onParamsChange],
  )
  return (
    <section className="product-list">
      <div className="product-list__header">
        <div className="product-list__header-controls">
          <button
            type="button"
            title={filterOpen ? 'Hide filters' : 'Show filters'}
            className={`product-list__filter-button${filterOpen ? ' product-list__filter-button--active' : ''}`}
            onClick={onToggleFilter}
          >
            <FaSlidersH size={13} />
            <span>Filter</span>
          </button>
          <span className="product-list__count">
            <strong>
              {isLoading ? (
                <span
                  className="skeleton product-list__count-skeleton"
                  aria-hidden="true"
                />
              ) : (
                (pagination?.total ?? 0)
              )}
            </strong>{' '}
            products found
          </span>
          {isFetching && hasData && (
            <span className="product-list__count" role="status">
              {isPlaceholderData ? 'Updating results…' : 'Refreshing…'}
            </span>
          )}
        </div>
        <div className="product-list__sort-group">
          <SelectField
            value={sortValue}
            className="product-list__sort"
            onChange={(e) => handleSortChange(e.target.value)}
            disabled={isLoading}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </SelectField>
        </div>
      </div>

      {isError && hasData && (
        <div className="product-list__notice" role="alert">
          <p>Could not refresh products. Showing previous results.</p>
          <RetryButton onClick={onRetry} loading={isFetching} />
        </div>
      )}
      {isError && !hasData ? (
        <div
          className="product-list__empty product-list__empty--error"
          role="alert"
        >
          <p>Could not load products.</p>
          <RetryButton onClick={onRetry} loading={isFetching} />
        </div>
      ) : isLoading ? (
        <ProductListSkeleton filterOpen={filterOpen} />
      ) : products.length === 0 ? (
        <div className="product-list__empty">No products found.</div>
      ) : (
        <div className={gridClass}>
          {products.map((p) => (
            <ProductCard
              key={p._id ?? p.id}
              product={p}
              isWishlisted={wishlistIds.includes(p.id ?? p._id)}
            />
          ))}
        </div>
      )}

      <Pagination
        page={params.page}
        totalPages={pagination?.totalPages ?? 1}
        onPageChange={(page) => onParamsChange({ page })}
      />
    </section>
  )
}
