import {
  DASHBOARD_PERIOD_DAYS,
  getDashboardDateRange,
} from '../dashboardPeriodDays'

const DATE_PRESETS = [
  ['today', 'Today'],
  ['this-month', 'This month'],
]

const toDateInput = (date) =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')

const getDatePreset = (preset) => {
  const today = new Date()
  const from = new Date(today)
  if (typeof preset === 'number') return getDashboardDateRange(preset)
  if (preset === 'today') from.setHours(0, 0, 0, 0)
  if (preset === 'this-month') from.setDate(1)
  return { dateFrom: toDateInput(from), dateTo: toDateInput(today) }
}

export default function DatePresets({ dateFrom, dateTo, onChange }) {
  return (
    <nav className="orders-workspace__presets" aria-label="Date presets">
      {DATE_PRESETS.map(([value, label]) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(getDatePreset(value))}
        >
          {label}
        </button>
      ))}
      {DASHBOARD_PERIOD_DAYS.map((days) => (
        <button
          key={days}
          type="button"
          onClick={() => onChange(getDatePreset(days))}
        >
          Last {days} days
        </button>
      ))}
      {(dateFrom || dateTo) && (
        <button
          type="button"
          className="orders-workspace__clear-dates"
          onClick={() =>
            onChange({ dateFrom: '', dateTo: '', datePreset: 'all' })
          }
        >
          Clear dates
        </button>
      )}
    </nav>
  )
}
