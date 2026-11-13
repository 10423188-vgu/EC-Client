import { useState } from 'react'
import { useAdminOrderById } from '../../../entities/order'
import { Modal, RetryButton, SlidingTabs } from '../../../shared/components'
import { formatLib } from '../../../shared/utils'
import CustomerInformation from './CustomerInformation'
import DeliveryInformation from './DeliveryInformation'
import FinancialInformation from './FinancialInformation'
import FulfillmentInformation from './FulfillmentInformation'
import './OrderDetails.css'

const DETAIL_TABS = [
  { value: 'items', label: 'Order items' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'financial', label: 'Financial' },
]

export default function OrderDetails({ orderId, onClose }) {
  const [activeTab, setActiveTab] = useState('items')
  const {
    data: order,
    isLoading,
    isError,
    refetch,
  } = useAdminOrderById(orderId)

  return (
    <Modal
      title={`Order #${orderId.slice(0, 8).toUpperCase()}`}
      bodyClassName="order-details-modal__body"
      panelClassName="order-details-modal"
      maxWidth="400px"
      footer={
        order && (
          <div className="order-details__footer-content">
            <span>Order total</span>
            <strong>{formatLib.vnd(order.total)}</strong>
          </div>
        )
      }
      onClose={onClose}
    >
      {isLoading && <p className="order-details__message">Loading order…</p>}
      {isError && (
        <section className="order-details__error">
          <p>Could not load this order.</p>
          <RetryButton onClick={() => refetch()} />
        </section>
      )}
      {order && (
        <article className="order-details">
          <CustomerInformation order={order} />
          <SlidingTabs
            tabs={DETAIL_TABS}
            value={activeTab}
            className="order-details__tabs"
            onChange={setActiveTab}
            stretch
            ariaLabel="Order details"
          />
          <div className="order-details__content">
            {activeTab === 'items' && <FulfillmentInformation order={order} />}
            {activeTab === 'delivery' && <DeliveryInformation order={order} />}
            {activeTab === 'financial' && (
              <FinancialInformation order={order} />
            )}
          </div>
        </article>
      )}
    </Modal>
  )
}
