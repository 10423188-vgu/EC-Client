import { api } from '../../../shared/api/api.js'

export const couponService = {
  validate: (code) => api.post('/coupons/validate', { code }),
  list: (params, signal) => api.get('/coupons', { params, signal }),
  getById: (id, signal) => api.get(`/coupons/${id}`, { signal }),
  create: (data) => api.post('/coupons', data),
  update: (id, data) => api.put(`/coupons/${id}`, data),
  delete: (id) => api.delete(`/coupons/${id}`),
}
