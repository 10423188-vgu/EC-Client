import { formatLib } from '../../../shared/utils'
import {
  RiBankCardLine,
  RiExchangeDollarLine,
  RiShoppingBag3Line,
  RiRefund2Line,
} from 'react-icons/ri'

export default function DashboardKpis({ summary }) {
  const cards = [
    {
      label: 'Net revenue',
      value: formatLib.vnd(summary.netRevenue),
      detail: 'Collected less completed refunds',
      icon: RiBankCardLine,
    },
    {
      label: 'Average paid order',
      value: formatLib.vnd(summary.averageOrderValue),
      detail: `Across ${summary.paidOrders.toLocaleString()} paid ${summary.paidOrders === 1 ? 'order' : 'orders'}`,
      icon: RiExchangeDollarLine,
    },
    {
      label: 'Orders placed',
      value: summary.totalOrders.toLocaleString(),
      detail: 'All payment and fulfillment states',
      icon: RiShoppingBag3Line,
    },
    {
      label: 'Refunded',
      value: formatLib.vnd(summary.refundedAmount),
      detail: 'Completed refunds in this period',
      icon: RiRefund2Line,
    },
  ]

  return (
    <div className="dashboard-overview__kpis">
      {cards.map((card) => (
        <article key={card.label} className="dashboard-overview__kpi">
          <card.icon
            className="dashboard-overview__kpi-icon"
            aria-hidden="true"
          />
          <strong className="dashboard-overview__kpi-value">
            {card.value}
          </strong>
          <p className="dashboard-overview__kpi-label">{card.label}</p>
          <p className="dashboard-overview__kpi-detail">{card.detail}</p>
        </article>
      ))}
    </div>
  )
}
