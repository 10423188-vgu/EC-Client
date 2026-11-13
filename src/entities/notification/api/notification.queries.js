import { useQuery } from '@tanstack/react-query'
import { notificationService } from './notification.service.js'
import { NOTIFICATION_KEYS } from './notification.keys.js'

export const useNotifications = (
  params = {},
  { enabled = true, refetchInterval } = {},
) =>
  useQuery({
    queryKey: NOTIFICATION_KEYS.list(params),
    queryFn: () => notificationService.list(params).then((res) => res.data),
    enabled,
    refetchInterval,
  })
