import { useState } from 'react'
import { useAdminOrderAnalytics } from '../../../entities/order'
import { RetryButton, SelectField } from '../../../shared/components'
import { DASHBOARD_PERIOD_DAYS } from '../dashboardPeriodDays'
import AnalyticsCharts from './AnalyticsCharts'
import AnalyticsLists from './AnalyticsLists'
import DashboardWorkspaceSkeleton from '../DashboardWorkspaceSkeleton'
import '../workspaceControls.css'
import './AnalyticsWorkspace.css'

export default function AnalyticsWorkspace() {
  const [days, setDays] = useState(7)
  const [categoryId, setCategoryId] = useState('')
  const { data, isPending, isError, isFetching, refetch } =
    useAdminOrderAnalytics(days)
  if (isPending) return <DashboardWorkspaceSkeleton section="analytics" />

  return (
    <section className="analytics-workspace" aria-label="Store analytics">
      <header className="analytics-workspace__header">
        <div>
          <p className="analytics-workspace__eyebrow">Store performance</p>
          <h2>Sales analytics</h2>
          <p className="analytics-workspace__description">
            Explore revenue, order status, products, and shipping destinations.
          </p>
        </div>
        <SelectField
          value={days}
          wrapperClassName="workspace-controls__select analytics-workspace__period"
          onChange={(event) => {
            setDays(Number(event.target.value))
            setCategoryId('')
          }}
          aria-label="Analytics period"
        >
          {DASHBOARD_PERIOD_DAYS.map((period) => (
            <option key={period} value={period}>
              Last {period} days
            </option>
          ))}
        </SelectField>
      </header>

      {isError && (
        <div className="analytics-workspace__state" role="alert">
          <p>
            {data
              ? 'Could not refresh analytics. Showing previous data.'
              : 'Could not load analytics.'}
          </p>
          <RetryButton onClick={() => refetch()} loading={isFetching} />
        </div>
      )}
      {data && (
        <div className="analytics-workspace__content" aria-busy={isFetching}>
          <AnalyticsCharts
            daily={data.daily}
            countrySales={data.countrySales ?? []}
            statusCounts={data.statusCounts}
            days={days}
          />
          <AnalyticsLists
            topProducts={data.topProducts ?? []}
            topProductsByCategory={data.topProductsByCategory ?? []}
            categoryId={categoryId}
            onCategoryChange={setCategoryId}
            recentSales={data.recentSales}
          />
        </div>
      )}
    </section>
  )
}
