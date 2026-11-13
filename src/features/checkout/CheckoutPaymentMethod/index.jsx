import './CheckoutPaymentMethod.css'
import { FaQrcode, FaCheckCircle } from 'react-icons/fa'
import CheckoutSection from '../CheckoutSection'

// why: bank transfer (VietQR) is the only method — a fixed, pre-selected card, no choice to make
export default function CheckoutPaymentMethod() {
  return (
    <CheckoutSection title="Payment Method">
      <div className="checkout-payment">
        <span className="checkout-payment__icon">
          <FaQrcode />
        </span>
        <div className="checkout-payment__info">
          <p className="checkout-payment__label">Bank Transfer (VietQR)</p>
          <p className="checkout-payment__hint">
            Scan the QR code after placing your order to complete payment.
          </p>
        </div>
        <FaCheckCircle className="checkout-payment__check" />
      </div>
    </CheckoutSection>
  )
}
