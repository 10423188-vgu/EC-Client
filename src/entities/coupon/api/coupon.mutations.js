import { useMutation, useQueryClient } from '@tanstack/react-query'
import { couponService } from './coupon.service.js'
import { COUPON_KEYS } from './coupon.keys.js'

export const useValidateCoupon = () =>
  useMutation({
    mutationFn: (code) =>
      couponService.validate(code).then((res) => res.data.data),
  })

export const useCreateCoupon = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) =>
      couponService.create(data).then((res) => res.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: COUPON_KEYS.all }),
  })
}

export const useUpdateCoupon = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) =>
      couponService.update(id, data).then((res) => res.data.data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: COUPON_KEYS.all })
      qc.invalidateQueries({ queryKey: COUPON_KEYS.detail(id) })
    },
  })
}

export const useDeleteCoupon = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => couponService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: COUPON_KEYS.all }),
  })
}
