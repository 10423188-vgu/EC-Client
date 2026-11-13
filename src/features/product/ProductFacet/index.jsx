import './ProductFacet.css'
import './ProductFacetSkeleton.css'
import { useState } from 'react'
import * as Slider from '@radix-ui/react-slider'
import { FaCheck } from 'react-icons/fa'
import { formatLib } from '../../../shared/utils'
import { RetryButton, SearchField } from '../../../shared/components'
import '../../../shared/styles/skeleton.css'
import { useProductFacet } from './useProductFacet'
import {
  FacetCategoriesSkeleton,
  FacetPriceSkeleton,
} from './ProductFacetSkeleton'
function FacetSearch({ onSearch }) {
  return (
    <section className="product-facet__section">
      <h3 className="product-facet__section-title">Search</h3>
      <SearchField
        type="text"
        placeholder="Search products..."
        onSearch={onSearch}
        ariaLabel="Search products"
      />
    </section>
  )
}
function FacetCategories({
  categories = [],
  loading,
  isError,
  isFetching,
  onRetry,
  selected,
  onToggle,
}) {
  return (
    <section className="product-facet__section">
      <h3 className="product-facet__section-title">Category</h3>
      {isError && (
        <div className="product-facet__error" role="alert">
          <p>
            {categories.length
              ? "Couldn't refresh categories. Showing current filters."
              : "Couldn't load categories."}
          </p>
          <RetryButton onClick={onRetry} loading={isFetching} />
        </div>
      )}
      {loading ? (
        <FacetCategoriesSkeleton />
      ) : categories.length > 0 ? (
        <ul className="product-facet__list">
          {categories.map((c) => {
            const active = selected.includes(c.slug)
            return (
              <li key={c.id ?? c._id ?? c.slug}>
                <button
                  type="button"
                  className={`product-facet__category-button${active ? ' product-facet__category-button--active' : ''}`}
                  onClick={() => onToggle(c.slug)}
                >
                  <span className="product-facet__category-label-group">
                    <span className="product-facet__category-indicator">
                      {active && (
                        <FaCheck className="product-facet__category-indicator-icon" />
                      )}
                    </span>
                    <span>{c.name}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </section>
  )
}

// why: only commits on blur/Enter so the filter doesn't fire on every keystroke
function PriceInput({ value, onCommit, className }) {
  const [text, setText] = useState(String(value))
  const [focused, setFocused] = useState(false)

  // why: skips while focused so an external value change (e.g. slider drag) doesn't clobber what the user is typing
  const [prevValue, setPrevValue] = useState(value)
  if (!focused && prevValue !== value) {
    setPrevValue(value)
    setText(String(value))
  }
  const commit = () => {
    onCommit(text)
  }
  return (
    <input
      type="text"
      inputMode="numeric"
      value={focused ? text : formatLib.vndRaw(value)}
      className={className}
      onFocus={() => {
        setFocused(true)
        setText(String(value))
      }}
      onBlur={() => {
        setFocused(false)
        commit()
      }}
      onChange={(e) => setText(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur()
      }}
    />
  )
}
function FacetPrice({
  loading,
  boundsMin,
  boundsMax,
  priceRange,
  handleRangeCommit,
  handleMinInput,
  handleMaxInput,
}) {
  // why: local range drives the slider visual during drag; the committed range stays in the hook
  const [dragRange, setDragRange] = useState(priceRange)
  const [prevRange, setPrevRange] = useState(priceRange)
  if (prevRange[0] !== priceRange[0] || prevRange[1] !== priceRange[1]) {
    setPrevRange(priceRange)
    setDragRange(priceRange)
  }
  return (
    <section className="product-facet__section">
      <h3 className="product-facet__section-title">Price</h3>
      {loading ? (
        <FacetPriceSkeleton />
      ) : (
        <>
          <Slider.Root
            value={dragRange}
            min={boundsMin}
            max={boundsMax}
            step={Math.max(1, Math.round((boundsMax - boundsMin) / 100))}
            className="product-facet__slider"
            onValueChange={setDragRange}
            onValueCommit={handleRangeCommit}
          >
            <Slider.Track className="product-facet__slider-track">
              <Slider.Range className="product-facet__slider-range" />
            </Slider.Track>
            <Slider.Thumb
              className="product-facet__slider-thumb"
              aria-label="Minimum price"
            >
              <span className="product-facet__slider-value" aria-hidden="true">
                ₫ {formatLib.vndRaw(dragRange[0])}
              </span>
            </Slider.Thumb>
            <Slider.Thumb
              className="product-facet__slider-thumb"
              aria-label="Maximum price"
            >
              <span className="product-facet__slider-value" aria-hidden="true">
                ₫ {formatLib.vndRaw(dragRange[1])}
              </span>
            </Slider.Thumb>
          </Slider.Root>

          <div className="product-facet__price-inputs">
            <label className="product-facet__price-field">
              <span className="product-facet__price-currency">₫</span>
              <PriceInput value={priceRange[0]} onCommit={handleMinInput} />
            </label>
            <span className="product-facet__price-separator">To</span>
            <label className="product-facet__price-field">
              <span className="product-facet__price-currency">₫</span>
              <PriceInput value={priceRange[1]} onCommit={handleMaxInput} />
            </label>
          </div>
        </>
      )}
    </section>
  )
}
export default function ProductFacet({
  isOpen,
  onFilterChange,
  aggregations,
  isLoading,
}) {
  const {
    categories,
    loadingCats,
    categoriesError,
    fetchingCategories,
    refetchCategories,
    categorySlugs,
    handleCategoryClick,
    loadingBounds,
    boundsMin,
    boundsMax,
    priceRange,
    handleRangeCommit,
    handleMinInput,
    handleMaxInput,
  } = useProductFacet(onFilterChange, aggregations, isLoading)
  return (
    <aside
      className={`product-facet${isOpen ? '' : ' product-facet--hidden'}`}
      aria-busy={isLoading || loadingCats || loadingBounds}
      aria-label={
        isLoading || loadingCats || loadingBounds
          ? 'Product filters loading'
          : 'Product filters'
      }
    >
      <h2 className="product-facet__title">Filter by</h2>

      <FacetSearch
        onSearch={(value) => onFilterChange({ search: value || undefined })}
      />

      <FacetCategories
        categories={categories}
        onToggle={handleCategoryClick}
        loading={loadingCats}
        isError={categoriesError}
        isFetching={fetchingCategories}
        onRetry={refetchCategories}
        selected={categorySlugs}
      />

      <FacetPrice
        boundsMin={boundsMin}
        boundsMax={boundsMax}
        priceRange={priceRange}
        handleRangeCommit={handleRangeCommit}
        handleMinInput={handleMinInput}
        handleMaxInput={handleMaxInput}
        loading={isLoading || loadingBounds}
      />
    </aside>
  )
}
