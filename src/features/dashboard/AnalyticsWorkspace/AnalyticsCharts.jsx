import { lazy, Suspense } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'
import * as Recharts from 'recharts'
import { formatLib } from '../../../shared/utils'
import { Tooltip } from '../../../shared/components'

const AnalyticsCountryMap = lazy(() => import('./AnalyticsCountryMap'))

const STATUS_GROUPS = [
  {
    label: 'Awaiting payment',
    statuses: ['PENDING', 'AWAITING_PAYMENT'],
    color: 'var(--warning)',
  },
  {
    label: 'In fulfillment',
    statuses: ['PAID', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY'],
    color: 'var(--color-primary-hover)',
  },
  { label: 'Delivered', statuses: ['DELIVERED'], color: 'var(--success)' },
  {
    label: 'Cancelled / refunded',
    statuses: ['CANCELLED', 'REFUNDED'],
    color: 'var(--color-text-muted)',
  },
]

const formatAxis = (value) => {
  const absolute = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  if (absolute >= 1_000_000)
    return `${sign}${(absolute / 1_000_000).toFixed(0)}m`
  if (absolute >= 1_000) return `${sign}${(absolute / 1_000).toFixed(0)}k`
  return String(value)
}

const formatDay = (day) =>
  new Date(`${day}T00:00:00Z`).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  })

export default function AnalyticsCharts({
  daily,
  countrySales,
  statusCounts,
  days,
}) {
  const statusData = STATUS_GROUPS.map((group) => ({
    ...group,
    value: group.statuses.reduce(
      (sum, status) => sum + (statusCounts[status] ?? 0),
      0,
    ),
  }))
  const totalOrders = statusData.reduce((sum, group) => sum + group.value, 0)
  const collected = daily.reduce((sum, day) => sum + day.collected, 0)
  const refunded = daily.reduce((sum, day) => sum + day.refunded, 0)
  const netMax = Math.max(0, ...daily.map((day) => day.net))
  const netMin = Math.min(0, ...daily.map((day) => day.net))
  const netColorOffset = netMax === netMin ? 1 : netMax / (netMax - netMin)
  return (
    <div className="analytics-workspace__charts">
      <article className="analytics-workspace__panel analytics-workspace__panel--revenue">
        <header className="analytics-workspace__panel-header">
          <div>
            <h3>Revenue over time</h3>
            <p>
              Net = collected − refunded · green positive, red negative · UTC
            </p>
          </div>
          <span>Last {days} days</span>
        </header>
        <div className="analytics-workspace__revenue-metrics">
          <div>
            <span>Collected</span>
            <strong>{formatLib.vnd(collected)}</strong>
          </div>
          <div>
            <span>Refunded</span>
            <strong>{formatLib.vnd(refunded)}</strong>
          </div>
        </div>
        <div
          className="analytics-workspace__chart"
          role="img"
          aria-label="Daily collected and net revenue"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={daily}
              margin={{ top: 12, right: 8, bottom: 0, left: 0 }}
              accessibilityLayer
            >
              <defs>
                <linearGradient
                  id="analytics-net-line"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset={netColorOffset} stopColor="var(--success)" />
                  <stop offset={netColorOffset} stopColor="var(--danger)" />
                </linearGradient>
                <linearGradient
                  id="analytics-net-fill"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset={netColorOffset}
                    stopColor="var(--success)"
                    stopOpacity={0.14}
                  />
                  <stop
                    offset={netColorOffset}
                    stopColor="var(--danger)"
                    stopOpacity={0.14}
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
                tickFormatter={formatDay}
                minTickGap={34}
                tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={formatAxis}
                width={48}
                tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Recharts.Tooltip
                labelFormatter={formatDay}
                cursor={{
                  stroke: 'var(--color-border-hover)',
                  strokeDasharray: '3 4',
                }}
                content={({ active, payload, label }) =>
                  active && payload?.length ? (
                    <Tooltip
                      mode="content"
                      active={active}
                      title={formatDay(label)}
                      rows={payload.map((entry) => ({
                        key: entry.dataKey,
                        label: entry.name,
                        value: formatLib.vnd(entry.value),
                        color:
                          entry.dataKey !== 'net'
                            ? 'var(--color-text-muted)'
                            : entry.payload.net >= 0
                              ? 'var(--success)'
                              : 'var(--danger)',
                      }))}
                      contentClassName="analytics-workspace__revenue-tooltip"
                    />
                  ) : null
                }
              />
              <Area
                type="linear"
                dataKey="collected"
                name="Collected"
                stroke="var(--color-text-muted)"
                strokeDasharray="5 5"
                strokeWidth={2}
                fill="none"
                activeDot={({ cx, cy }) => (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={4}
                    fill="var(--color-surface-opaque)"
                    stroke="var(--color-text-muted)"
                    strokeWidth={2}
                  />
                )}
                isAnimationActive={false}
              />
              <Area
                type="linear"
                dataKey="net"
                name="Net after refunds"
                stroke="url(#analytics-net-line)"
                strokeWidth={3}
                fill="url(#analytics-net-fill)"
                baseValue={0}
                activeDot={({ cx, cy, payload }) => (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={4}
                    fill={payload.net >= 0 ? 'var(--success)' : 'var(--danger)'}
                    stroke="var(--color-surface-opaque)"
                    strokeWidth={2}
                  />
                )}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="analytics-workspace__legend">
          <span>
            <i className="analytics-workspace__legend-dot analytics-workspace__legend-dot--net" />
            Net after refunds
          </span>
          <span>
            <i className="analytics-workspace__legend-dot" />
            Collected
          </span>
        </div>
      </article>

      <article className="analytics-workspace__panel analytics-workspace__panel--status">
        <header className="analytics-workspace__panel-header">
          <div>
            <h3>Order status</h3>
            <p>Orders placed in this period</p>
          </div>
        </header>
        <div className="analytics-workspace__status-overview">
          <span>Orders placed</span>
          <strong>{totalOrders.toLocaleString()}</strong>
        </div>
        <div className="analytics-workspace__status-tiles" aria-hidden="true">
          {statusData.map((entry) => (
            <div
              key={entry.label}
              className={`analytics-workspace__status-tile${entry.value ? ' analytics-workspace__status-tile--active' : ''}`}
              style={{ '--status-color': entry.color }}
            >
              <strong>{entry.value}</strong>
            </div>
          ))}
        </div>
        <ul className="analytics-workspace__status-list">
          {statusData.map((entry) => (
            <li key={entry.label}>
              <span>
                <i style={{ background: entry.color }} />
                {entry.label}
              </span>
              <strong>{entry.value}</strong>
            </li>
          ))}
        </ul>
      </article>

      <Suspense
        fallback={
          <article
            className="analytics-workspace__panel analytics-workspace__panel--countries"
            aria-busy="true"
            aria-label="Loading sales by country"
          >
            <header className="analytics-workspace__panel-header">
              <div>
                <h3>Gross sales by country</h3>
                <p>
                  Gross paid amount by shipping destination; refunds not
                  deducted
                </p>
              </div>
            </header>
            <div className="analytics-workspace__country-map">
              <div
                className="analytics-workspace__country-map-placeholder skeleton"
                aria-hidden="true"
              />
            </div>
          </article>
        }
      >
        <AnalyticsCountryMap countrySales={countrySales} />
      </Suspense>
    </div>
  )
}
