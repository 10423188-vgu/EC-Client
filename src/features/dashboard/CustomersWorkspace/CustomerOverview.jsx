import { memo } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
} from 'recharts'
import * as Recharts from 'recharts'
import { RetryButton, Tooltip } from '../../../shared/components'
import './CustomerOverview.css'
import { CustomersOverviewSkeleton } from './CustomersWorkspaceSkeleton'

const SEGMENTS = [
  { key: 'heavy', label: 'Frequent buyers', description: '10+ paid orders' },
  { key: 'regular', label: 'Regular buyers', description: '4–9 paid orders' },
  {
    key: 'occasional',
    label: 'Occasional buyers',
    description: '1–3 paid orders',
  },
  { key: 'none', label: 'No paid orders', description: '0 paid orders' },
]

const STATS = [
  {
    key: 'total',
    label: 'Total customers',
    description: 'Registered customer accounts',
    previous: 'start',
  },
  {
    key: 'activeCustomers',
    label: 'Active customers',
    description: 'Paid buyers in this period',
    previous: 'previousActiveCustomers',
  },
  {
    key: 'newCustomers',
    label: 'New customers',
    description: 'Registered in this period',
    previous: 'previousNewCustomers',
  },
]

function CustomerSparkline({ data, dataKey, days, label }) {
  if (!data.some((point) => point[dataKey] > 0)) {
    return (
      <div
        className="customer-overview__sparkline customer-overview__sparkline--empty"
        role="img"
        aria-label={`${label}: no activity in the last ${days} days`}
      >
        <span>No activity</span>
      </div>
    )
  }

  return (
    <div
      className="customer-overview__sparkline"
      role="img"
      aria-label={`${label} per day for the last ${days} days`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barCategoryGap="28%" accessibilityLayer>
          <XAxis dataKey="day" hide />
          <Recharts.Tooltip
            allowEscapeViewBox={{ x: true, y: false }}
            cursor={{ fill: 'var(--color-accent-subtle)' }}
            content={({ active, payload, label: day }) =>
              active && payload?.length ? (
                <Tooltip
                  mode="content"
                  active={active}
                  title={new Date(`${day}T00:00:00Z`).toLocaleDateString(
                    'en-US',
                    { day: 'numeric', month: 'short', timeZone: 'UTC' },
                  )}
                  rows={[
                    {
                      label,
                      value: Number(payload[0].value).toLocaleString(),
                      color: payload[0].color,
                    },
                  ]}
                />
              ) : null
            }
            position={{ x: -128, y: 0 }}
          />
          <Bar
            dataKey={dataKey}
            fill="var(--color-accent)"
            maxBarSize={5}
            isAnimationActive={false}
            activeBar={{ fill: 'var(--color-primary)' }}
            name={label}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// why: table selection and form state should not redraw customer charts.
const CustomerOverviewContent = memo(function CustomerOverviewContent({
  days,
  data,
  isError,
  isFetching,
  onRetry,
}) {
  const total = data?.total ?? 0
  const segments = data?.segments ?? {}
  const firstGrowthDay = data?.growth[0]
  const previousTotal = firstGrowthDay
    ? firstGrowthDay.total - firstGrowthDay.newCustomers
    : total
  const getChange = (current, previous) =>
    previous === 0
      ? current > 0
        ? null
        : 0
      : Math.round(((current - previous) / previous) * 100)

  return isError && !data ? (
    <div className="customer-overview__message" role="alert">
      <p>Could not load customer overview.</p>
      <RetryButton onClick={onRetry} loading={isFetching} />
    </div>
  ) : (
    <>
      {isError && (
        <div className="customer-overview__message" role="alert">
          <p>Could not refresh customer overview. Showing saved data.</p>
          <RetryButton onClick={onRetry} loading={isFetching} />
        </div>
      )}
      <div className="customer-overview__stats">
        {STATS.map(({ key, label, description, previous }) => {
          const previousValue =
            previous === 'start' ? previousTotal : data[previous]
          const change = getChange(data[key], previousValue)
          return (
            <article key={key} className="customer-overview__stat">
              <header className="customer-overview__stat-header">
                <span>{label}</span>
                <small>Daily · {days} days</small>
              </header>
              <div className="customer-overview__stat-body">
                <div className="customer-overview__stat-value">
                  <strong>{data[key].toLocaleString()}</strong>
                  <small
                    className={`customer-overview__trend customer-overview__trend--${
                      change === null
                        ? 'new'
                        : change > 0
                          ? 'increase'
                          : change < 0
                            ? 'decrease'
                            : 'steady'
                    }`}
                  >
                    {change === null
                      ? 'New'
                      : `${change > 0 ? '↑ ' : change < 0 ? '↓ ' : '— '}${Math.abs(change)}%`}{' '}
                    <span>
                      {previous === 'start'
                        ? 'vs. period start'
                        : `vs. previous ${days} days`}
                    </span>
                  </small>
                </div>
                <CustomerSparkline
                  data={data.growth}
                  dataKey={key === 'total' ? 'total' : key}
                  days={days}
                  label={label}
                />
              </div>
              <small>{description}</small>
            </article>
          )
        })}
      </div>
      <div className="customer-overview__charts">
        <article className="customer-overview__segment-panel">
          <header>
            <h2 className="customer-overview__panel-title">
              Customer segmentation
            </h2>
            <p>Frequency based on lifetime paid orders</p>
          </header>
          <div
            className="customer-overview__segment-bar"
            role="img"
            aria-label={SEGMENTS.map(
              ({ key, label }) => `${label}: ${segments[key] ?? 0}`,
            ).join(', ')}
          >
            {SEGMENTS.map(({ key }) => (
              <span
                key={key}
                className={`customer-overview__segment customer-overview__segment--${key}`}
                style={{
                  width: `${total ? ((segments[key] ?? 0) / total) * 100 : 0}%`,
                }}
              />
            ))}
          </div>
          <ul className="customer-overview__segment-list">
            {SEGMENTS.map(({ key, label, description }) => (
              <li key={key}>
                <span
                  className={`customer-overview__swatch customer-overview__swatch--${key}`}
                />
                <span>
                  <b>
                    {total
                      ? Math.round(((segments[key] ?? 0) / total) * 100)
                      : 0}
                    %
                  </b>
                  <strong>{label}</strong>
                  <small>{description}</small>
                </span>
                <span>{segments[key]?.toLocaleString() ?? 0}</span>
              </li>
            ))}
          </ul>
        </article>
        <article className="customer-overview__growth-panel">
          <header>
            <h2 className="customer-overview__panel-title">
              Customer Growth Trends
            </h2>
            <p>Registered customers · last {days} days · UTC</p>
          </header>
          <div className="customer-overview__growth-summary">
            <span>Total customers</span>
            <strong>{total.toLocaleString()}</strong>
            <small>+{data.newCustomers.toLocaleString()} this period</small>
          </div>
          <div
            role="img"
            aria-label={`Customer total grew from ${data.growth[0]?.total ?? total} to ${total} over the last ${days} days`}
          >
            <ResponsiveContainer width="100%" height={170}>
              <AreaChart
                data={data.growth}
                margin={{ top: 12, right: 8, left: 8, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="customer-growth-fill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="var(--color-accent)"
                      stopOpacity={0.24}
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--color-accent)"
                      stopOpacity={0.01}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  stroke="var(--color-border-cream)"
                  strokeDasharray="3 5"
                />
                <XAxis
                  dataKey="day"
                  tickFormatter={(day) => day.slice(5)}
                  tick={{ fill: 'var(--color-text-subtle)', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={18}
                />
                <Recharts.Tooltip
                  content={({ active, payload, label }) =>
                    active && payload?.length ? (
                      <Tooltip
                        mode="content"
                        active={active}
                        title={label}
                        rows={payload.map((entry) => ({
                          key: entry.dataKey,
                          label: 'Customers',
                          value: Number(entry.value).toLocaleString(),
                          color: entry.color,
                        }))}
                      />
                    ) : null
                  }
                />
                <Area
                  type="monotone"
                  name="Customers"
                  dataKey="total"
                  stroke="var(--color-accent)"
                  strokeWidth={2}
                  fill="url(#customer-growth-fill)"
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>
    </>
  )
})

export default function CustomerOverview({ days, query, children }) {
  return (
    <section className="customer-overview" aria-label="Customer overview">
      <header className="customer-overview__header">
        <h2 className="customer-overview__title">
          Customer growth, activity and purchase frequency
        </h2>
      </header>
      {query.isPending ? (
        <CustomersOverviewSkeleton showHeader={false} />
      ) : (
        <CustomerOverviewContent
          days={days}
          data={query.data}
          isError={query.isError}
          isFetching={query.isFetching}
          onRetry={query.refetch}
        />
      )}
      {children}
    </section>
  )
}
