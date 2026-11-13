import { useQuery } from '@tanstack/react-query'
import { productService } from './product.service'
import { PRODUCT_KEYS } from './product.keys'

const normalizeVariants = (variants = []) =>
  variants.map((v) => ({ ...v, id: v.id ?? v._id }))

const normalizeProduct = (p) => ({
  ...p,
  rating: p.reviewStats?.average ?? p.rating ?? 0,
  variants: normalizeVariants(p.variants ?? []),
})

// why: ES returns flat minPrice/maxPrice with no variants[] — synthesize a variant so ProductCard can read price and images
const normalizeSearchProduct = (p) => {
  if (p.variants?.length) return normalizeProduct(p)
  // NOTE: minOriginalPrice is the raw pre-discount price; minPrice is the effective (post-discount) price
  const originalPrice = p.minOriginalPrice || p.minPrice || 0
  const effectivePrice = p.minPrice || 0
  const hasDiscount =
    originalPrice > 0 && effectivePrice > 0 && originalPrice > effectivePrice
  return {
    ...p,
    rating: p.reviewStats?.average ?? 0,
    images: p.thumbnail ? [{ url: p.thumbnail }] : [],
    variants:
      originalPrice > 0 && p.firstVariantId
        ? [
            {
              id: p.firstVariantId,
              price: originalPrice,
              salePrice: hasDiscount ? effectivePrice : null,
              isActive: true,
              stock: p.inStock ? 1 : 0,
              images: [],
            },
          ]
        : [],
  }
}

export const useProducts = (params) => {
  return useQuery({
    queryKey: PRODUCT_KEYS.list(params),
    queryFn: () =>
      productService.getProducts(params).then((res) => ({
        products: res.data.data.map(normalizeProduct),
        pagination: res.data.pagination,
      })),
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
}

export const useSearch = (params) => {
  return useQuery({
    queryKey: PRODUCT_KEYS.search(params),
    queryFn: () =>
      productService.search(params).then((res) => ({
        products: res.data.data.map(normalizeSearchProduct),
        aggregations: res.data.aggregations ?? null,
        pagination: res.data.pagination,
      })),
    staleTime: 30 * 1000,
    retry: false,
    placeholderData: (prev) => prev,
  })
}

export const useProduct = (id) => {
  return useQuery({
    queryKey: PRODUCT_KEYS.detail(id),
    queryFn: () =>
      productService
        .getProductById(id)
        .then((res) => normalizeProduct(res.data.data)),
    staleTime: 5 * 60 * 1000,
    retry: false,
    enabled: !!id,
  })
}

export const useRelatedProducts = (id) => {
  return useQuery({
    queryKey: PRODUCT_KEYS.related(id),
    queryFn: () =>
      productService
        .getRelatedProducts(id, { limit: 8 })
        .then((res) => res.data.data.map(normalizeProduct)),
    staleTime: 5 * 60 * 1000,
    retry: false,
    enabled: !!id,
  })
}
