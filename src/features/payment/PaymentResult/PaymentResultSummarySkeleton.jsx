import '../../../shared/styles/skeleton.css'
import './PaymentResultSummarySkeleton.css'

export default function PaymentResultSummarySkeleton() {
  return (
    <div
      className="payment-result-summary-skeleton"
      role="status"
      aria-busy="true"
      aria-label="Payment summary loading"
    >
      <p className="payment-result__total">
        Total:{' '}
        <span
          className="skeleton payment-result-summary-skeleton__total"
          aria-hidden="true"
        />
      </p>
    </div>
  )
}
