import { useMutation, useQueryClient } from '@tanstack/react-query'
import { paymentService } from './payment.service.js'
import { invalidateOrderViews } from '../../order'

export const useConfirmPayment = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (orderId) =>
      paymentService.confirm(orderId).then((res) => res.data.data),
    onSuccess: (_result, id) => invalidateOrderViews(qc, id),
  })
}
