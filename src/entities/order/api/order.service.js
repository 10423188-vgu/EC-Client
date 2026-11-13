import { api } from '../../../shared/api/api.js'

export const orderService = {
  checkout: ({ idempotencyKey, ...data }) =>
    api.post('/orders/checkout', data, {
      headers: { 'Idempotency-Key': idempotencyKey },
    }),
  list: (params, signal) => api.get('/orders', { params, signal }),
  getById: (id, signal) => api.get(`/orders/${id}`, { signal }),
  cancel: (id) => api.patch(`/orders/${id}/cancel`),
  adminList: (params, signal) =>
    api.get('/orders/admin/list', { params, signal }),
  adminSelected: (ids) => api.post('/orders/admin/selected', { ids }),
  adminMetrics: (params, signal) =>
    api.get('/orders/admin/metrics', { params, signal }),
  adminAnalytics: (params, signal) =>
    api.get('/orders/admin/analytics', { params, signal }),
  adminExportSelected: (ids) =>
    api.post(
      '/orders/admin/export-selected.csv',
      { ids },
      { responseType: 'blob' },
    ),
  adminExport: (params) =>
    api.get('/orders/admin/export.csv', { params, responseType: 'blob' }),
  adminGetById: (id, signal) => api.get(`/orders/admin/${id}`, { signal }),
  adminUpdateShipping: (id, data) =>
    api.patch(`/orders/admin/${id}/shipping`, data),
  adminUpdateStatus: (id, { status, reason }) =>
    api.patch(`/orders/admin/${id}/status`, { status, reason }),
  adminCancel: (id, reason) =>
    api.patch(`/orders/admin/${id}/cancel`, { reason }),
  adminRefund: (id, data) => api.post(`/orders/admin/${id}/refunds`, data),
  createReturn: (id, data) => api.post(`/orders/${id}/returns`, data),
  adminUpdateReturnStatus: (returnId, data) =>
    api.patch(`/orders/admin/returns/${returnId}/status`, data),
}
