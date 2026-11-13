import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import {
  CHECKOUT_STEPS,
  useOrderById,
  useCancelOrder,
} from '../../../entities/order'
import { USER_KEYS } from '../../../entities/user'
import {
  ArrowTextLink,
  PanelButton,
  RetryButton,
  StepIndicator,
} from '../../../shared/components'
import { formatLib } from '../../../shared/utils'
import '../../../shared/styles/skeleton.css'
import '../PaymentPage.css'
import './PaymentQr.css'
const POLL_MS = 3000

export function PaymentQrSkeleton() {
  return (
    <main className="payment-page payment-qr" aria-busy="true">
      <StepIndicator steps={CHECKOUT_STEPS} activeIndex={2} />
      <div
        className="payment-card payment-qr__card"
        role="status"
        aria-label="Payment details loading"
      >
        <h1 className="payment-qr__title">Scan to transfer</h1>
        <p className="payment-qr__subtitle">
          Open your banking app and scan the QR code
        </p>
        <div className="payment-qr__amount">
          <span className="payment-qr__amount-label">Amount to pay</span>
          <span
            className="skeleton payment-qr__loading-amount"
            aria-hidden="true"
          />
        </div>
        <div
          className="payment-qr__code payment-qr__loading-code"
          aria-hidden="true"
        >
          <span className="skeleton--light" />
        </div>
        <dl className="payment-qr__bank-info" aria-hidden="true">
          {['Bank', 'Account number', 'Account name', 'Transfer note'].map(
            (label) => (
              <div className="payment-qr__bank-row" key={label}>
                <dt>{label}</dt>
                <dd className="skeleton payment-qr__loading-bank-value" />
              </div>
            ),
          )}
        </dl>
        <p className="payment-qr__hint">
          <strong>Can't scan the QR?</strong> Transfer manually using the
          details above and use the exact transfer note shown.
        </p>
        <div className="payment-qr__status" aria-hidden="true">
          <span className="skeleton payment-qr__loading-status" />
          <span className="skeleton payment-qr__loading-status payment-qr__loading-status--short" />
        </div>
        <span
          className="skeleton payment-qr__loading-action"
          aria-hidden="true"
        />
      </div>
    </main>
  )
}
export default function PaymentQr() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const {
    data: order,
    isPending,
    isError,
    isFetching,
    refetch,
  } = useOrderById(orderId, {
    // why: checkout may briefly be processing; stop once the order is resolved.
    refetchInterval: (query) => {
      const status = query.state.data?.status
      return status === 'PENDING' || status === 'AWAITING_PAYMENT'
        ? POLL_MS
        : false
    },
  })
  useEffect(() => {
    if (order?.status === 'PAID') {
      // why: ordersCount/tier on the profile page are derived from paid orders —
      // refresh them now so the customer doesn't need a hard reload to see the update
      queryClient.invalidateQueries({
        queryKey: USER_KEYS.current,
      })
      navigate(`/payment/result?orderId=${orderId}&resultCode=0`, {
        replace: true,
      })
    } else if (order?.status === 'CANCELLED') {
      navigate(`/payment/result?orderId=${orderId}&resultCode=1`, {
        replace: true,
      })
    }
  }, [order?.status, orderId, navigate, queryClient])
  const { mutate: cancelOrder, isPending: cancelling } = useCancelOrder()
  if (isPending) {
    return <PaymentQrSkeleton />
  }
  if (!order) {
    return (
      <main className="payment-page payment-qr payment-qr--empty">
        <p>Could not load payment details for this order.</p>
        <RetryButton onClick={() => refetch()} loading={isFetching} />
        <ArrowTextLink to="/orders" className="payment-qr__link">
          View orders
        </ArrowTextLink>
      </main>
    )
  }
  if (order.status === 'PAID' || order.status === 'CANCELLED') {
    return (
      <main className="payment-page payment-qr payment-qr--empty">
        <p>Opening payment result…</p>
      </main>
    )
  }
  if (!order.paymentQr) {
    return (
      <main className="payment-page payment-qr payment-qr--empty">
        <p>
          {order.status === 'PENDING'
            ? 'Your order is being prepared for payment.'
            : 'This order is no longer awaiting payment.'}
        </p>
        {order.status === 'PENDING' && (
          <RetryButton onClick={() => refetch()} loading={isFetching} />
        )}
        <ArrowTextLink to={`/orders/${orderId}`} className="payment-qr__link">
          View order
        </ArrowTextLink>
      </main>
    )
  }
  const { qrCodeUrl, transferContent, bank } = order.paymentQr
  return (
    <main className="payment-page payment-qr">
      <StepIndicator steps={CHECKOUT_STEPS} activeIndex={2} />
      <div className="payment-card payment-qr__card">
        <h1 className="payment-qr__title">Scan to transfer</h1>
        <p className="payment-qr__subtitle">
          Open your banking app and scan the QR code
        </p>

        {isError && (
          <div className="payment-qr__refresh-error" role="alert">
            <p>Could not refresh payment status. Your QR is still available.</p>
            <RetryButton onClick={() => refetch()} loading={isFetching} />
          </div>
        )}

        <div className="payment-notice payment-qr__notice">
          <p className="payment-qr__notice-title">☕ Support the project</p>
          <p className="payment-qr__notice-body">
            This is a demo payment. If you enjoy the project, feel free to leave
            a small donation.
          </p>
        </div>

        <div className="payment-qr__amount">
          <span className="payment-qr__amount-label">Amount to pay</span>
          <span className="payment-qr__amount-value">
            {formatLib.vnd(order.total)}
          </span>
        </div>

        <img
          src={qrCodeUrl}
          alt="Bank transfer QR code"
          className="payment-qr__code"
        />

        {bank && (
          <dl className="payment-qr__bank-info">
            <div className="payment-qr__bank-row">
              <dt>Bank</dt>
              <dd>{bank.name}</dd>
            </div>
            <div className="payment-qr__bank-row">
              <dt>Account number</dt>
              <dd className="payment-qr__account-number">{bank.accountNo}</dd>
            </div>
            <div className="payment-qr__bank-row">
              <dt>Account name</dt>
              <dd>{bank.accountName}</dd>
            </div>
            <div className="payment-qr__bank-row">
              <dt>Transfer note</dt>
              <dd className="payment-qr__transfer-content">
                {transferContent}
              </dd>
            </div>
          </dl>
        )}

        <p className="payment-qr__hint">
          <strong>Can't scan the QR?</strong> Transfer manually using the
          details above and use the exact transfer note shown.
        </p>

        <div className="payment-qr__status">
          <p className="payment-qr__status-main">
            <span className="payment-qr__spinner" aria-hidden="true" />
            Waiting for payment confirmation
          </p>
          <p className="payment-qr__status-description">
            Automatically checking...
          </p>
        </div>

        <PanelButton
          variant="danger"
          label="Cancel order"
          loadingLabel="Cancelling..."
          loading={cancelling}
          onClick={() =>
            cancelOrder(orderId, {
              onSuccess: () => navigate('/checkout'),
            })
          }
        />
      </div>
    </main>
  )
}
