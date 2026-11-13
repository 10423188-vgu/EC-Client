import { useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationService } from './notification.service.js'
import { NOTIFICATION_KEYS } from './notification.keys.js'

export const useMarkNotificationRead = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => notificationService.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all }),
  })
}

export const useMarkAllNotificationsRead = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all }),
  })
}
