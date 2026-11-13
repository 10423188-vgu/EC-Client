import { createPortal } from 'react-dom'
import { formatLib } from '../../../shared/utils'

export default function OrderPrintTable({ orders }) {
  return createPortal(
    <section className="order-print-table">
      <h1>Selected orders ({orders.length})</h1>
      <table>
        <thead>
          <tr>
            {[
              'Order',
              'Customer',
              'Payment',
              'Status',
              'Items',
              'Total',
              'Date',
            ].map((label) => (
              <th key={label} scope="col">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>#{order.id.slice(0, 8).toUpperCase()}</td>
              <td>
                {order.user?.name}
                <br />
                {order.user?.email}
              </td>
              <td>{order.payment?.status?.replaceAll('_', ' ')}</td>
              <td>{order.status.replaceAll('_', ' ')}</td>
              <td>{order.itemsCount}</td>
              <td>{formatLib.vnd(order.total)}</td>
              <td>{new Date(order.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>,
    document.body,
  )
}
