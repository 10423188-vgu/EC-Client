import { memo, useCallback } from 'react'
import { toast } from 'sonner'
import {
  ProductCard as ProductCardView,
  useCompareStore,
} from '../../../entities/product'
import { useAuthStore } from '../../../entities/user'
import { useToggleWishlist } from '../../../entities/wishlist'
import { useAddToCart } from '../../../entities/cart'

export default memo(function ProductCard({ product, isWishlisted = false }) {
  const { id, name } = product
  const variant = product.variants?.[0]
  const imageUrl = product.images?.[0]?.url ?? variant?.images?.[0]?.url
  const price = variant?.price != null ? Number(variant.price) : null
  const salePrice =
    variant?.salePrice != null ? Number(variant.salePrice) : null
  const user = useAuthStore((s) => s.user)
  const { mutate: toggleWishlist } = useToggleWishlist()
  const { mutate: addToCart, isPending: addingToCart } = useAddToCart()
  const compareToggle = useCompareStore((s) => s.toggle)
  // why: stable selector reference prevents Zustand from re-subscribing on every render
  const isInCompare = useCompareStore(
    useCallback((s) => s.items.some((i) => i.id === id), [id]),
  )
  const handleWishlist = (e) => {
    e.preventDefault()
    if (!user) {
      toast.info('Please log in to add to wishlist')
      return
    }
    toggleWishlist(id, {
      onSuccess: () =>
        toast.success(
          isWishlisted ? 'Removed from wishlist' : 'Added to wishlist',
        ),
      onError: () => toast.error('Something went wrong. Please try again.'),
    })
  }
  const handleCompare = (e) => {
    e.preventDefault()
    const result = compareToggle({
      id,
      name,
      imageUrl,
      price: salePrice ?? price ?? 0,
    })
    if (result?.full) toast.warning('Maximum 4 products to compare')
  }
  const handleAddToCart = (e) => {
    e.preventDefault()
    if (!user) {
      toast.info('Please log in to add to cart')
      return
    }
    if (!variant?.id) return
    addToCart(variant.id, {
      onSuccess: () => toast.success('Added to cart'),
      onError: (err) => {
        const msg = err?.response?.data?.message
        toast.error(msg ?? 'Failed to add to cart')
      },
    })
  }
  return (
    <ProductCardView
      product={product}
      isWishlisted={isWishlisted}
      isInCompare={isInCompare}
      addingToCart={addingToCart}
      onWishlist={handleWishlist}
      onCompare={handleCompare}
      onAddToCart={handleAddToCart}
    />
  )
})
