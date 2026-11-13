import './VerificationBadge.css'
import { PiSealFill } from 'react-icons/pi'
import { RiCheckLine, RiErrorWarningLine, RiQuestionLine } from 'react-icons/ri'

const STATUS_LABELS = {
  verified: 'Verified',
  unverified: 'Not verified',
  pending: 'Verification status pending',
}

export function VerificationBadge({
  ariaLabel,
  className = '',
  status = 'pending',
  tabIndex,
}) {
  const safeStatus = Object.hasOwn(STATUS_LABELS, status) ? status : 'pending'
  const MarkIcon =
    safeStatus === 'verified'
      ? RiCheckLine
      : safeStatus === 'unverified'
        ? RiErrorWarningLine
        : RiQuestionLine

  return (
    <span
      className={`verification-badge verification-badge--${safeStatus}${className ? ` ${className}` : ''}`}
      role="img"
      tabIndex={tabIndex}
      aria-label={ariaLabel ?? STATUS_LABELS[safeStatus]}
    >
      <span className="verification-badge__seal-wrap" aria-hidden="true">
        <PiSealFill className="verification-badge__seal" />
        <MarkIcon className="verification-badge__mark" />
      </span>
    </span>
  )
}
