import { api } from '../../../shared/api/api.js'

export const addressService = {
  createAddress: (data) => api.post('/addresses', data),

  updateAddress: (id, data) => api.put(`/addresses/${id}`, data),

  deleteAddress: (id) => api.delete(`/addresses/${id}`),

  setDefaultAddress: (id) => api.patch(`/addresses/${id}/default`),
}
