import { memo } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'
import * as Recharts from 'recharts'
import './ProductOverview.css'
import { formatLib } from '../../../shared/utils'
import { RetryButton, Tooltip } from '../../../shared/components'

const formatSalesAxis = (value) => {
  if (value >= 1000000) return `${value / 1000000}m`
  if (value >= 1000) return `${value / 1000}k`
  return value
}

// why: table selection should not redraw the product charts.
const ProductOverview = memo(function ProductOverview({
  data,
  categories,
  days,
  isError,
  isFetching,
  onRetry,
}) {
  if (isError && !data)
    return (
      <section
        className="product-overview product-overview--state"
        role="status"
      >
        Could not load product overview.
        <RetryButton onClick={onRetry} loading={isFetching} />
      </section>
    )

  const distribution = [...(data?.distribution ?? [])]
  if (distribution.length > 0 && distribution.length < 3) {
    for (const category of categories) {
      if (!distribution.some((entry) => entry.slug === category.slug)) {
        distribution.push({
          name: category.name,
          slug: category.slug,
          count: 0,
        })
      }
      if (distribution.length === 6) break
    }
  }
  const topSelling = data?.topSelling ?? []
  const outOfStock = data?.outOfStock ?? []
  const sales = data?.sales ?? []
  const maxCategoryCount = Math.max(
    1,
    ...distribution.map((category) => category.count),
  )
  const salesTotal = sales.reduce((sum, day) => sum + day.total, 0)

  return (
    <section className="product-overview-grid" aria-label="Product overview">
      {isError && (
        <div className="product-overview__notice" role="alert">
          <p>Could not refresh product overview. Showing saved data.</p>
          <RetryButton onClick={onRetry} loading={isFetching} />
        </div>
      )}
      <article className="product-overview product-overview--distribution">
        <header className="product-overview__header">
          <div>
            <h2 className="product-overview__title">Product distribution</h2>
            <p className="product-overview__subtitle">Catalog by category</p>
          </div>
          <span className="product-overview__period">Catalog</span>
        </header>
        {distribution.length ? (
          <div
            className="product-overview__distribution-chart"
            role="img"
            aria-label={distribution
              .map((category) => `${category.name}: ${category.count} products`)
              .join(', ')}
          >
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={distribution} outerRadius="62%">
                <PolarGrid stroke="var(--color-border-cream-hover)" />
                <PolarAngleAxis
                  dataKey="name"
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }}
                  tickFormatter={(name) =>
                    name.length > 16 ? `${name.slice(0, 15)}…` : name
                  }
                />
                <PolarRadiusAxis
                  domain={[0, maxCategoryCount]}
                  tick={false}
                  axisLine={false}
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
                          label: 'Products',
                          value: entry.value,
                          color: entry.color,
                        }))}
                      />
                    ) : null
                  }
                />
                <Radar
                  name="Products"
                  dataKey="count"
                  stroke="var(--color-primary-hover)"
                  strokeWidth={2}
                  fill="var(--color-primary)"
                  fillOpacity={0.18}
                  dot={{ r: 3, fill: 'var(--color-primary-hover)' }}
                  isAnimationActive={false}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="product-overview__empty">
            Add products to see how your catalog is distributed.
          </p>
        )}
      </article>

      <article className="product-overview">
        <header className="product-overview__header">
          <div>
            <h2 className="product-overview__title">Top-selling products</h2>
            <p className="product-overview__subtitle">Ranked by units sold</p>
          </div>
        </header>
        {topSelling.length ? (
          <ol
            className="product-overview__seller-list"
            data-lenis-prevent
            tabIndex={0}
            aria-label="Top-selling products"
          >
            {topSelling.map((product, index) => (
              <li key={product.id}>
                <span className="product-overview__rank">
                  {String(index + 1).padStart(2, '0')}
                </span>
                {product.image ? (
                  <img src={product.image} alt="" />
                ) : (
                  <span
                    className="product-overview__image-placeholder"
                    aria-hidden="true"
                  >
                    {product.name[0]}
                  </span>
                )}
                <span className="product-overview__seller-name">
                  {product.name}
                </span>
                <strong className="product-overview__seller-quantity">
                  {product.quantity} sold
                </strong>
              </li>
            ))}
          </ol>
        ) : (
          <p className="product-overview__empty product-overview__empty--compact">
            No paid product sales in the last {days} days.
          </p>
        )}
        <section className="product-overview__inventory">
          <header className="product-overview__section-header">
            <h3 className="product-overview__section-title">Out of stock</h3>
            <span>{outOfStock.length}</span>
          </header>
          {outOfStock.length ? (
            <ul
              className="product-overview__stock-list"
              data-lenis-prevent
              tabIndex={0}
              aria-label="Out of stock products"
            >
              {outOfStock.map((product) => (
                <li key={product._id}>
                  {product.image ? (
                    <img src={product.image} alt="" loading="lazy" />
                  ) : (
                    <span
                      className="product-overview__stock-image-placeholder"
                      aria-hidden="true"
                    >
                      {product.name[0]}
                    </span>
                  )}
                  <span className="product-overview__stock-product">
                    <span className="product-overview__stock-name">
                      {product.name}
                    </span>
                    <small>{product.categoryName}</small>
                  </span>
                  <strong className="product-overview__stock-status">
                    0 in stock
                  </strong>
                </li>
              ))}
            </ul>
          ) : (
            <p className="product-overview__stock-clear">
              All active products are in stock.
            </p>
          )}
        </section>
      </article>

      <article className="product-overview product-overview--sales">
        <header className="product-overview__header">
          <div>
            <h2 className="product-overview__title">Total product sales</h2>
            <p className="product-overview__subtitle">Gross sales · UTC</p>
          </div>
        </header>
        <strong className="product-overview__total">
          {formatLib.vnd(salesTotal)}
        </strong>
        <div
          className="product-overview__chart"
          role="img"
          aria-label={`Daily product sales for the last ${days} days`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={sales}
              margin={{ top: 12, right: 8, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="product-sales-fill"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="var(--color-primary)"
                    stopOpacity={0.28}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--color-primary)"
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
              <YAxis
                tickFormatter={formatSalesAxis}
                tick={{ fill: 'var(--color-text-subtle)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={54}
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
                        label: entry.name,
                        value: formatLib.vnd(entry.value),
                        color: entry.color,
                      }))}
                    />
                  ) : null
                }
              />
              <Area
                isAnimationActive={false}
                type="monotone"
                name="Product sales"
                dataKey="total"
                stroke="var(--color-primary)"
                strokeWidth={2.5}
                fill="url(#product-sales-fill)"
                activeDot={{
                  fill: 'var(--color-primary)',
                  r: 4,
                  stroke: 'var(--color-surface-opaque)',
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        {!salesTotal && (
          <p className="product-overview__sales-empty">
            No paid product sales in this period.
          </p>
        )}
      </article>
    </section>
  )
})

export default ProductOverview
