import { api } from '../../../shared/api/api'

export const brandService = {
  adminList: (params, signal) =>
    api.get('/brands/admin/list', { params, signal }).then((res) => res.data),
  create: (data) => api.post('/brands', data),
  update: (id, data) => api.put(`/brands/${id}`, data),
  remove: (id) => api.delete(`/brands/${id}`),
}
