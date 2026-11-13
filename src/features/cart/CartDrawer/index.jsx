import './CartDrawer.css'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaTimes, FaShoppingBag } from 'react-icons/fa'
import {
  useCartDrawerStore,
  useCart,
  useUpsertCartItem,
  useRemoveCartItem,
  useClearCart,
  CART_KEYS,
} from '../../../entities/cart'
import {
  BuyButton,
  TrashButton,
  QuantityStepper,
  useQuantityInput,
  ConfirmDialog,
} from '../../../shared/components'
import { formatLib } from '../../../shared/utils'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
const DEBOUNCE_MS = 400
const CartItem = memo(function CartItem({
  item,
  onChangeQuantity,
  onRemove,
  onClose,
  isRemoving,
}) {
  const price = item.variant.salePrice ?? item.variant.price
  const hasDiscount = item.variant.salePrice != null
  const { shake, onShakeEnd, inputProps } = useQuantityInput(
    item.quantity,
    (num) => {
      if (!num || num < 1) return false
      const clamped = Math.min(num, item.variant.stock)
      if (clamped !== item.quantity) onChangeQuantity(item.variant.id, clamped)
      return num > item.variant.stock
    },
  )
  return (
    <li className="cart-drawer__item">
      {item.product.image && (
        <Link
          to={`/products/${item.product.id}`}
          className="cart-drawer__item-image-link"
          onClick={onClose}
        >
          <img
            src={item.product.image.url}
            alt={item.product.image.altText || item.product.name}
            className="cart-drawer__item-image"
          />
        </Link>
      )}

      <div className="cart-drawer__item-info">
        <div className="cart-drawer__item-header">
          <Link
            to={`/products/${item.product.id}`}
            className="cart-drawer__item-name"
            onClick={onClose}
          >
            {item.product.name}
          </Link>
          <TrashButton
            onClick={() => onRemove(item)}
            disabled={isRemoving}
            aria-label="Remove item"
          />
        </div>

        <span className="cart-drawer__item-variant">{item.variant.name}</span>

        <div className="cart-drawer__item-footer">
          <div className="cart-drawer__item-price-group">
            <span
              className={`cart-drawer__item-price${hasDiscount ? ' cart-drawer__item-price--on-sale' : ''}`}
            >
              {formatLib.vnd(price * item.quantity)}
            </span>
            {hasDiscount && (
              <span className="cart-drawer__item-original-price">
                {formatLib.vnd(item.variant.price * item.quantity)}
              </span>
            )}
          </div>

          <QuantityStepper
            size="sm"
            decrementDisabled={item.quantity <= 1}
            incrementDisabled={item.quantity >= item.variant.stock}
            inputProps={inputProps}
            onDecrement={() =>
              onChangeQuantity(item.variant.id, item.quantity - 1)
            }
            onIncrement={() =>
              onChangeQuantity(item.variant.id, item.quantity + 1)
            }
            onShakeEnd={onShakeEnd}
            editable
            shake={shake}
          />
        </div>
      </div>
    </li>
  )
})
export default function CartDrawer() {
  const { isOpen, close } = useCartDrawerStore()
  const navigate = useNavigate()
  const { data: items = [], isLoading } = useCart()
  const { mutate: upsertItem } = useUpsertCartItem()
  const {
    mutate: removeItem,
    isPending: isRemovePending,
    variables: removingVariantId,
  } = useRemoveCartItem()
  const { mutate: clearCart, isPending: isClearPending } = useClearCart()
  const queryClient = useQueryClient()
  const [confirmClear, setConfirmClear] = useState(false)
  const debounceTimers = useRef({})
  const snapshots = useRef({})
  useEffect(() => {
    const timers = debounceTimers.current
    return () => {
      Object.values(timers).forEach(clearTimeout)
    }
  }, [])
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, close])
  useEffect(() => {
    if (isOpen) {
      // why: compensate for the scrollbar disappearing under overflow:hidden below,
      // otherwise body content shifts left while the drawer is open
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth
      document.body.style.paddingRight = `${scrollbarWidth}px`
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.paddingRight = ''
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.paddingRight = ''
      document.body.style.overflow = ''
    }
  }, [isOpen])
  const total = items.reduce((sum, item) => {
    const price = item.variant.salePrice ?? item.variant.price
    return sum + price * item.quantity
  }, 0)
  const handleChangeQuantity = useCallback(
    (variantId, qty) => {
      // why: only snapshot on the first click of a burst — later clicks in the same debounce
      // window would otherwise overwrite it with an already-optimistic (not original) state
      if (!debounceTimers.current[variantId]) {
        snapshots.current[variantId] = queryClient.getQueryData(CART_KEYS.cart)
      }
      queryClient.setQueryData(CART_KEYS.cart, (old = []) =>
        old.map((item) =>
          item.variant.id === variantId
            ? {
                ...item,
                quantity: qty,
              }
            : item,
        ),
      )
      clearTimeout(debounceTimers.current[variantId])
      debounceTimers.current[variantId] = setTimeout(() => {
        const snapshot = snapshots.current[variantId]
        debounceTimers.current[variantId] = null
        snapshots.current[variantId] = null
        upsertItem(
          {
            variantId,
            quantity: qty,
          },
          {
            onError: (err) => {
              queryClient.setQueryData(CART_KEYS.cart, snapshot)
              toast.error(err?.response?.data?.message ?? 'Failed to update')
            },
          },
        )
      }, DEBOUNCE_MS)
    },
    [queryClient, upsertItem],
  )
  const handleRemove = useCallback(
    (item) => {
      removeItem(item.variant.id, {
        onSuccess: () => {
          // why: only announce removal after the server confirms the mutation.
          toast.success(`Removed "${item.product.name}" from cart`, {
            action: {
              label: 'Undo',
              onClick: () => {
                const currentCart =
                  queryClient.getQueryData(CART_KEYS.cart) ?? []
                if (currentCart.some((i) => i.variant.id === item.variant.id)) {
                  toast.info(`"${item.product.name}" is already in your cart`)
                  return
                }
                upsertItem(
                  {
                    variantId: item.variant.id,
                    quantity: item.quantity,
                  },
                  {
                    onError: () => toast.error('Failed to restore item'),
                  },
                )
              },
            },
            duration: 5000,
          })
        },
        onError: () => toast.error('Failed to remove item'),
      })
    },
    [removeItem, upsertItem, queryClient],
  )
  const handleClear = useCallback(() => {
    setConfirmClear(false)
    clearCart(undefined, {
      onSuccess: () => toast.success('Cart cleared'),
      onError: () => toast.error('Failed to clear cart'),
    })
  }, [clearCart, setConfirmClear])
  const handleCheckout = useCallback(() => {
    close()
    navigate('/checkout')
  }, [close, navigate])
  return (
    <>
      <div
        className={`cart-drawer__overlay${isOpen ? ' cart-drawer__overlay--visible' : ''}`}
        onClick={close}
      />

      <div className={`cart-drawer${isOpen ? ' cart-drawer--open' : ''}`}>
        <div className="cart-drawer__header">
          <span className="cart-drawer__title">Your Cart</span>
          {items.length > 0 && (
            <button
              type="button"
              className="cart-drawer__clear-button"
              onClick={() => setConfirmClear(true)}
              disabled={isClearPending}
            >
              Clear all
            </button>
          )}
          <button
            type="button"
            className="cart-drawer__close-button"
            onClick={close}
            aria-label="Close cart"
          >
            <FaTimes size={14} />
          </button>
        </div>

        <div className="cart-drawer__body">
          {isLoading ? (
            <div className="cart-drawer__skeleton-list">
              {[1, 2, 3].map((i) => (
                <div key={i} className="cart-drawer__skeleton" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="cart-drawer__empty">
              <FaShoppingBag size={48} className="cart-drawer__empty-icon" />
              <p className="cart-drawer__empty-text">Your cart is empty</p>
            </div>
          ) : (
            <ul className="cart-drawer__item-list">
              {items.map((item) => (
                <CartItem
                  key={item.variant.id}
                  item={item}
                  onChangeQuantity={handleChangeQuantity}
                  onRemove={handleRemove}
                  onClose={close}
                  isRemoving={
                    isRemovePending && removingVariantId === item.variant.id
                  }
                />
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-drawer__footer">
            <div className="cart-drawer__total">
              <span className="cart-drawer__total-label">Total</span>
              <span className="cart-drawer__total-value">
                {formatLib.vnd(total)}
              </span>
            </div>
            <BuyButton onClick={handleCheckout} />
          </div>
        )}
      </div>

      {confirmClear && (
        <ConfirmDialog
          title="Clear your cart?"
          message="All items in your cart will be removed."
          confirmLabel="Clear cart"
          onConfirm={handleClear}
          onCancel={() => setConfirmClear(false)}
        />
      )}
    </>
  )
}
