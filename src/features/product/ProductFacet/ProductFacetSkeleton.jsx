import './ProductFacet.css'
import './ProductFacetSkeleton.css'
import '../../../shared/styles/skeleton.css'
import { SearchField } from '../../../shared/components'

// why: match the six categories currently displayed by the product workspace.
const CATEGORY_SKELETON_COUNT = 6

export function FacetCategoriesSkeleton() {
  return (
    <div className="product-facet-skeleton__category-list" aria-hidden="true">
      {Array.from({ length: CATEGORY_SKELETON_COUNT }, (_, index) => (
        <div
          key={index}
          className="skeleton product-facet-skeleton__category-item"
        />
      ))}
    </div>
  )
}

export function FacetPriceSkeleton() {
  return (
    <div className="product-facet-skeleton__price" aria-hidden="true">
      <div className="skeleton product-facet-skeleton__track" />
      <div className="product-facet-skeleton__inputs">
        <div className="skeleton product-facet-skeleton__input" />
        <div className="skeleton product-facet-skeleton__price-separator" />
        <div className="skeleton product-facet-skeleton__input" />
      </div>
    </div>
  )
}

export default function ProductFacetSkeleton() {
  return (
    <aside
      className="product-facet"
      role="status"
      aria-busy="true"
      aria-label="Product filters loading"
    >
      <h2 className="product-facet__title">Filter by</h2>
      <section className="product-facet__section">
        <h3 className="product-facet__section-title">Search</h3>
        <SearchField
          type="text"
          placeholder="Search products..."
          onSearch={() => {}}
          ariaLabel="Search products"
        />
      </section>
      <section className="product-facet__section">
        <h3 className="product-facet__section-title">Category</h3>
        <FacetCategoriesSkeleton />
      </section>
      <section className="product-facet__section">
        <h3 className="product-facet__section-title">Price</h3>
        <FacetPriceSkeleton />
      </section>
    </aside>
  )
}
