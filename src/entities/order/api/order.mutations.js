import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orderService } from './order.service.js'
import { ORDER_KEYS } from './order.keys.js'
import { USER_KEYS } from '../../user'
import { invalidateOrderViews } from './order.cache'

export const useCheckout = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) =>
      orderService.checkout(data).then((res) => res.data.data),
    onSuccess: (result) => invalidateOrderViews(qc, result.orderId),
  })
}

export const useCancelOrder = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => orderService.cancel(id).then((res) => res.data.data),
    onSuccess: (_result, id) =>
      Promise.all([
        invalidateOrderViews(qc, id),
        qc.invalidateQueries({ queryKey: USER_KEYS.current }),
      ]),
  })
}

export const useAdminUpdateOrderStatus = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status, reason }) =>
      orderService
        .adminUpdateStatus(id, { status, reason })
        .then((res) => res.data.data),
    onSuccess: (_result, { id }) => invalidateOrderViews(qc, id),
  })
}

export const useAdminCancelOrder = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }) =>
      orderService.adminCancel(id, reason).then((res) => res.data.data),
    onSuccess: (_result, { id }) => invalidateOrderViews(qc, id),
  })
}

export const useAdminRefundOrder = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) =>
      orderService.adminRefund(id, data).then((res) => res.data.data),
    onSuccess: (_result, { id }) => invalidateOrderViews(qc, id),
  })
}

export const useAdminUpdateOrderShipping = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) =>
      orderService.adminUpdateShipping(id, data).then((res) => res.data.data),
    onSuccess: (_, { id }) => {
      // why: tracking only changes detail data; totals and table columns stay valid.
      qc.invalidateQueries({ queryKey: ORDER_KEYS.detail(id) })
      qc.invalidateQueries({ queryKey: ORDER_KEYS.adminDetail(id) })
    },
  })
}

export const useAdminExportOrders = () =>
  useMutation({
    mutationFn: ({ filters, ids }) =>
      (ids
        ? orderService.adminExportSelected(ids)
        : orderService.adminExport(filters)
      ).then((res) => res.data),
  })

export const useCreateReturn = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) =>
      orderService.createReturn(id, data).then((res) => res.data.data),
    onSuccess: (_result, { id }) =>
      invalidateOrderViews(qc, id, { metrics: false }),
  })
}

export const useAdminUpdateReturnStatus = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ returnId, ...data }) =>
      orderService
        .adminUpdateReturnStatus(returnId, data)
        .then((res) => res.data.data),
    onSuccess: (result) =>
      invalidateOrderViews(qc, result.orderId, { metrics: false }),
  })
}
