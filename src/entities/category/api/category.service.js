import { api } from '../../../shared/api/api.js'

export const categoryService = {
  getCategories: (params) => api.get('/categories', { params }),
  adminList: (params, signal) =>
    api
      .get('/categories/admin/list', { params, signal })
      .then((res) => res.data),
  parentOptions: (signal) =>
    api
      .get('/categories/admin/options', { signal })
      .then((res) => res.data.data),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  remove: (id) => api.delete(`/categories/${id}`),
}
