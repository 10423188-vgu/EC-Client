import { api } from '../../../shared/api/api.js'

export const cartService = {
  getCart: () => api.get('/cart'),
  addItem: (variantId) => api.post('/cart', { variantId }),
  upsertItem: ({ variantId, quantity }) =>
    api.put('/cart', { variantId, quantity }),
  removeItem: (variantId) => api.delete(`/cart/${variantId}`),
  clearCart: () => api.delete('/cart'),
}
