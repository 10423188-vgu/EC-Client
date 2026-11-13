import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { couponService } from './coupon.service.js'
import { COUPON_KEYS } from './coupon.keys.js'

export const useCoupons = (params) =>
  useQuery({
    queryKey: COUPON_KEYS.list(params),
    queryFn: ({ signal }) =>
      couponService.list(params, signal).then((response) => response.data),
    placeholderData: keepPreviousData,
  })

export const useCouponById = (id) =>
  useQuery({
    queryKey: COUPON_KEYS.detail(id),
    queryFn: ({ signal }) =>
      couponService.getById(id, signal).then((response) => response.data.data),
    enabled: Boolean(id),
  })
