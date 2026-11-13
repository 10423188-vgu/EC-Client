import { useState } from 'react'
import { toast } from 'sonner'
import { FaMapMarkerAlt } from 'react-icons/fa'
import { useAdminUpdateOrderShipping } from '../../../entities/order'
import { PanelButton } from '../../../shared/components'
import OrderHistory from './OrderHistory'
import { formatStatus } from './orderDetails.utils'
import { formatAddress } from '../../../entities/user'

export default function DeliveryInformation({ order }) {
  const address = formatAddress(order.address)

  return (
    <section className="order-details__section">
      <header className="order-details__section-header">
        <h3>Delivery</h3>
        <span>{formatStatus(order.status)}</span>
      </header>
      <div className="order-details__delivery-address">
        <FaMapMarkerAlt aria-hidden="true" />
        <div>
          <strong>{order.address?.fullName ?? 'Customer'}</strong>
          <p>{address || 'Shipping address not recorded'}</p>
        </div>
      </div>
      {(order.shippingCarrier || order.trackingNumber) && (
        <div className="order-details__shipping-summary">
          <strong>{order.shippingCarrier}</strong>
          <span>{order.trackingNumber}</span>
          {order.trackingUrl && (
            <a href={order.trackingUrl} target="_blank" rel="noreferrer">
              Open carrier tracking
            </a>
          )}
        </div>
      )}
      <ShippingTrackingForm
        key={[
          order.id,
          order.shippingCarrier ?? '',
          order.trackingNumber ?? '',
          order.trackingUrl ?? '',
        ].join(':')}
        order={order}
      />
      <OrderHistory
        entries={order.statusHistory}
        totalEntries={order._count?.statusHistory}
      />
    </section>
  )
}

function ShippingTrackingForm({ order }) {
  const [tracking, setTracking] = useState(() => ({
    shippingCarrier: order.shippingCarrier ?? '',
    trackingNumber: order.trackingNumber ?? '',
    trackingUrl: order.trackingUrl ?? '',
  }))
  const { mutate: updateShipping, isPending } = useAdminUpdateOrderShipping()
  const hasCarrier = Boolean(tracking.shippingCarrier.trim())
  const hasTrackingNumber = Boolean(tracking.trackingNumber.trim())
  const hasTrackingUrl = Boolean(tracking.trackingUrl.trim())
  const hasChanged =
    tracking.shippingCarrier !== (order.shippingCarrier ?? '') ||
    tracking.trackingNumber !== (order.trackingNumber ?? '') ||
    tracking.trackingUrl !== (order.trackingUrl ?? '')
  const cannotSave =
    isPending ||
    !hasChanged ||
    hasCarrier !== hasTrackingNumber ||
    (hasTrackingUrl && !hasTrackingNumber)

  const saveTracking = (event) => {
    event.preventDefault()
    updateShipping(
      {
        id: order.id,
        shippingCarrier: tracking.shippingCarrier.trim() || null,
        trackingNumber: tracking.trackingNumber.trim() || null,
        trackingUrl: tracking.trackingUrl.trim() || null,
      },
      {
        onSuccess: () => toast.success('Tracking information saved'),
        onError: (error) =>
          toast.error(
            error.response?.data?.message ??
              'Failed to save tracking information',
          ),
      },
    )
  }

  const updateField = (field) => (event) =>
    setTracking((current) => ({ ...current, [field]: event.target.value }))

  return (
    <form className="order-details__shipping-form" onSubmit={saveTracking}>
      <label>
        Carrier
        <input
          maxLength={80}
          value={tracking.shippingCarrier}
          onChange={updateField('shippingCarrier')}
          placeholder="Carrier name"
        />
      </label>
      <label>
        Tracking number
        <input
          maxLength={100}
          value={tracking.trackingNumber}
          onChange={updateField('trackingNumber')}
          placeholder="Waybill / tracking number"
        />
      </label>
      <label>
        Tracking link
        <input
          type="url"
          maxLength={2048}
          value={tracking.trackingUrl}
          onChange={updateField('trackingUrl')}
          placeholder="https://carrier.example/track/..."
        />
      </label>
      <PanelButton
        type="submit"
        variant="save"
        label="Save tracking"
        loadingLabel="Saving..."
        loading={isPending}
        disabled={cannotSave}
      />
    </form>
  )
}
