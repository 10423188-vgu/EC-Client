import './ProfileHero.css'
import { useState } from 'react'
import { RiCameraLine } from 'react-icons/ri'
import { useTwoFactorStatus } from '../hooks'
import { userLib } from '../../../shared/utils'
import {
  Tooltip,
  UserAvatar,
  VerificationBadge,
} from '../../../shared/components'
import UploadModal from './UploadModal.jsx'
import AvatarModal from './AvatarModal'
import { useProfile } from '../hooks'
export default function ProfileHero({ user }) {
  const { uploadAvatar, uploadBanner, setFrame } = useProfile()
  const [modal, setModal] = useState(null)
  const twoFactorQuery = useTwoFactorStatus()
  const emailVerified = Boolean(user?.emailVerifiedAt)
  const securityComplete = emailVerified && twoFactorQuery.data?.enabled
  const verificationState = twoFactorQuery.isPending
    ? 'pending'
    : securityComplete
      ? 'verified'
      : 'unverified'
  const verificationLabel = twoFactorQuery.isError
    ? 'Unable to confirm all security settings'
    : twoFactorQuery.isPending
      ? 'Checking security settings'
      : securityComplete
        ? 'Email verified and two-factor authentication enabled'
        : !emailVerified
          ? 'Verify your email to complete security setup'
          : 'Enable two-factor authentication to complete security setup'
  const memberSince = userLib.getMemberSince(user?.createdAt)
  const defaultAddress = userLib.getDefaultAddress(user?.addresses)
  const location = userLib.formatLocation(defaultAddress)
  return (
    <section className="profile-hero">
      <div
        className="profile-hero__banner profile-hero__banner--editable"
        onClick={() => setModal('banner')}
        onKeyDown={(e) =>
          (e.key === 'Enter' || e.key === ' ') && setModal('banner')
        }
        role="button"
        tabIndex={0}
        aria-label="Edit banner"
      >
        <div className="profile-hero__banner-inner">
          {user?.banner && (
            <img
              src={user.banner}
              alt=""
              className="profile-hero__banner-image"
              aria-hidden="true"
            />
          )}
        </div>
        <div className="profile-hero__overlay">
          <RiCameraLine className="profile-hero__overlay-icon" />
          <span className="profile-hero__overlay-text">Edit banner</span>
        </div>
      </div>

      <div className="profile-hero__header">
        <div className="profile-hero__avatar">
          <div
            className="profile-hero__avatar-inner profile-hero__avatar-inner--editable"
            onClick={() => setModal('avatar')}
            onKeyDown={(e) =>
              (e.key === 'Enter' || e.key === ' ') && setModal('avatar')
            }
            role="button"
            tabIndex={0}
            aria-label="Edit avatar"
          >
            <img
              src={user?.avatar}
              alt=""
              className="profile-hero__avatar-glow"
              aria-hidden="true"
            />
            <UserAvatar
              src={user?.avatar}
              name={user?.name}
              className="profile-hero__avatar-image"
              fallbackClassName="profile-hero__avatar-fallback"
            />
            <div className="profile-hero__avatar-overlay">
              <RiCameraLine className="profile-hero__overlay-icon" />
            </div>
          </div>

          {user?.frame && (
            <div
              title={`${user.frame} tier frame`}
              className={`profile-hero__tier-frame-wrapper${user.isEliteTier ? ' profile-hero__tier-frame-wrapper--elite' : ''}`}
              role="img"
              aria-label={`${user.frame} tier frame`}
            >
              <img
                src={`/images/profile-frame/${user.frame.toLowerCase()}.webp`}
                alt=""
                className="profile-hero__tier-frame"
              />
            </div>
          )}
        </div>

        <div className="profile-hero__info">
          <div className="profile-hero__identity">
            <div className="profile-hero__identity-body">
              <div className="profile-hero__name-row">
                <h1 className="profile-hero__name">{user?.name}</h1>
                <Tooltip content={verificationLabel} placement="top">
                  <VerificationBadge
                    status={verificationState}
                    tabIndex={0}
                    ariaLabel={verificationLabel}
                  />
                </Tooltip>
              </div>
              <p className="profile-hero__meta">
                Member since {memberSince}
                {location ? ` · ${location}` : ''}
              </p>
            </div>
          </div>

          <div className="profile-hero__stats">
            <div className="profile-hero__stat">
              <span className="profile-hero__stat-label">Orders</span>
              <span className="profile-hero__stat-value">
                {user?.ordersCount ?? '—'}
              </span>
            </div>
            <div className="profile-hero__stat">
              <span className="profile-hero__stat-label">Wishlist</span>
              <span className="profile-hero__stat-value">
                {user?.wishlistCount ?? '—'}
              </span>
            </div>
            <div className="profile-hero__stat">
              <span className="profile-hero__stat-label">Reviews</span>
              <span className="profile-hero__stat-value">
                {user?.reviewsCount ?? '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {modal === 'avatar' && (
        <AvatarModal
          user={user}
          onUploadAvatar={uploadAvatar.mutateAsync}
          onSetFrame={setFrame.mutateAsync}
          onClose={() => setModal(null)}
        />
      )}

      {modal === 'banner' && (
        <UploadModal
          title="Update banner"
          aspect={16 / 5}
          cropShape="rect"
          folder="banners"
          onUpload={uploadBanner.mutateAsync}
          onClose={() => setModal(null)}
        />
      )}
    </section>
  )
}
