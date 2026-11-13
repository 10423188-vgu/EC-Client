import { api } from '../../../shared/api/api.js'

export const reviewService = {
  getProductReviews: (productId, params) =>
    api.get(`/products/${productId}/reviews`, { params }),

  getMyReview: (productId) => api.get(`/products/${productId}/reviews/me`),

  getMyReviews: (params) => api.get('/reviews/me', { params }),

  createReview: (productId, data) =>
    api.post(`/products/${productId}/reviews`, data),

  updateReview: (reviewId, data) => api.put(`/reviews/${reviewId}`, data),

  deleteReview: (reviewId) => api.delete(`/reviews/${reviewId}`),

  voteHelpful: (reviewId, vote) =>
    api.post(`/reviews/${reviewId}/vote`, { vote }),

  adminListReviews: (params) => api.get('/admin/reviews', { params }),

  updateStatus: (reviewId, status) =>
    api.patch(`/admin/reviews/${reviewId}/status`, { status }),

  addAdminResponse: (reviewId, body) =>
    api.post(`/admin/reviews/${reviewId}/response`, { body }),
}
