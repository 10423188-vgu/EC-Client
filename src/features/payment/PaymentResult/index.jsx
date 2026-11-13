import { useSearchParams } from 'react-router-dom'
import { FiCheck, FiX } from 'react-icons/fi'
import { CHECKOUT_STEPS, useOrderById } from '../../../entities/order'
import { formatLib } from '../../../shared/utils'
import {
  ArrowButton,
  EyeButton,
  StepIndicator,
} from '../../../shared/components'
import '../PaymentPage.css'
import PaymentResultSummarySkeleton from './PaymentResultSummarySkeleton'
import './PaymentResult.css'
export default function PaymentResult() {
  const [params] = useSearchParams()
  const orderId = params.get('orderId')
  const resultCode = params.get('resultCode')
  const success = resultCode === '0'
  const { data: order, isLoading } = useOrderById(orderId)
  return (
    <main className="payment-page payment-result">
      <StepIndicator steps={CHECKOUT_STEPS} activeIndex={3} />
      <div className="payment-card payment-result__card">
        <div
          className={`payment-result__icon ${success ? 'payment-result__icon--success' : 'payment-result__icon--fail'}`}
        >
          {success ? <FiCheck /> : <FiX />}
        </div>

        <h1 className="payment-result__title">
          {success ? 'Payment successful!' : 'Payment failed'}
        </h1>

        <p className="payment-result__subtitle">
          {success
            ? 'Your order has been confirmed.'
            : 'The transaction could not be completed. Your order has been cancelled.'}
        </p>

        {orderId && (
          <p className="payment-result__order-id">
            Order ID: <strong>#{orderId.slice(0, 8).toUpperCase()}</strong>
          </p>
        )}

        {success && orderId && isLoading && <PaymentResultSummarySkeleton />}

        {!isLoading && order && success && (
          <>
            <p className="payment-result__total">
              Total: <strong>{formatLib.vnd(order.total)}</strong>
            </p>
            <p className="payment-notice payment-result__notice">
              <strong>Demo store.</strong> This total is sample data — checkout
              only requested a small token support payment, never the amount
              shown above.
            </p>
          </>
        )}

        <div className="payment-result__actions">
          {success && orderId && (
            <EyeButton to={`/orders/${orderId}`}>View order</EyeButton>
          )}
          <ArrowButton to="/products">Continue shopping</ArrowButton>
        </div>
      </div>
    </main>
  )
}
