import { FaEnvelope, FaPhoneAlt, FaUser } from 'react-icons/fa'

export default function CustomerInformation({ order }) {
  return (
    <section className="order-details__customer">
      <h3>Customer</h3>
      <p>
        <FaUser aria-hidden="true" />
        <span>{order.user?.name ?? order.address?.fullName ?? 'Customer'}</span>
      </p>
      <p>
        <FaEnvelope aria-hidden="true" />
        <span>{order.user?.email ?? 'Not recorded'}</span>
      </p>
      <p>
        <FaPhoneAlt aria-hidden="true" />
        <span>{order.address?.phone ?? 'Not recorded'}</span>
      </p>
      {order.note && <small>Note: {order.note}</small>}
    </section>
  )
}
