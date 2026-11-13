import '../AuthCard.css'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { forgotPasswordMutation } from '../../../entities/user/api'
import { forgotPasswordSchema } from '../../../entities/user/model'
export default function ForgotPasswordForm() {
  const [submittedEmail, setSubmittedEmail] = useState(null)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onSubmit',
    defaultValues: {
      email: '',
    },
  })
  const forgotPassword = useMutation({
    ...forgotPasswordMutation,
    // why: the success message always says "if this email is registered", never confirming
    // outright — revealing whether the address exists would let an attacker enumerate accounts
    onSuccess: (_res, variables) => {
      setSubmittedEmail(variables.email)
    },
    onError: (error) => {
      const message =
        error.response?.data?.message ||
        'Something went wrong. Please try again.'
      toast.error(message)
    },
  })
  const onSubmit = (data) => forgotPassword.mutate(data)
  return (
    <section className="auth-card">
      <div className="auth-card__card">
        <div className="auth-card__header">
          <h2 className="auth-card__title">Forgot Password</h2>
          <p className="auth-card__subtitle">We'll email you a reset link</p>
        </div>

        <div className="auth-card__body">
          {submittedEmail ? (
            <p className="auth-card__message">
              If <strong>{submittedEmail}</strong> is registered, a password
              reset link has been sent. Please check your inbox.
            </p>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="auth-card__field">
                <label htmlFor="email" className="auth-card__label">
                  Email Address
                </label>
                <div className="auth-card__input-group">
                  <input
                    id="email"
                    type="email"
                    autoFocus
                    {...register('email')}
                    placeholder="Enter your email"
                    autoComplete="email"
                    className="auth-card__input"
                  />
                </div>
                {errors.email && (
                  <span className="auth-card__error">
                    {errors.email.message}
                  </span>
                )}
              </div>

              <button
                type="submit"
                className={`auth-card__submit-button${forgotPassword.isPending ? ' auth-card__submit-button--loading' : ''}`}
              >
                <span className="auth-card__submit-button-label">
                  SEND RESET LINK
                </span>
                <div className="auth-card__loader">
                  <div className="auth-card__loader-bar" />
                  <div className="auth-card__loader-bar" />
                  <div className="auth-card__loader-bar" />
                </div>
              </button>
            </form>
          )}

          <p className="auth-card__prompt">
            Remembered your password?
            <Link to="/login" className="auth-card__link">
              Login
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
