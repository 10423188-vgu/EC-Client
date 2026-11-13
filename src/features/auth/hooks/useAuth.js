import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  loginMutation,
  googleLoginMutation,
  verifyTwoFactorMutation,
  USER_KEYS,
} from '../../../entities/user/api'
import { useAuthStore } from '../../../entities/user/model'

// why: register/logout live on entities/user/api (registerMutation, useLogout) — this hook only
// wraps login (+ googleLogin, same response shape/side effects), which need the store's
// setUser + query cache update on success
export function useAuth() {
  const queryClient = useQueryClient()
  const setUser = useAuthStore((s) => s.setUser)

  const onLoginSuccess = (res) => {
    const user = res.data.data
    if (user?.requiresTwoFactor) return
    toast.success(
      user?.emailVerifiedAt
        ? 'Login successful!'
        : 'Login successful. Verify your email from your profile before checkout.',
    )
    setUser(user)
    queryClient.setQueryData(USER_KEYS.current, user)
  }

  const login = useMutation({ ...loginMutation, onSuccess: onLoginSuccess })
  const loginWithGoogle = useMutation({
    ...googleLoginMutation,
    onSuccess: onLoginSuccess,
  })
  const verifyTwoFactor = useMutation({
    ...verifyTwoFactorMutation,
    onSuccess: onLoginSuccess,
  })

  return { login, loginWithGoogle, verifyTwoFactor }
}
