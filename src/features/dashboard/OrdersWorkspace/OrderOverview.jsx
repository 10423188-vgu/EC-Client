import { memo } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { formatLib } from '../../../shared/utils'
import { RetryButton } from '../../../shared/components'
import './OrderOverview.css'
const REVENUE_STATUSES = new Set([
  'PAID',
  'PROCESSING',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
])
const AWAITING_PAYMENT_STATUSES = new Set(['PENDING', 'AWAITING_PAYMENT'])
const STATUS_GROUPS = [
  {
    label: 'Revenue',
    rows: [
      {
        label: 'Paid / fulfillment',
        statuses: REVENUE_STATUSES,
        color: 'linear-gradient(90deg, var(--gradient-primary-stops))',
      },
      {
        label: 'Awaiting payment',
        statuses: AWAITING_PAYMENT_STATUSES,
        color: 'var(--warning)',
      },
    ],
  },
  {
    label: 'Fulfillment',
    rows: [
      {
        label: 'Processing',
        statuses: new Set(['PROCESSING']),
        color: 'var(--cyan)',
      },
      {
        label: 'Shipped',
        statuses: new Set(['SHIPPED']),
        color: 'var(--color-primary)',
      },
      {
        label: 'Out for delivery',
        statuses: new Set(['OUT_FOR_DELIVERY']),
        color: 'var(--color-secondary)',
      },
      {
        label: 'Delivered',
        statuses: new Set(['DELIVERED']),
        color: 'var(--success)',
      },
    ],
  },
  {
    label: 'Risk',
    rows: [
      {
        label: 'Cancelled',
        statuses: new Set(['CANCELLED']),
        color: 'var(--danger)',
      },
      {
        label: 'Refunded',
        statuses: new Set(['REFUNDED']),
        color: 'var(--color-text-subtle)',
      },
    ],
  },
]
// why: order selection and dialogs should not redraw the metrics chart.
const OrderOverview = memo(function OrderOverview({
  metrics,
  isError,
  isFetching,
  onRetry,
}) {
  if (isError && !metrics) {
    return (
      <aside className="order-overview order-overview--state">
        <span>Could not load metrics.</span>
        <RetryButton onClick={onRetry} loading={isFetching} />
      </aside>
    )
  }
  const totalOrders = metrics?.totalOrders ?? 0
  const statusCounts = metrics?.statusCounts ?? {}
  const statusGroups = STATUS_GROUPS.map((group) => ({
    ...group,
    rows: group.rows.map((row) => ({
      ...row,
      count: [...row.statuses].reduce(
        (total, status) => total + (statusCounts[status] ?? 0),
        0,
      ),
    })),
  }))
  const awaitingPaymentCount = [...AWAITING_PAYMENT_STATUSES].reduce(
    (total, status) => total + (statusCounts[status] ?? 0),
    0,
  )
  const paidFulfillmentCount = [...REVENUE_STATUSES].reduce(
    (total, status) => total + (statusCounts[status] ?? 0),
    0,
  )
  const chartData = [
    {
      name: 'Paid / fulfillment',
      value: paidFulfillmentCount,
      color: 'url(#orders-workspace-fulfilment-gradient)',
      swatch: 'linear-gradient(90deg, var(--gradient-primary-stops))',
    },
    {
      name: 'Awaiting payment',
      value: awaitingPaymentCount,
      color: 'var(--warning)',
    },
    {
      name: 'Cancelled',
      value: statusCounts.CANCELLED ?? 0,
      color: 'var(--danger)',
    },
    {
      name: 'Refunded',
      value: statusCounts.REFUNDED ?? 0,
      color: 'var(--color-text-subtle)',
    },
  ]
  const overviewMetrics = [
    {
      label: 'Gross collected',
      definition: metrics?.definitions?.collectedRevenue,
      value: formatLib.vnd(metrics?.collectedRevenue ?? 0),
    },
    {
      label: 'Refunded',
      definition: metrics?.definitions?.refundedAmount,
      value: formatLib.vnd(metrics?.refundedAmount ?? 0),
    },
    {
      label: 'Net revenue',
      definition: metrics?.definitions?.netRevenue,
      value: formatLib.vnd(metrics?.netRevenue ?? 0),
    },
    {
      label: 'Paid-order AOV',
      definition: metrics?.definitions?.averageOrderValue,
      value: formatLib.vnd(metrics?.averageOrderValue ?? 0),
    },
    {
      label: 'Cancellation rate',
      definition: metrics?.definitions?.cancellationRate,
      value: `${metrics?.cancellationRate ?? 0}%`,
    },
    {
      label: 'Refund rate',
      definition: metrics?.definitions?.refundRate,
      value: `${metrics?.refundRate ?? 0}%`,
    },
    {
      label: 'Payment conversion',
      definition: metrics?.definitions?.paymentConversionRate,
      value: `${metrics?.paymentConversionRate ?? 0}%`,
    },
    {
      label: 'In fulfillment',
      value: Object.values(metrics?.fulfillmentDistribution ?? {}).reduce(
        (total, count) => total + count,
        0,
      ),
    },
    {
      label: 'Overdue orders',
      definition: metrics?.definitions?.overdueOrderCount,
      value: metrics?.overdueOrderCount ?? 0,
    },
    {
      label: 'Avg. items per order',
      definition: metrics?.definitions?.averageItems,
      value: (metrics?.averageItems ?? 0).toFixed(1),
    },
  ]
  return (
    <aside className="order-overview">
      {isError && (
        <div role="alert">
          <p>Could not refresh metrics. Showing saved data.</p>
          <RetryButton onClick={onRetry} loading={isFetching} />
        </div>
      )}
      <header className="order-overview__header">
        <h2 className="order-overview__title">Order overview</h2>
        <span>Current status</span>
      </header>
      <div className="order-overview__chart">
        <ResponsiveContainer width="100%" height={150}>
          <PieChart>
            <defs>
              <linearGradient
                id="orders-workspace-fulfilment-gradient"
                x1="0"
                y1="0"
                x2="1"
                y2="1"
              >
                <stop offset="0%" stopColor="var(--violet)" />
                <stop offset="100%" stopColor="var(--magenta)" />
              </linearGradient>
            </defs>
            <Pie
              data={chartData}
              dataKey="value"
              startAngle={205}
              endAngle={-25}
              cx="50%"
              cy="58%"
              innerRadius={48}
              outerRadius={65}
              paddingAngle={2}
              stroke="none"
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="order-overview__chart-value">
          <strong>{totalOrders}</strong>
          <span>Total orders</span>
        </div>
      </div>
      <div className="order-overview__chart-legend">
        {chartData.map((entry) => (
          <div key={entry.name}>
            <span>
              <i
                style={{
                  background: entry.swatch ?? entry.color,
                }}
              />
              {entry.name}
            </span>
            <strong>{entry.value}</strong>
          </div>
        ))}
      </div>
      <section className="order-overview__section">
        <header className="order-overview__section-header">
          <p>Order status</p>
          <span>All matching orders</span>
        </header>
        {statusGroups.map((group) => (
          <div key={group.label} className="order-overview__status-group">
            <h3>{group.label}</h3>
            {group.rows.map((row) => (
              <div key={row.label} className="order-overview__status">
                <div>
                  <span>
                    <i
                      style={{
                        background: row.color,
                      }}
                    />
                    {row.label}
                  </span>
                  <strong>
                    {totalOrders
                      ? Math.round((row.count / totalOrders) * 100)
                      : 0}
                    %
                  </strong>
                </div>
                <div className="order-overview__track">
                  <span
                    style={{
                      background: row.color,
                      width: `${totalOrders ? (row.count / totalOrders) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ))}
      </section>
      <section className="order-overview__section">
        <header className="order-overview__section-header">
          <p>Overview</p>
          <span>All matching orders</span>
        </header>
        <div className="order-overview__metrics">
          {overviewMetrics.map((item) => (
            <div key={item.label}>
              <span title={item.definition}>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </section>
    </aside>
  )
})

export default OrderOverview
