import { useCategories } from '../../../entities/category'
import { useProducts } from '../../../entities/product'
import { HOME_FEATURED_PRODUCT_LIMIT } from '../constants'

export function useHome() {
  // why: the pinned home gallery shows five categories; the product page lists the rest.
  const categories = useCategories({ limit: 5 })
  const featuredProducts = useProducts({
    onSale: true,
    limit: HOME_FEATURED_PRODUCT_LIMIT,
  })

  return { categories, featuredProducts }
}
