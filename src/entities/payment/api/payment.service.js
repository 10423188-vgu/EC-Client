import { api } from '../../../shared/api/api.js'

export const paymentService = {
  confirm: (orderId) => api.patch(`/payments/${orderId}/confirm`),
}
