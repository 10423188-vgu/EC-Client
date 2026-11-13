import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authService } from './auth.service'
import { useAuthStore } from '../model/auth.store'

export const loginMutation = {
  mutationFn: authService.login,
}

export const googleLoginMutation = {
  mutationFn: authService.googleLogin,
}

export const verifyTwoFactorMutation = {
  mutationFn: authService.verifyTwoFactor,
}

export const registerMutation = {
  mutationFn: authService.register,
}

export const forgotPasswordMutation = {
  mutationFn: authService.forgotPassword,
}

export const resetPasswordMutation = {
  mutationFn: authService.resetPassword,
}

export const verifyEmailMutation = {
  mutationFn: authService.verifyEmail,
}

export const resendVerificationMutation = {
  mutationFn: authService.resendVerification,
}

export const logoutMutation = {
  mutationFn: authService.logout,
}

// why: placed in entities so widgets can import it without crossing layer boundaries
export const useLogout = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const clearUser = useAuthStore((s) => s.clearUser)

  return useMutation({
    ...logoutMutation,
    onMutate: () => {
      clearUser()
      // why: "storage" event fires in other tabs (not this one) — AppInit listens for key
      // "logout" to clear their auth state too, syncing logout across tabs
      localStorage.setItem('logout', Date.now())
      navigate('/login', { replace: true })
    },
    onSettled: () => {
      queryClient.clear()
    },
  })
}
