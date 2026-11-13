import '../AuthCard.css'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { verifyEmailMutation } from '../../../entities/user/api'
import { USER_KEYS } from '../../../entities/user'
export default function VerifyEmailFlow() {
  const [searchParams, setSearchParams] = useSearchParams()
  // why: capture the token once on mount, before it's stripped from the URL below —
  // re-reading from searchParams afterwards would return null
  const [token] = useState(() => searchParams.get('token'))
  const queryClient = useQueryClient()
  const verifyEmail = useMutation({
    ...verifyEmailMutation,
    onSuccess: () => {
      // why: so the checkout banner (and anything else gated on emailVerifiedAt) updates
      // immediately instead of waiting on useCurrentUser's staleTime
      queryClient.invalidateQueries({
        queryKey: USER_KEYS.current,
      })
    },
  })
  useEffect(() => {
    if (!token) return
    // why: a verification token in the address bar lingers in browser history and can
    // leak via Referer to any resource this page loads — clear it as soon as it's read
    setSearchParams(
      {},
      {
        replace: true,
      },
    )
    verifyEmail.mutate({
      token,
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!token) {
    return (
      <section className="auth-card">
        <div className="auth-card__card">
          <div className="auth-card__header">
            <h2 className="auth-card__title">Invalid Link</h2>
          </div>
          <div className="auth-card__body">
            <p className="auth-card__message">
              This verification link is invalid or missing its token.
            </p>
            <p className="auth-card__prompt">
              <Link to="/" className="auth-card__link">
                Back to home
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
          <h2 className="auth-card__title">
            {verifyEmail.isSuccess
              ? 'Email Verified'
              : verifyEmail.isError
                ? 'Verification Failed'
                : 'Verifying...'}
          </h2>
        </div>
        <div className="auth-card__body">
          <p className="auth-card__message">
            {verifyEmail.isSuccess &&
              'Your email has been verified. You can now check out.'}
            {verifyEmail.isError &&
              (verifyEmail.error.response?.data?.message ||
                'This link is invalid or may have expired.')}
            {verifyEmail.isPending && 'Please wait while we verify your email.'}
          </p>
          <p className="auth-card__prompt">
            <Link to="/" className="auth-card__link">
              Back to home
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
