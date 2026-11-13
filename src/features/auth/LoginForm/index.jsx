import '../AuthCard.css'
import './LoginForm.css'
import { lazy, Suspense, useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useAuth } from '../hooks/useAuth'
import { loginSchema } from '../../../entities/user/model'
const GoogleSignIn = lazy(() => import('./GoogleSignIn.jsx'))
export default function LoginForm() {
  const { login, loginWithGoogle, verifyTwoFactor } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [challengeToken, setChallengeToken] = useState('')
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const loginInFlight = useRef(false)
  const isSigningIn =
    login.isPending || loginWithGoogle.isPending || verifyTwoFactor.isPending
  const isBusy = isSigningIn
  const hasGoogleClientId = !!import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim()
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
  })
  const remember = useWatch({ control, name: 'remember' })
  useEffect(() => {
    const savedEmail = localStorage.getItem('loginEmail')
    if (savedEmail) {
      setValue('email', savedEmail, {
        shouldDirty: false,
      })
      setValue('remember', true, {
        shouldDirty: false,
      })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!remember) localStorage.removeItem('loginEmail')
  }, [remember])
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev)
  const onSubmit = (data) => {
    if (loginInFlight.current || isBusy) return
    if (challengeToken) {
      if (!/^(\d{6}|[A-F\d]{16})$/i.test(twoFactorCode.trim())) {
        toast.error('Enter a 6-digit authenticator code or recovery code.')
        return
      }
      loginInFlight.current = true
      verifyTwoFactor.mutate(
        { challengeToken, code: twoFactorCode.trim() },
        {
          onSuccess: (response) => {
            if (response.data.data?.requiresTwoFactor) return
            loginInFlight.current = false
          },
          onError: (error) => {
            loginInFlight.current = false
            toast.error(
              error.response?.data?.message || 'Authenticator code rejected.',
            )
          },
        },
      )
      return
    }
    // why: a ref closes the gap before mutation state renders disabled controls.
    loginInFlight.current = true
    if (data.remember) {
      localStorage.setItem('loginEmail', data.email)
    } else {
      localStorage.removeItem('loginEmail')
    }
    login.mutate(
      {
        email: data.email,
        password: data.password,
      },
      {
        onSuccess: (response) => {
          const challenge = response.data.data
          if (!challenge?.requiresTwoFactor) return
          loginInFlight.current = false
          setChallengeToken(challenge.challengeToken)
          toast.message('Enter the code from your authenticator app.')
        },
        onError: (error) => {
          loginInFlight.current = false
          const message =
            error.response?.data?.message || 'Login failed. Please try again.'
          toast.error(message)
        },
      },
    )
  }
  const handleGoogleSuccess = (credentialResponse) => {
    if (loginInFlight.current || isBusy) return
    if (!credentialResponse.credential) {
      toast.error('Google sign-in failed. Please try again.')
      return
    }
    loginInFlight.current = true
    loginWithGoogle.mutate(
      {
        credential: credentialResponse.credential,
      },
      {
        onSuccess: (response) => {
          const challenge = response.data.data
          if (!challenge?.requiresTwoFactor) return
          loginInFlight.current = false
          setChallengeToken(challenge.challengeToken)
          toast.message('Enter the code from your authenticator app.')
        },
        onError: (error) => {
          loginInFlight.current = false
          toast.error(
            error.response?.data?.message ||
              'Google sign-in failed. Please try again.',
          )
        },
      },
    )
  }

  const handleSocialLogin = () => {
    toast.info('Facebook sign-in is not available yet.')
  }
  const handleLoginFormSubmit = (event) => {
    if (challengeToken) {
      event.preventDefault()
      onSubmit({})
      return
    }
    return handleSubmit(onSubmit)(event)
  }
  return (
    <section className="auth-card">
      <div className="auth-card__card">
        <div className="auth-card__header">
          <h2 className="auth-card__title">
            {challengeToken ? 'Verify your identity' : 'Welcome Back'}
          </h2>
          <p className="auth-card__subtitle">
            {challengeToken
              ? 'One more step to secure your account'
              : 'Please login to your account'}
          </p>
        </div>

        <div className="auth-card__body">
          <form onSubmit={handleLoginFormSubmit} noValidate>
            <div className="auth-card__field" hidden={Boolean(challengeToken)}>
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
                <span className="auth-card__error">{errors.email.message}</span>
              )}
            </div>

            <div className="auth-card__field" hidden={Boolean(challengeToken)}>
              <label htmlFor="password" className="auth-card__label">
                Password
              </label>
              <div className="auth-card__input-group auth-card__input-group--password">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="Enter your password"
                  autoComplete="current-password"
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

            {challengeToken && (
              <div className="auth-card__field">
                <label htmlFor="two-factor-code" className="auth-card__label">
                  Authenticator or recovery code
                </label>
                <div className="auth-card__input-group">
                  <input
                    id="two-factor-code"
                    type="text"
                    value={twoFactorCode}
                    autoComplete="one-time-code"
                    autoCapitalize="off"
                    autoCorrect="off"
                    className="auth-card__input"
                    onChange={(event) => setTwoFactorCode(event.target.value)}
                    placeholder="Enter your code"
                    spellCheck={false}
                    autoFocus
                    aria-describedby="two-factor-code-hint"
                  />
                </div>
                <p id="two-factor-code-hint" className="auth-card__code-hint">
                  Enter the 6-digit code from your authenticator app or a
                  16-character recovery code.
                </p>
              </div>
            )}

            <div
              className="auth-card__options"
              hidden={Boolean(challengeToken)}
            >
              <div className="auth-card__checkbox">
                <input
                  id="remember"
                  type="checkbox"
                  {...register('remember')}
                  className="auth-card__checkbox-input"
                />
                <label htmlFor="remember" className="auth-card__checkbox-label">
                  <span className="auth-card__checkbox-indicator" />
                  <span>Remember Me</span>
                </label>
              </div>
              <Link to="/forgot-password" className="auth-card__link">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className={`auth-card__submit-button${isSigningIn ? ' auth-card__submit-button--loading' : ''}`}
              disabled={isBusy}
            >
              <span className="auth-card__submit-button-label">
                {challengeToken ? 'VERIFY CODE' : 'SIGN IN'}
              </span>
              <div className="auth-card__loader">
                <div className="auth-card__loader-bar" />
                <div className="auth-card__loader-bar" />
                <div className="auth-card__loader-bar" />
              </div>
            </button>
            {challengeToken && (
              <button
                type="button"
                className="auth-card__back-button"
                onClick={() => {
                  setChallengeToken('')
                  setTwoFactorCode('')
                }}
                disabled={isBusy}
              >
                Back to sign in
              </button>
            )}
          </form>

          <div className="auth-card__divider" hidden={Boolean(challengeToken)}>
            <span className="auth-card__divider-label">OR</span>
          </div>

          <div className="auth-card__social" hidden={Boolean(challengeToken)}>
            <div
              className="auth-card__social-google"
              aria-busy={loginWithGoogle.isPending}
            >
              {hasGoogleClientId ? (
                <Suspense
                  fallback={
                    <p className="auth-card__google-status" role="status">
                      Loading Google sign-in...
                    </p>
                  }
                >
                  <GoogleSignIn
                    onError={() =>
                      toast.error('Google sign-in failed. Please try again.')
                    }
                    onSuccess={handleGoogleSuccess}
                    disabled={isBusy}
                  />
                </Suspense>
              ) : (
                <p className="auth-card__google-status">
                  Google sign-in is currently unavailable. Use email and
                  password.
                </p>
              )}
              {loginWithGoogle.isPending && (
                <p className="auth-card__google-status" role="status">
                  Signing in with Google…
                </p>
              )}
            </div>
            <button
              type="button"
              className="auth-card__social-button"
              onClick={handleSocialLogin}
              disabled={isBusy}
            >
              FACEBOOK
            </button>
          </div>

          <p className="auth-card__prompt" hidden={Boolean(challengeToken)}>
            No account?
            <Link to="/register" className="auth-card__link">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
