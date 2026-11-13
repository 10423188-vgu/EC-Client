import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import * as Recharts from 'recharts'
import { ArrowTextLink, SelectField, Tooltip } from '../../../shared/components'
import { formatLib } from '../../../shared/utils'

const productColors = [
  'var(--color-primary-hover)',
  'var(--color-secondary)',
  'var(--color-accent)',
  'var(--color-price-sale)',
  'var(--color-text-muted)',
]
const otherProductColor = 'var(--color-text-muted)'

export default function AnalyticsLists({
  topProducts,
  topProductsByCategory,
  categoryId,
  onCategoryChange,
  recentSales,
}) {
  const displayedProducts = categoryId
    ? (topProductsByCategory.find((category) => category.id === categoryId)
        ?.products ?? [])
    : topProducts
  const chartProducts = displayedProducts.slice(0, 4)
  const otherProducts = displayedProducts.slice(4)
  const otherQuantity = otherProducts.reduce(
    (sum, product) => sum + product.quantity,
    0,
  )
  const chartData = [
    ...chartProducts,
    ...(otherQuantity
      ? [{ id: 'other', name: 'Others', quantity: otherQuantity }]
      : []),
  ]
  const totalUnits = chartData.reduce(
    (sum, product) => sum + product.quantity,
    0,
  )

  return (
    <div className="analytics-workspace__lists">
      <article className="analytics-workspace__panel analytics-workspace__panel--products">
        <header className="analytics-workspace__panel-header">
          <div>
            <h3>Top products</h3>
            <p>Units in paid orders; later refunds do not reduce the count</p>
          </div>
          <SelectField
            value={categoryId}
            wrapperClassName="workspace-controls__select analytics-workspace__category-select"
            onChange={(event) => onCategoryChange(event.target.value)}
            aria-label="Filter top products by category"
          >
            <option value="">All categories</option>
            {topProductsByCategory.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </SelectField>
        </header>
        {displayedProducts.length ? (
          <div className="analytics-workspace__products-content">
            <div className="analytics-workspace__products-chart">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="quantity"
                    nameKey="name"
                    innerRadius="68%"
                    outerRadius="90%"
                    paddingAngle={3}
                    stroke="none"
                    isAnimationActive={false}
                  >
                    {chartData.map((product, index) => (
                      <Cell
                        key={product.id}
                        fill={
                          product.id === 'other'
                            ? otherProductColor
                            : productColors[index]
                        }
                      />
                    ))}
                  </Pie>
                  <Recharts.Tooltip
                    content={({ active, payload, label }) =>
                      active && payload?.length ? (
                        <Tooltip
                          mode="content"
                          active={active}
                          title={label || payload[0].name}
                          rows={payload.map((entry) => ({
                            key: entry.dataKey,
                            label: 'Sold',
                            value: `${entry.value} units`,
                            color: entry.color,
                          }))}
                        />
                      ) : null
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="analytics-workspace__products-total">
                <strong>{totalUnits.toLocaleString()}</strong>
                <span>shown units</span>
              </div>
            </div>
            <ol className="analytics-workspace__product-list">
              {chartData.map((product, index) => (
                <li key={product.id}>
                  <span
                    className="analytics-workspace__product-dot"
                    style={{
                      background:
                        product.id === 'other'
                          ? otherProductColor
                          : productColors[index],
                    }}
                  />
                  <span className="analytics-workspace__product-name">
                    {product.name}
                  </span>
                  <strong>
                    {product.quantity.toLocaleString()} ·{' '}
                    {Math.round((product.quantity / totalUnits) * 100)}%
                  </strong>
                </li>
              ))}
            </ol>
          </div>
        ) : (
          <p className="analytics-workspace__empty">
            No paid product sales in this category and period.
          </p>
        )}
      </article>

      <article className="analytics-workspace__panel analytics-workspace__panel--payments">
        <header className="analytics-workspace__panel-header">
          <div>
            <h3>Recent payments</h3>
            <p>Latest payments in this period</p>
          </div>
          <ArrowTextLink to="/dashboard?section=orders">
            See orders
          </ArrowTextLink>
        </header>
        {recentSales.length ? (
          <ul className="analytics-workspace__sales-list">
            {recentSales.map((sale) => (
              <li key={sale.orderId}>
                <span className="analytics-workspace__customer">
                  <strong>{sale.customer}</strong>
                  <small>
                    #{sale.orderId.slice(0, 8).toUpperCase()} ·{' '}
                    {new Date(sale.paidAt).toLocaleDateString('en-US')}
                  </small>
                </span>
                <strong className="analytics-workspace__sale-amount">
                  {formatLib.vnd(sale.amount)}
                </strong>
              </li>
            ))}
          </ul>
        ) : (
          <p className="analytics-workspace__empty">
            No payments in this period.
          </p>
        )}
      </article>
    </div>
  )
}
