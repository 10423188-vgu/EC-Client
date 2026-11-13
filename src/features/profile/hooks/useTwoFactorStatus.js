import { useQuery } from '@tanstack/react-query'
import { USER_KEYS, userService } from '../../../entities/user'

export function useTwoFactorStatus() {
  return useQuery({
    queryKey: [...USER_KEYS.current, 'twoFactor'],
    queryFn: () =>
      userService.getTwoFactorStatus().then((response) => response.data.data),
  })
}
