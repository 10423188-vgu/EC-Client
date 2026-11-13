import { useEffect } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { userService } from './user.service'
import { useAuthStore } from '../model'
import { USER_KEYS } from './user.keys'

export const useAdminCustomers = (params = {}) =>
  useQuery({
    queryKey: USER_KEYS.adminCustomers(params),
    queryFn: ({ signal }) =>
      userService
        .getAdminCustomers(params, signal)
        .then((response) => response.data.data),
    placeholderData: keepPreviousData,
  })

export const useAdminCustomer = (id, page) =>
  useQuery({
    queryKey: USER_KEYS.adminCustomer(id, page),
    queryFn: ({ signal }) =>
      userService
        .getAdminCustomer(id, page, signal)
        .then((response) => response.data.data),
    placeholderData: keepPreviousData,
  })

export const useAdminCustomerOverview = (days) =>
  useQuery({
    queryKey: USER_KEYS.adminCustomerOverview(days),
    queryFn: ({ signal }) =>
      userService
        .getAdminCustomerOverview(days, signal)
        .then((response) => response.data.data),
    staleTime: 30000,
  })

export const useCurrentUser = () => {
  const setUser = useAuthStore((s) => s.setUser)
  const clearUser = useAuthStore((s) => s.clearUser)

  const query = useQuery({
    queryKey: USER_KEYS.current,
    queryFn: async () => {
      const { data } = await userService.getCurrentUser()
      return data.data
    },
    retry: (failureCount, error) => {
      const status = error?.response?.status
      if (status === 401 || status === 403) return false
      return failureCount < 1
    },
    // why: Infinity causes role/permission changes to never reflect without hard refresh
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    if (query.data) setUser(query.data)
  }, [query.data, setUser])

  // why: any terminal failure — 401/403, but also network error/500/timeout — must resolve
  // isInitialized, or PrivateGuard/PublicGuard stay stuck on "Loading..." forever. We can't tell
  // "confirmed logged out" apart from "couldn't confirm" here, so both fail safe as logged out.
  useEffect(() => {
    if (query.isError) clearUser()
  }, [query.isError, clearUser])

  return query
}
