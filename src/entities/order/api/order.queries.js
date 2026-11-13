import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { orderService } from './order.service.js'
import { ORDER_KEYS } from './order.keys.js'

export const useOrders = (params = {}) =>
  useQuery({
    queryKey: ORDER_KEYS.list(params),
    queryFn: ({ signal }) =>
      orderService.list(params, signal).then((res) => res.data),
  })

export const useOrderById = (id, { refetchInterval } = {}) =>
  useQuery({
    queryKey: ORDER_KEYS.detail(id),
    queryFn: ({ signal }) =>
      orderService.getById(id, signal).then((res) => res.data.data),
    enabled: !!id,
    refetchInterval,
  })

export const useAdminOrders = (
  params = {},
  { enabled = true, refetchInterval } = {},
) =>
  useQuery({
    queryKey: ORDER_KEYS.adminList(params),
    queryFn: ({ signal }) =>
      orderService.adminList(params, signal).then((res) => res.data),
    enabled,
    placeholderData: keepPreviousData,
    refetchInterval,
  })

export const useAdminOrderById = (id, { enabled = true } = {}) =>
  useQuery({
    queryKey: ORDER_KEYS.adminDetail(id),
    queryFn: ({ signal }) =>
      orderService.adminGetById(id, signal).then((res) => res.data.data),
    enabled: !!id && enabled,
  })

export const useAdminOrderMetrics = (
  params = {},
  { enabled = true, refetchInterval } = {},
) =>
  useQuery({
    queryKey: ORDER_KEYS.adminMetrics(params),
    queryFn: ({ signal }) =>
      orderService.adminMetrics(params, signal).then((res) => res.data.data),
    staleTime: 15000,
    enabled,
    refetchInterval,
  })

export const useAdminOrderAnalytics = (days) =>
  useQuery({
    queryKey: ORDER_KEYS.adminAnalytics(days),
    queryFn: ({ signal }) =>
      orderService
        .adminAnalytics({ days }, signal)
        .then((res) => res.data.data),
    staleTime: 15000,
  })
