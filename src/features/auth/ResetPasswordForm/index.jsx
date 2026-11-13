import '../AuthCard.css'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { resetPasswordMutation } from '../../../entities/user/api'
import { resetPasswordSchema } from '../../../entities/user/model'
export default function ResetPasswordForm() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  // why: capture the token once on mount, before it's stripped from the URL below —
  // re-reading from searchParams afterwards would return null
  const [token] = useState(() => searchParams.get('token'))
  const [showPassword, setShowPassword] = useState(false)
  useEffect(() => {
    // why: a reset token in the address bar lingers in browser history and can leak via
    // Referer to any resource this page loads — clear it from the URL as soon as it's read
    if (token)
      setSearchParams(
        {},
        {
          replace: true,
        },
      )
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onSubmit',
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })
  const resetPassword = useMutation({
    ...resetPasswordMutation,
    onSuccess: () => {
      toast.success(
        'Password reset successful! Please login with your new password.',
      )
      navigate('/login', {
        replace: true,
      })
    },
    onError: (error) => {
      const message =
        error.response?.data?.message ||
        'Reset failed. The link may have expired.'
      toast.error(message)
    },
  })
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev)
  const onSubmit = (data) =>
    resetPassword.mutate({
      token,
      password: data.password,
    })
  if (!token) {
    return (
      <section className="auth-card">
        <div className="auth-card__card">
          <div className="auth-card__header">
            <h2 className="auth-card__title">Invalid Link</h2>
          </div>
          <div className="auth-card__body">
            <p className="auth-card__message">
              This reset link is invalid or missing its token. Please request a
              new one.
            </p>
            <p className="auth-card__prompt">
              <Link to="/forgot-password" className="auth-card__link">
                Request new link
              </Link>
            </p>
          </div>
        </div>
      </section>
    )
  }
  return (
    <section className="auth-card">
      <div className="auth-card__card">
        <div className="auth-card__header">
          <h2 className="auth-card__title">Reset Password</h2>
          <p className="auth-card__subtitle">Choose a new password</p>
        </div>

        <div className="auth-card__body">
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="auth-card__field">
              <label htmlFor="password" className="auth-card__label">
                New Password
              </label>
              <div className="auth-card__input-group auth-card__input-group--password">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoFocus
                  {...register('password')}
                  placeholder="Enter your new password"
                  autoComplete="new-password"
                  className="auth-card__input"
                />
                <button
                  type="button"
                  className="auth-card__toggle"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="auth-card__toggle-label">
                    {showPassword ? 'HIDE' : 'SHOW'}
                  </span>
                </button>
              </div>
              {errors.password && (
                <span className="auth-card__error">
                  {errors.password.message}
                </span>
              )}
            </div>

            <div className="auth-card__field">
              <label htmlFor="confirmPassword" className="auth-card__label">
                Confirm Password
              </label>
              <div className="auth-card__input-group">
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  {...register('confirmPassword')}
                  placeholder="Re-enter your new password"
                  autoComplete="new-password"
                  className="auth-card__input"
                />
              </div>
              {errors.confirmPassword && (
                <span className="auth-card__error">
                  {errors.confirmPassword.message}
                </span>
              )}
            </div>

            <button
              type="submit"
              className={`auth-card__submit-button${resetPassword.isPending ? ' auth-card__submit-button--loading' : ''}`}
            >
              <span className="auth-card__submit-button-label">
                RESET PASSWORD
              </span>
              <div className="auth-card__loader">
                <div className="auth-card__loader-bar" />
                <div className="auth-card__loader-bar" />
                <div className="auth-card__loader-bar" />
              </div>
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
