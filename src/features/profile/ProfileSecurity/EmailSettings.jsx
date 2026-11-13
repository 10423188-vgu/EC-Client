import './EmailSettings.css'
import { useState } from 'react'
import { FiChevronRight } from 'react-icons/fi'
import { RiMailLine } from 'react-icons/ri'
import { PanelButton, VerificationBadge } from '../../../shared/components'

export default function EmailSettings({
  user,
  onRequestChange,
  onKeepCurrent,
  onResend,
  isSaving,
  isKeepingCurrent,
  isResending,
}) {
  const [email, setEmail] = useState(user?.pendingEmail ?? '')
  const emailStatus = user?.pendingEmail
    ? 'Confirmation pending'
    : user?.emailVerifiedAt
      ? 'Verified'
      : 'Not verified'

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      await onRequestChange({ email: email.trim() })
    } catch {
      // The profile mutation displays the server error.
    }
  }

  const handleKeepCurrent = async () => {
    try {
      await onKeepCurrent()
      setEmail('')
    } catch {
      // The profile mutation displays the server error.
    }
  }

  return (
    <details className="profile-security__item email-settings">
      <summary className="profile-security__summary">
        <RiMailLine className="profile-security__icon" aria-hidden="true" />
        <span className="profile-security__label">
          <strong>Email address</strong>
          <span>{user?.email}</span>
        </span>
        <span className="profile-security__status">
          <span>{emailStatus}</span>
          <VerificationBadge
            status={user?.emailVerifiedAt ? 'verified' : 'unverified'}
            ariaLabel={`Email address ${user?.emailVerifiedAt ? 'verified' : 'not verified'}`}
          />
        </span>
        <FiChevronRight
          className="profile-security__chevron"
          aria-hidden="true"
        />
      </summary>
      <div className="profile-security__content email-settings__content">
        <form className="email-settings__form" onSubmit={handleSubmit}>
          <label className="email-settings__label" htmlFor="profile-new-email">
            {user?.emailVerifiedAt
              ? 'Change email address'
              : 'Enter an email you can access'}
          </label>
          <div className="email-settings__actions">
            <input
              id="profile-new-email"
              type="email"
              autoComplete="off"
              className="email-settings__input"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
            <PanelButton
              type="submit"
              label="Send verification link"
              loadingLabel="Sending…"
              loading={isSaving}
              disabled={!email.trim()}
            />
          </div>
        </form>
        {user?.pendingEmail && (
          <div className="email-settings__pending-row">
            <p className="email-settings__notice">
              <span>
                Waiting for confirmation at <strong>{user.pendingEmail}</strong>
                . Your current email stays active until then.
              </span>
            </p>
            <PanelButton
              className="email-settings__keep-button"
              label="Keep current email"
              loadingLabel="Keeping current email…"
              loading={isKeepingCurrent}
              onClick={handleKeepCurrent}
            />
          </div>
        )}
        {(!user?.emailVerifiedAt || user?.pendingEmail) && (
          <button
            type="button"
            className="email-settings__resend"
            onClick={onResend}
            disabled={isResending}
          >
            {isResending ? 'Sending…' : 'Resend verification email'}
          </button>
        )}
      </div>
    </details>
  )
}
