import { lazy } from 'react'
const Login = lazy(() => import('../../../pages/auth/LoginPage'))
const Register = lazy(() => import('../../../pages/auth/RegisterPage'))
const ForgotPassword = lazy(
  () => import('../../../pages/auth/ForgotPasswordPage'),
)
const ResetPassword = lazy(
  () => import('../../../pages/auth/ResetPasswordPage'),
)
export const AuthRoutes = [
  {
    path: 'login',
    element: <Login />,
  },
  {
    path: 'register',
    element: <Register />,
  },
  {
    path: 'forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: 'reset-password',
    element: <ResetPassword />,
  },
]
