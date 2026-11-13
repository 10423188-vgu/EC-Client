import { api } from '../../../shared/api/api.js'

export const authService = {
  login: (data) => api.post('/auth/login', data),
  verifyTwoFactor: (data) => api.post('/auth/two-factor/verify', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getSessions: () => api.get('/auth/sessions'),
  revokeSession: (id) => api.delete(`/auth/sessions/${id}`),
  revokeOtherSessions: () => api.post('/auth/sessions/revoke-others'),
  refresh: () => api.post('/auth/refresh'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  verifyEmail: (data) => api.post('/auth/verify-email', data),
  resendVerification: () => api.post('/auth/resend-verification'),
  googleLogin: (data) => api.post('/auth/google', data),
}
