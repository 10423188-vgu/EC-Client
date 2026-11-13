import './CheckoutSection.css'
export default function CheckoutSection({ title, error, children }) {
  return (
    <section className="checkout-section">
      <h2 className="checkout-section__title">{title}</h2>
      {children}
      {error && <p className="checkout-section__error">{error}</p>}
    </section>
  )
}
