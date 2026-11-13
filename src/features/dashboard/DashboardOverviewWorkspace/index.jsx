import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'
import * as Recharts from 'recharts'
import {
  ORDER_STATUS_LABELS,
  useAdminOrderAnalytics,
  useAdminOrders,
} from '../../../entities/order'
import {
  ArrowTextLink,
  RetryButton,
  SelectField,
  StatusBadge,
  Tooltip,
} from '../../../shared/components'
import { formatLib } from '../../../shared/utils'
import DashboardKpis from './DashboardKpis'
import DashboardWorkspaceSkeleton from '../DashboardWorkspaceSkeleton'
import {
  OverviewAnalyticsSkeleton,
  RecentOrdersSkeleton,
} from './DashboardOverviewWorkspaceSkeleton'
import { DASHBOARD_PERIOD_DAYS } from '../dashboardPeriodDays'
import '../workspaceControls.css'
import '../OrdersWorkspace/OrdersWorkspace.css'
import '../AnalyticsWorkspace/AnalyticsWorkspace.css'
import './DashboardOverviewWorkspace.css'

function RecentOrders({ query }) {
  const orders = query.data?.data ?? []

  return (
    <article className="analytics-workspace__panel dashboard-overview__orders">
      <header className="analytics-workspace__panel-header">
        <div>
          <h3>Recent orders</h3>
          <p>Latest orders placed in your store</p>
        </div>
        <ArrowTextLink to="/dashboard?section=orders">
          View all orders
        </ArrowTextLink>
      </header>
      {query.isError && query.data && (
        <div className="dashboard-overview__state" role="alert">
          <p>Could not refresh recent orders. Showing saved data.</p>
          <RetryButton
            onClick={() => query.refetch()}
            loading={query.isFetching}
          />
        </div>
      )}
      {query.isError && !query.data ? (
        <div className="dashboard-overview__state" role="alert">
          <p>Could not load recent orders.</p>
          <RetryButton
            onClick={() => query.refetch()}
            loading={query.isFetching}
          />
        </div>
      ) : orders.length ? (
        <div className="orders-workspace__table-wrapper">
          <table className="orders-workspace__table">
            <thead>
              <tr>
                <th scope="col">Order</th>
                <th scope="col">Customer</th>
                <th scope="col">Payment</th>
                <th scope="col">Status</th>
                <th scope="col">Items</th>
                <th scope="col">Amount</th>
                <th scope="col">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const status = ORDER_STATUS_LABELS[order.status]
                return (
                  <tr key={order.id}>
                    <td>
                      <Link
                        to="/dashboard?section=orders"
                        className="orders-workspace__order-link"
                      >
                        #{order.id.slice(0, 8).toUpperCase()}
                      </Link>
                    </td>
                    <td>
                      <span className="orders-workspace__customer-name">
                        {order.user?.name || 'Customer'}
                      </span>
                      <span className="orders-workspace__customer-email">
                        {order.user?.email}
                      </span>
                    </td>
                    <td>
                      <span className="orders-workspace__payment-method">
                        {order.payment?.method === 'BANK_TRANSFER'
                          ? 'Bank transfer'
                          : '—'}
                      </span>
                      <span className="orders-workspace__payment-status">
                        {order.payment?.status?.replaceAll('_', ' ') ??
                          'Not recorded'}
                      </span>
                    </td>
                    <td>
                      <StatusBadge
                        size="compact"
                        tone={status?.tone ?? 'neutral'}
                      >
                        {status?.label ?? order.status}
                      </StatusBadge>
                    </td>
                    <td>{order.itemsCount}</td>
                    <td className="orders-workspace__total">
                      {formatLib.vnd(order.total)}
                    </td>
                    <td>
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="analytics-workspace__empty">No orders yet.</p>
      )}
    </article>
  )
}

function RevenueBreakdown({ daily }) {
  return (
    <article className="analytics-workspace__panel dashboard-overview__trends">
      <header className="analytics-workspace__panel-header">
        <div>
          <h3>Revenue</h3>
          <p>Collected and refunded by payment date</p>
        </div>
        <ArrowTextLink to="/dashboard?section=analytics">
          View analytics
        </ArrowTextLink>
      </header>
      <div
        className="analytics-workspace__chart"
        role="img"
        aria-label="Daily collected and refunded revenue"
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={daily}
            margin={{ top: 10, right: 8, bottom: 0, left: 0 }}
          >
            <defs>
              <linearGradient
                id="dashboard-collected-fill"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="var(--color-primary-hover)"
                  stopOpacity={0.24}
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-primary-hover)"
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient
                id="dashboard-refunded-fill"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="var(--color-price-sale)"
                  stopOpacity={0.2}
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-price-sale)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke="var(--color-border)"
              strokeDasharray="3 5"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              minTickGap={30}
              tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }}
              tickFormatter={(day) =>
                new Date(`${day}T00:00:00Z`).toLocaleDateString('en-US', {
                  month: 'short',
                  timeZone: 'UTC',
                })
              }
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              width={44}
              tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }}
              tickFormatter={(value) => `${Math.round(value / 1000)}k`}
              axisLine={false}
              tickLine={false}
            />
            <Recharts.Tooltip
              content={({ active, payload, label }) =>
                active && payload?.length ? (
                  <Tooltip
                    mode="content"
                    active={active}
                    title={new Date(`${label}T00:00:00Z`).toLocaleDateString(
                      'en-US',
                      { month: 'short', day: 'numeric', timeZone: 'UTC' },
                    )}
                    rows={payload.map((entry) => ({
                      key: entry.dataKey,
                      label: entry.name,
                      value: formatLib.vnd(entry.value),
                      color: entry.color,
                    }))}
                  />
                ) : null
              }
            />
            <Area
              type="monotone"
              dataKey="collected"
              name="Collected"
              stroke="var(--color-primary-hover)"
              strokeWidth={2.5}
              fill="url(#dashboard-collected-fill)"
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="refunded"
              name="Refunded"
              stroke="var(--color-price-sale)"
              strokeWidth={2}
              fill="url(#dashboard-refunded-fill)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="analytics-workspace__legend">
        <span>
          <i className="dashboard-overview__legend-dot dashboard-overview__legend-dot--collected" />
          Collected
        </span>
        <span>
          <i className="dashboard-overview__legend-dot dashboard-overview__legend-dot--refunded" />
          Refunded
        </span>
      </div>
    </article>
  )
}

export default function DashboardOverviewWorkspace() {
  const [days, setDays] = useState(7)
  const analytics = useAdminOrderAnalytics(days)
  const orders = useAdminOrders({ page: 1, limit: 5 })
  if (analytics.isPending && orders.isPending) {
    return <DashboardWorkspaceSkeleton section="dashboard" />
  }

  const data = analytics.data
  return (
    <section
      className="analytics-workspace dashboard-overview"
      aria-label="Dashboard overview"
    >
      <header className="dashboard-overview__header">
        <div>
          <p className="analytics-workspace__eyebrow">Store overview</p>
          <p className="analytics-workspace__description">
            A live view of sales and recent orders.
          </p>
        </div>
        <SelectField
          value={days}
          wrapperClassName="workspace-controls__select dashboard-overview__period"
          onChange={(event) => setDays(Number(event.target.value))}
          aria-label="Dashboard reporting period"
        >
          {DASHBOARD_PERIOD_DAYS.map((period) => (
            <option key={period} value={period}>
              Last {period} days
            </option>
          ))}
        </SelectField>
      </header>
      {analytics.isError && data && (
        <div className="dashboard-overview__state" role="alert">
          <p>Could not refresh store analytics. Showing saved data.</p>
          <RetryButton
            onClick={() => analytics.refetch()}
            loading={analytics.isFetching}
          />
        </div>
      )}
      <div
        className="analytics-workspace__content"
        aria-busy={analytics.isFetching || orders.isFetching}
      >
        {data ? (
          <>
            <DashboardKpis summary={data.summary} />
            <RevenueBreakdown daily={data.daily} />
          </>
        ) : analytics.isPending ? (
          <OverviewAnalyticsSkeleton />
        ) : (
          <div
            className="dashboard-overview__state dashboard-overview__state--analytics"
            role="alert"
          >
            <p>Could not load store analytics.</p>
            <RetryButton
              onClick={() => analytics.refetch()}
              loading={analytics.isFetching}
            />
          </div>
        )}
        {orders.isPending ? (
          <RecentOrdersSkeleton />
        ) : (
          <RecentOrders query={orders} />
        )}
      </div>
    </section>
  )
}
