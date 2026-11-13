import { useState, useEffect, useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useCart } from '../../../entities/cart'
import { useCurrentUser } from '../../../entities/user'
import { resendVerificationMutation } from '../../../entities/user/api'
import { CHECKOUT_STEPS, useCheckout } from '../../../entities/order'
import { ArrowButton, StepIndicator } from '../../../shared/components'
import CheckoutAddressSection from '../CheckoutAddressSection'
import CheckoutPaymentMethod from '../CheckoutPaymentMethod'
import CheckoutCoupon from '../CheckoutCoupon'
import CheckoutNote from '../CheckoutNote'
import CheckoutSummary, { SHIPPING_FEE } from '../CheckoutSummary'
import CheckoutFlowSkeleton from './CheckoutFlowSkeleton'
import './CheckoutFlow.css'
const checkoutSchema = z.object({
  addressId: z.string({
    required_error: 'Please select a shipping address',
  }),
  note: z.string().max(500).optional(),
})
export default function CheckoutFlow() {
  const navigate = useNavigate()
  const { data: cartItems = [], isLoading: cartLoading } = useCart()
  const { data: user, isLoading: userLoading } = useCurrentUser()
  const { mutate: checkout, isPending } = useCheckout()
  const checkoutKeyRef = useRef(null)
  const isEmailVerified = !!user?.emailVerifiedAt
  const resendVerification = useMutation({
    ...resendVerificationMutation,
    onSuccess: () =>
      toast.success('Verification email sent — check your inbox.'),
    onError: (err) =>
      toast.error(
        err.response?.data?.message ?? 'Failed to send verification email',
      ),
  })

  // why: couponResult is external state managed by CheckoutCoupon, not a form field
  const [couponResult, setCouponResult] = useState(null)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const defaultAddress =
    user?.addresses?.find((a) => a.isDefault) ?? user?.addresses?.[0]
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      note: '',
    },
  })

  // why: user addresses load async — set default address once data arrives
  useEffect(() => {
    if (defaultAddress?.id) {
      setValue('addressId', defaultAddress.id, {
        shouldValidate: false,
      })
    }
  }, [defaultAddress?.id, setValue])
  const watchedAddressId = useWatch({
    control,
    name: 'addressId',
  })
  const subtotal = cartItems.reduce(
    (s, i) => s + (i.variant.salePrice ?? i.variant.price) * i.quantity,
    0,
  )
  const isFreeShipping = couponResult?.coupon?.isFreeShipping ?? false
  const shippingFee = isFreeShipping ? 0 : SHIPPING_FEE
  const discount = couponResult?.discountAmount ?? 0
  const total = Math.max(0, subtotal + shippingFee - discount)
  const onSubmit = (data) => {
    if (!isEmailVerified) {
      toast.warning('Verify your email before placing your order.', {
        action: {
          label: 'Send verification email',
          onClick: () => resendVerification.mutate(),
        },
      })
      return
    }
    if (!cartItems.length) {
      toast.info('Your cart is empty')
      return
    }
    checkout(
      {
        idempotencyKey: (checkoutKeyRef.current ??= crypto.randomUUID()),
        addressId: data.addressId,
        couponCode: couponResult?.coupon?.code,
        note: data.note || undefined,
      },
      {
        onSuccess: (res) => {
          checkoutKeyRef.current = null
          navigate(`/payment/qr/${res.orderId}`)
        },
        onError: (err) => {
          // why: a server response means this attempt completed; a network failure keeps the key
          // so a user retry cannot create a second order after a lost successful response.
          if (err.response && err.response.status !== 409)
            checkoutKeyRef.current = null
          toast.error(err.response?.data?.message ?? 'Failed to place order')
        },
      },
    )
  }
  if (cartLoading || userLoading) {
    return (
      <main className="checkout-page">
        <StepIndicator steps={CHECKOUT_STEPS} activeIndex={1} />
        <CheckoutFlowSkeleton />
      </main>
    )
  }
  if (!cartItems.length) {
    return (
      <main className="checkout-page checkout-page--empty">
        <p>Your cart is empty.</p>
        <ArrowButton to="/products">Continue shopping</ArrowButton>
      </main>
    )
  }
  return (
    <main className="checkout-page">
      <StepIndicator steps={CHECKOUT_STEPS} activeIndex={1} />

      <form className="checkout-page__layout" onSubmit={handleSubmit(onSubmit)}>
        <div className="checkout-page__left">
          <CheckoutAddressSection
            addresses={user?.addresses}
            register={register}
            error={errors.addressId?.message}
            selectedAddressId={watchedAddressId}
            onAddressCreated={(id) =>
              setValue('addressId', id, {
                shouldValidate: true,
              })
            }
          />

          <CheckoutPaymentMethod />

          <CheckoutCoupon
            appliedCoupon={couponResult}
            onApply={(result) => setCouponResult(result)}
            onRemove={() => setCouponResult(null)}
          />

          <CheckoutNote register={register} control={control} />
        </div>

        <CheckoutSummary
          cartItems={cartItems}
          subtotal={subtotal}
          shippingFee={shippingFee}
          discount={discount}
          total={total}
          termsAccepted={termsAccepted}
          onTermsChange={setTermsAccepted}
          isFreeShipping={isFreeShipping}
          isPending={isPending}
          disabled={!watchedAddressId}
        />
      </form>
    </main>
  )
}
