export const DASHBOARD_PERIOD_DAYS = [7, 14, 30, 90]

const toDateInput = (date) =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')

export const getDashboardDateRange = (days) => {
  const today = new Date()
  const from = new Date(today)
  from.setDate(today.getDate() - days + 1)
  return { dateFrom: toDateInput(from), dateTo: toDateInput(today) }
}
