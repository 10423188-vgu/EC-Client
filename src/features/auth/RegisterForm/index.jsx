import '../AuthCard.css'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { registerMutation } from '../../../entities/user/api'
import { registerSchema } from '../../../entities/user/model'
export default function RegisterForm() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: 'onSubmit',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })
  const registerUser = useMutation({
    ...registerMutation,
    onSuccess: (res) => {
      const emailSent = res.data.data.verificationEmailSent
      toast.success(
        emailSent
          ? 'Account created. Check your inbox for the verification link.'
          : 'Account created. Sign in and resend the verification email from your profile.',
      )
      navigate('/login', {
        replace: true,
      })
    },
    onError: (error) => {
      const message =
        error.response?.data?.message ||
        'Registration failed. Please try again.'
      toast.error(message)
    },
  })
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev)
  const onSubmit = (data) => {
    registerUser.mutate({
      name: data.name,
      email: data.email,
      password: data.password,
    })
  }
  return (
    <section className="auth-card">
      <div className="auth-card__card">
        <div className="auth-card__header">
          <h2 className="auth-card__title">Create Account</h2>
          <p className="auth-card__subtitle">Join us and start shopping</p>
        </div>

        <div className="auth-card__body">
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="auth-card__field">
              <label htmlFor="name" className="auth-card__label">
                Username
              </label>
              <div className="auth-card__input-group">
                <input
                  id="name"
                  type="text"
                  autoFocus
                  {...register('name')}
                  placeholder="Enter your username"
                  autoComplete="username"
                  className="auth-card__input"
                />
              </div>
              {errors.name && (
                <span className="auth-card__error">{errors.name.message}</span>
              )}
            </div>

            <div className="auth-card__field">
              <label htmlFor="email" className="auth-card__label">
                Email Address
              </label>
              <div className="auth-card__input-group">
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="Enter your email"
                  autoComplete="email"
                  className="auth-card__input"
                />
              </div>
              {errors.email && (
                <span className="auth-card__error">{errors.email.message}</span>
              )}
            </div>

            <div className="auth-card__field">
              <label htmlFor="password" className="auth-card__label">
                Password
              </label>
              <div className="auth-card__input-group auth-card__input-group--password">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="Enter your password"
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
                  placeholder="Re-enter your password"
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
              className={`auth-card__submit-button${registerUser.isPending ? ' auth-card__submit-button--loading' : ''}`}
            >
              <span className="auth-card__submit-button-label">SIGN UP</span>
              <div className="auth-card__loader">
                <div className="auth-card__loader-bar" />
                <div className="auth-card__loader-bar" />
                <div className="auth-card__loader-bar" />
              </div>
            </button>
          </form>

          <p className="auth-card__prompt">
            Already have an account?
            <Link to="/login" className="auth-card__link">
              Login
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
