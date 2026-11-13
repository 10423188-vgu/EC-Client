import './CheckoutSummary.css'
import { memo } from 'react'
import { FaShieldAlt, FaTruck, FaUndo } from 'react-icons/fa'
import { useUpsertCartItem, useRemoveCartItem } from '../../../entities/cart'
import { formatLib } from '../../../shared/utils'
import {
  Checkbox,
  QuantityStepper,
  TrashButton,
  useQuantityInput,
} from '../../../shared/components'
import { KeyButton } from './KeyButton.jsx'

// why: display-only — checkout submits addressId/couponCode/note, not a total, so
// the server computes the real fee independently; keep this in sync by hand.
const SHIPPING_FEE = 30_000
const SummaryItem = memo(function SummaryItem({
  item,
  onChangeQuantity,
  onRemove,
  isRemoving,
}) {
  const { shake, onShakeEnd, inputProps } = useQuantityInput(
    item.quantity,
    (num) => {
      if (!num || num < 1) return false
      if (num !== item.quantity)
        onChangeQuantity(item.variant.id, num, item.variant.stock)
      return num > item.variant.stock
    },
  )
  return (
    <li className="checkout-summary__item">
      <img
        src={item.product.image?.url}
        alt={item.product.image?.altText || item.product.name}
        className="checkout-summary__image"
      />
      <div className="checkout-summary__item-info">
        <div className="checkout-summary__item-top">
          <span className="checkout-summary__item-name">
            {item.product.name}
          </span>
          <span className="checkout-summary__item-price">
            {formatLib.vnd(
              (item.variant.salePrice ?? item.variant.price) * item.quantity,
            )}
          </span>
        </div>
        <span className="checkout-summary__item-variant">
          {item.variant.name}
        </span>

        <div className="checkout-summary__item-footer">
          <QuantityStepper
            size="sm"
            decrementDisabled={item.quantity <= 1}
            incrementDisabled={item.quantity >= item.variant.stock}
            inputProps={inputProps}
            onDecrement={() =>
              onChangeQuantity(
                item.variant.id,
                item.quantity - 1,
                item.variant.stock,
              )
            }
            onIncrement={() =>
              onChangeQuantity(
                item.variant.id,
                item.quantity + 1,
                item.variant.stock,
              )
            }
            onShakeEnd={onShakeEnd}
            editable
            shake={shake}
          />
          <TrashButton
            size={28}
            onClick={onRemove}
            disabled={isRemoving}
            aria-label="Remove item"
          />
        </div>
      </div>
    </li>
  )
})
export default function CheckoutSummary({
  cartItems,
  subtotal,
  isFreeShipping,
  shippingFee,
  discount,
  total,
  isPending,
  disabled,
  termsAccepted,
  onTermsChange,
}) {
  const { mutate: upsertItem } = useUpsertCartItem()
  const {
    mutate: removeItem,
    isPending: isRemovePending,
    variables: removingVariantId,
  } = useRemoveCartItem()
  const changeQuantity = (variantId, nextQty, stock) => {
    if (nextQty < 1) return
    upsertItem({
      variantId,
      quantity: Math.min(nextQty, stock),
    })
  }
  return (
    <aside className="checkout-summary">
      <h2 className="checkout-summary__title">Order Summary</h2>
      <span className="checkout-summary__subtitle">
        {cartItems.length} {cartItems.length > 1 ? 'items' : 'item'}
      </span>

      <ul className="checkout-summary__items" data-lenis-prevent>
        {cartItems.map((item) => (
          <SummaryItem
            key={item.variant.id}
            item={item}
            onChangeQuantity={changeQuantity}
            onRemove={() => removeItem(item.variant.id)}
            isRemoving={
              isRemovePending && removingVariantId === item.variant.id
            }
          />
        ))}
      </ul>

      <div className="checkout-summary__totals">
        <div className="checkout-summary__row">
          <span>Subtotal</span>
          <span>{formatLib.vnd(subtotal)}</span>
        </div>
        <div className="checkout-summary__row">
          <span>Shipping fee</span>
          <span>
            {isFreeShipping ? (
              <s>{formatLib.vnd(SHIPPING_FEE)}</s>
            ) : (
              formatLib.vnd(shippingFee)
            )}
          </span>
        </div>
        {discount > 0 && (
          <div className="checkout-summary__row checkout-summary__row--discount">
            <span>Discount</span>
            <span>-{formatLib.vnd(discount)}</span>
          </div>
        )}
        <div className="checkout-summary__row checkout-summary__row--total">
          <span>Total to pay</span>
          <span>{formatLib.vnd(total)}</span>
        </div>
      </div>

      <label className="checkout-summary__terms">
        <Checkbox
          onChange={(e) => onTermsChange(e.target.checked)}
          checked={termsAccepted}
        />
        <span>
          By proceeding I accept the <a href="/terms">Terms &amp; Conditions</a>
        </span>
      </label>

      <KeyButton
        type="submit"
        variant="lg"
        label={isPending ? 'Processing...' : 'Place Order'}
        disabled={isPending || disabled || !termsAccepted}
      />

      <ul className="checkout-trust">
        <li className="checkout-trust__item">
          <FaShieldAlt className="checkout-trust__icon" />
          Secure
        </li>
        <li className="checkout-trust__item">
          <FaTruck className="checkout-trust__icon" />
          Fast delivery
        </li>
        <li className="checkout-trust__item">
          <FaUndo className="checkout-trust__icon" />
          Easy returns
        </li>
      </ul>
    </aside>
  )
}
export { SHIPPING_FEE }
