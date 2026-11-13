import { api } from '../../../shared/api/api.js'

export const WISHLIST_PAGE_LIMIT = 8

export const wishlistService = {
  getWishlist: (page, signal) =>
    api.get('/wishlist', {
      params: { page, limit: WISHLIST_PAGE_LIMIT },
      signal,
    }),
  getWishlistIds: (productIds, signal) =>
    api.get('/wishlist/ids', {
      params: { productIds: productIds.join(',') },
      signal,
    }),
  toggle: (productId) => api.post(`/wishlist/${productId}/toggle`),
  clear: () => api.delete('/wishlist'),
  getPreferences: () => api.get('/wishlist/preferences'),
  updatePreferences: (saleAlerts) =>
    api.patch('/wishlist/preferences', { saleAlerts }),
  enableSharing: () => api.put('/wishlist/share'),
  disableSharing: () => api.delete('/wishlist/share'),
  getSharedWishlist: (token, page, signal) =>
    api.get(`/wishlist/shared/${token}`, {
      params: { page, limit: 12 },
      signal,
    }),
}
