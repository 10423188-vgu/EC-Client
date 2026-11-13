import './ReviewIdentity.css'
import { useMemo, useState } from 'react'
import { reviewProfileSchema } from '../../../entities/user'
import { EditPanel } from './EditPanel.jsx'
import ProfileField from '../ProfileField'
import UploadModal from '../ProfileHero/UploadModal.jsx'
import { PanelButton, UserAvatar } from '../../../shared/components'

export default function ReviewIdentity({ user, onSave, saving }) {
  const [isUploading, setIsUploading] = useState(false)
  const data = useMemo(
    () => ({ reviewDisplayName: user?.reviewDisplayName ?? '' }),
    [user?.reviewDisplayName],
  )
  const publicName = user?.reviewDisplayName?.trim() || user?.name
  const publicAvatar = user?.reviewAvatar ?? user?.avatar
  const useAccountPhoto = () => {
    onSave({ reviewAvatar: null }).catch(() => {})
  }

  return (
    <section className="review-identity" aria-busy={saving}>
      <EditPanel
        title="Public review identity"
        data={data}
        schema={reviewProfileSchema}
        onSave={onSave}
      >
        {({ isEditing, draft, handleChange, errors }) => (
          <div className="review-identity__content">
            <div className="review-identity__field">
              <ProfileField
                label="Display name on reviews"
                name="reviewDisplayName"
                value={isEditing ? draft.reviewDisplayName : publicName}
                error={errors.reviewDisplayName}
                onChange={handleChange}
                isEditing={isEditing}
                placeholder={user?.name ?? 'Your account name'}
              />
              <p className="review-identity__hint">
                Leave blank to use your account name. Changes update old and
                future reviews.
              </p>
            </div>

            <div className="review-identity__photo">
              <UserAvatar
                src={publicAvatar}
                name={publicName}
                className="review-identity__avatar"
                fallbackClassName="review-identity__avatar"
              />
              <div className="review-identity__photo-copy">
                <span className="review-identity__photo-label">
                  Public review photo
                </span>
                <span className="review-identity__hint">
                  {user?.reviewAvatar
                    ? 'Using your custom review photo.'
                    : 'Using your account photo.'}
                </span>
                <div className="review-identity__photo-actions">
                  <PanelButton
                    label={user?.reviewAvatar ? 'Change photo' : 'Add photo'}
                    variant="tertiary"
                    disabled={saving || isUploading}
                    onClick={() => setIsUploading(true)}
                  />
                  {user?.reviewAvatar && (
                    <PanelButton
                      label="Use account photo"
                      variant="tertiary"
                      disabled={saving || isUploading}
                      onClick={useAccountPhoto}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </EditPanel>

      {isUploading && (
        <UploadModal
          title="Public review photo"
          folder="avatars"
          onUpload={(url) => onSave({ reviewAvatar: url })}
          onClose={() => setIsUploading(false)}
        />
      )}
    </section>
  )
}
