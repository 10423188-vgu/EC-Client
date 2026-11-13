import './ProductDetailActions.css'
import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { MdCheckCircle, MdCancel } from 'react-icons/md'
import {
  AddToCartButton,
  BuyButton,
  QuantityStepper,
  useQuantityInput,
} from '../../../shared/components'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuthStore } from '../../../entities/user/model'
import { useUpsertCartItem, CART_KEYS } from '../../../entities/cart'
export default function ProductDetailActions({
  variants = [],
  selectedVariant,
  onVariantChange,
}) {
  const [qty, setQty] = useState(1)
  const stock = selectedVariant?.stock ?? 0
  const inStock = stock > 0
  const decrement = useCallback(() => setQty((q) => Math.max(1, q - 1)), [])
  const increment = useCallback(
    () => setQty((q) => Math.min(stock, q + 1)),
    [stock],
  )

  // why: return value tells useQuantityInput whether to trigger the shake (true = typed qty exceeded stock)
  const {
    shake: qtyShake,
    onShakeEnd: onQtyShakeEnd,
    inputProps: qtyInputProps,
  } = useQuantityInput(qty, (num) => {
    const invalid = !num || num < 1
    setQty(invalid ? 1 : Math.min(num, stock))
    return !invalid && num > stock
  })
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { mutate: upsertCartItem, isPending: addingToCart } =
    useUpsertCartItem()
  const { mutate: upsertForBuyNow, isPending: buyingNow } = useUpsertCartItem()

  // why: upsert sets the absolute quantity (not an increment), so the current cart
  // quantity for this variant must be added in before sending it
  const resolveUpsertQty = useCallback(() => {
    const cartItems = queryClient.getQueryData(CART_KEYS.cart) ?? []
    const existing = cartItems.find(
      (item) => item.variant.id === selectedVariant.id,
    )
    return Math.min((existing?.quantity ?? 0) + qty, selectedVariant.stock)
  }, [queryClient, selectedVariant, qty])
  const handleAddToCart = useCallback(() => {
    if (!user) {
      toast.info('Please log in to add to cart')
      return
    }
    if (!selectedVariant) return
    upsertCartItem(
      {
        variantId: selectedVariant.id,
        quantity: resolveUpsertQty(),
      },
      {
        onSuccess: () => toast.success('Added to cart'),
        onError: (err) => {
          const msg = err?.response?.data?.message
          toast.error(msg ?? 'Failed to add to cart')
        },
      },
    )
  }, [user, selectedVariant, upsertCartItem, resolveUpsertQty])

  // why: checkout reads the whole cart, so "Buy Now" = upsert this variant then jump to checkout
  const handleBuyNow = useCallback(() => {
    if (!user) {
      toast.info('Please log in to buy')
      return
    }
    if (!selectedVariant) return
    upsertForBuyNow(
      {
        variantId: selectedVariant.id,
        quantity: resolveUpsertQty(),
      },
      {
        onSuccess: () => navigate('/checkout'),
        onError: (err) => {
          const msg = err?.response?.data?.message
          toast.error(msg ?? 'Failed to buy now')
        },
      },
    )
  }, [user, selectedVariant, upsertForBuyNow, resolveUpsertQty, navigate])
  return (
    <div className="product-detail-actions">
      {variants.length > 0 && (
        <div className="product-detail-actions__section">
          <div className="product-detail-actions__field-header">
            <span className="product-detail-actions__label">Variant</span>
            {selectedVariant && (
              <span className="product-detail-actions__selected-name">
                {selectedVariant.name}
              </span>
            )}
          </div>
          <div className="product-detail-actions__variant-grid">
            {variants.map((v) => (
              <button
                key={v.id}
                type="button"
                title={v.stock === 0 ? 'Out of stock' : v.name}
                className={[
                  'product-detail-actions__variant-button',
                  selectedVariant?.id === v.id &&
                    'product-detail-actions__variant-button--active',
                  (v.stock === 0 || !v.isActive) &&
                    'product-detail-actions__variant-button--unavailable',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => v.isActive && onVariantChange(v)}
                disabled={!v.isActive}
              >
                {v.name}
                {v.stock === 0 && v.isActive && (
                  <span className="product-detail-actions__variant-unavailable-indicator" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedVariant && (
        <div className="product-detail-actions__section">
          <div className="product-detail-actions__field-header">
            <span className="product-detail-actions__label">Quantity</span>
            <span
              className={`product-detail-actions__stock${inStock ? ' product-detail-actions__stock--available' : ''}`}
            >
              {inStock ? (
                <MdCheckCircle
                  key={`${selectedVariant.id}-in`}
                  className="product-detail-actions__stock-icon"
                />
              ) : (
                <MdCancel
                  key={`${selectedVariant.id}-out`}
                  className="product-detail-actions__stock-icon"
                />
              )}
              {inStock ? `${stock} in stock` : 'Out of stock'}
            </span>
          </div>
          <QuantityStepper
            size="lg"
            decrementDisabled={qty <= 1}
            incrementDisabled={qty >= stock || !inStock}
            inputProps={{
              ...qtyInputProps,
              disabled: !inStock,
            }}
            onDecrement={decrement}
            onIncrement={increment}
            onShakeEnd={onQtyShakeEnd}
            editable
            shake={qtyShake}
          />
        </div>
      )}

      <div className="product-detail-actions__buttons">
        <BuyButton
          onClick={handleBuyNow}
          disabled={!selectedVariant || !inStock || buyingNow}
        />
        <AddToCartButton
          onClick={handleAddToCart}
          fullWidth
          disabled={!selectedVariant || !inStock || addingToCart}
        />
      </div>
    </div>
  )
}
