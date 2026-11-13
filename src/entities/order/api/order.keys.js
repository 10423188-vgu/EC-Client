export const ORDER_KEYS = {
  all: ['orders'],
  adminDetail: (id) => ['orders', 'admin', 'detail', id],
  list: (params) => ['orders', 'list', params],
  detail: (id) => ['orders', id],
  adminList: (params) => ['orders', 'admin', 'list', params],
  adminMetrics: (params) => ['orders', 'admin', 'metrics', params],
  adminAnalytics: (days) => ['orders', 'admin', 'analytics', days],
}
