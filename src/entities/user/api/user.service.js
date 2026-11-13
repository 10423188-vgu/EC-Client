import { api } from '../../../shared/api/api.js'

export const userService = {
  getCurrentUser: () => api.get('/users/me'),

  getTwoFactorStatus: () => api.get('/users/me/two-factor'),

  beginTwoFactorSetup: () => api.post('/users/me/two-factor/setup'),

  enableTwoFactor: (data) => api.post('/users/me/two-factor/confirm', data),

  disableTwoFactor: (data) => api.delete('/users/me/two-factor', { data }),

  getAdminCustomers: (params, signal) =>
    api.get('/users/admin/customers', { params, signal }),
  getAdminCustomer: (id, page, signal) =>
    api.get(`/users/admin/customers/${id}`, { params: { page }, signal }),
  createAdminCustomer: (data) => api.post('/users/admin/customers', data),
  getAdminCustomerOverview: (days, signal) =>
    api.get('/users/admin/customers/overview', { params: { days }, signal }),
  exportAdminCustomers: (filters, ids) =>
    api.post('/users/admin/customers/export.csv', ids ? { ids } : {}, {
      params: filters,
      responseType: 'blob',
    }),
  setCustomerSuspension: (id, suspended) =>
    api.patch(`/users/admin/customers/${id}/suspension`, { suspended }),

  updateProfile: (data) => api.patch('/users/me', data),

  requestEmailChange: (data) => api.patch('/users/me/email', data),

  cancelEmailChange: () => api.delete('/users/me/email-change'),

  updateReviewProfile: (data) => api.patch('/users/me/review-profile', data),

  changePassword: (data) => api.put('/users/me/password', data),

  updateAvatar: (data) => api.patch('/users/me/avatar', data),

  updateBanner: (data) => api.patch('/users/me/banner', data),

  setFrame: (frame) => api.patch('/users/me/frame', { frame }),
}
