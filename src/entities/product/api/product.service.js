import { api } from '../../../shared/api/api.js'

export const productService = {
  getProducts: (params) => api.get('/products', { params }),
  getProductById: (id) => api.get(`/products/${id}`),
  getRelatedProducts: (id, params) =>
    api.get(`/products/${id}/related`, { params }),
  search: (params) => api.get('/search', { params }),
}
