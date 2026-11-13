import './ProductList.css'
import { ProductCardSkeleton } from '../../../entities/product'

// why: the user requested a six-card cap for the product loading state.
const SKELETON_COUNT = 6
export function ProductListSkeleton({ filterOpen }) {
  const gridClass = `product-list__grid${filterOpen ? '' : ' product-list__grid--expanded'}`
  return (
    <div
      className={gridClass}
      role="status"
      aria-busy="true"
      aria-label="Products loading"
    >
      {Array.from(
        {
          length: SKELETON_COUNT,
        },
        (_, i) => (
          <ProductCardSkeleton key={i} />
        ),
      )}
    </div>
  )
}
