import { FiChevronRight } from 'react-icons/fi'
import { RiSmartphoneLine } from 'react-icons/ri'
import { VerificationBadge } from '../../../shared/components'
import { useProfile, useTwoFactorStatus } from '../hooks'
import ActiveSessions from './ActiveSessions'
import EmailSettings from './EmailSettings'
import PasswordSettings from './PasswordSettings'
import TwoFactorSettings from './TwoFactorSettings'
import { SecurityItemSkeleton } from './ProfileSecuritySkeleton'
import './ProfileSecurity.css'

export default function ProfileSecurity({ user }) {
  const { requestEmailChange, cancelEmailChange, resendVerification } =
    useProfile()
  const statusQuery = useTwoFactorStatus()
  const enabled = statusQuery.data?.enabled ?? false
  const verificationState = statusQuery.isSuccess
    ? enabled
      ? 'verified'
      : 'unverified'
    : 'pending'
  const verificationLabel = statusQuery.isError
    ? 'Two-factor authentication status unavailable'
    : statusQuery.isLoading
      ? 'Checking two-factor authentication status'
      : enabled
        ? 'Two-factor authentication enabled'
        : 'Two-factor authentication not enabled'
  return (
    <section className="profile-security" aria-label="Security settings">
      <EmailSettings
        user={user}
        onRequestChange={requestEmailChange.mutateAsync}
        onKeepCurrent={cancelEmailChange.mutateAsync}
        onResend={() => resendVerification.mutate()}
        isSaving={requestEmailChange.isPending}
        isKeepingCurrent={cancelEmailChange.isPending}
        isResending={resendVerification.isPending}
      />
      <PasswordSettings user={user} />
      {statusQuery.isLoading ? (
        <SecurityItemSkeleton />
      ) : (
        <details className="profile-security__item">
          <summary className="profile-security__summary">
            <RiSmartphoneLine
              className="profile-security__icon"
              aria-hidden="true"
            />
            <span className="profile-security__label">
              <strong>Two-factor authentication</strong>
              <span>Authenticator app and recovery codes</span>
            </span>
            <span className="profile-security__status">
              <span>
                {statusQuery.isError
                  ? 'Unavailable'
                  : enabled
                    ? 'Enabled'
                    : 'Not enabled'}
              </span>
              <VerificationBadge
                status={verificationState}
                ariaLabel={verificationLabel}
              />
            </span>
            <FiChevronRight
              className="profile-security__chevron"
              aria-hidden="true"
            />
          </summary>
          <div className="profile-security__content">
            <TwoFactorSettings statusQuery={statusQuery} />
          </div>
        </details>
      )}
      <ActiveSessions />
    </section>
  )
}
