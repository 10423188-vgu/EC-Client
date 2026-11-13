import { useState } from 'react'
import { FaChevronDown, FaFilter } from 'react-icons/fa'
import {
  SearchField,
  SelectField,
  SlidingTabs,
} from '../../../shared/components'

const CATALOG_TABS = [
  { value: 'false', label: 'Catalog' },
  { value: 'true', label: 'Trash' },
]

export default function ProductFilters({
  filters,
  categories,
  brands,
  resultCount,
  selectedCount,
  isUpdating,
  updateFailed,
  onChange,
}) {
  const [searchResetKey, setSearchResetKey] = useState(0)
  const [areMoreFiltersOpen, setAreMoreFiltersOpen] = useState(false)
  const activeExtraFilterCount = [
    filters.stock,
    filters.categorySlug,
    filters.brandSlug,
    filters.sortBy !== 'updatedAt' || filters.sortOrder !== 'desc',
  ].filter(Boolean).length
  const hasFilters = Boolean(
    filters.search || filters.status || activeExtraFilterCount,
  )

  return (
    <header>
      <SlidingTabs
        tabs={CATALOG_TABS}
        value={filters.trash}
        className="products-workspace__catalog-tabs"
        onChange={(value) =>
          onChange({
            productTrash: value === 'true' ? value : '',
            productStatus: '',
          })
        }
        stretch
        ariaLabel="Product catalog view"
      />
      {filters.trash === 'true' && (
        <p className="products-workspace__trash-notice">
          Deleted products keep their images, inventory and order history.
          Restore returns them to Inactive; review before activating.
        </p>
      )}
      <div className="workspace-controls__filters">
        <SearchField
          type="text"
          name="productSearch"
          value={filters.search ?? ''}
          placeholder="Product name or SKU"
          resetKey={searchResetKey}
          onSearch={(value) => onChange({ productSearch: value })}
          ariaLabel="Search products"
        />
        <SelectField
          wrapperClassName="workspace-controls__select"
          name="productStatus"
          value={filters.status ?? ''}
          onChange={(event) => onChange({ productStatus: event.target.value })}
          aria-label="Product status"
          disabled={filters.trash === 'true'}
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </SelectField>
        <button
          type="button"
          className="workspace-controls__more-filters"
          onClick={() => setAreMoreFiltersOpen((isOpen) => !isOpen)}
          aria-expanded={areMoreFiltersOpen}
          aria-controls="products-workspace-advanced-filters"
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
        id="products-workspace-advanced-filters"
        className="workspace-controls__advanced-filters products-workspace__advanced-filters"
        hidden={!areMoreFiltersOpen}
      >
        <SelectField
          wrapperClassName="workspace-controls__select"
          name="productStock"
          value={filters.stock ?? ''}
          onChange={(event) => onChange({ productStock: event.target.value })}
          aria-label="Stock filter"
        >
          <option value="">All inventory</option>
          <option value="low">Low stock (1–5)</option>
          <option value="out">Out of stock</option>
        </SelectField>
        <SelectField
          wrapperClassName="workspace-controls__select"
          name="productCategory"
          value={filters.categorySlug ?? ''}
          onChange={(event) =>
            onChange({ productCategory: event.target.value })
          }
          aria-label="Product category"
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </SelectField>
        <SelectField
          wrapperClassName="workspace-controls__select"
          name="productSort"
          value={`${filters.sortBy}:${filters.sortOrder}`}
          onChange={(event) => {
            const [productSort, productSortOrder] =
              event.target.value.split(':')
            onChange({ productSort, productSortOrder })
          }}
          aria-label="Sort products"
        >
          <option value="updatedAt:desc">Recently updated</option>
          <option value="updatedAt:asc">Oldest updated</option>
          <option value="name:asc">Name A–Z</option>
          <option value="name:desc">Name Z–A</option>
          <option value="stock:desc">Highest stock</option>
          <option value="stock:asc">Lowest stock</option>
          <option value="price:desc">Highest price</option>
          <option value="price:asc">Lowest price</option>
        </SelectField>
        <SelectField
          wrapperClassName="workspace-controls__select"
          name="productBrand"
          value={filters.brandSlug ?? ''}
          onChange={(event) => onChange({ productBrand: event.target.value })}
          aria-label="Product brand"
        >
          <option value="">All brands</option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.slug}>
              {brand.name}
            </option>
          ))}
        </SelectField>
      </div>
      <div className="workspace-controls__summary" aria-busy={isUpdating}>
        {hasFilters && (
          <button
            type="button"
            className="workspace-controls__clear-filters"
            onClick={() => {
              setSearchResetKey((key) => key + 1)
              onChange({
                productSearch: '',
                productStatus: '',
                productStock: '',
                productCategory: '',
                productBrand: '',
                productSort: '',
                productSortOrder: '',
              })
            }}
          >
            Clear filters
          </button>
        )}
        {selectedCount > 0 && (
          <span className="products-workspace__selection-count">
            {selectedCount} selected
          </span>
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
