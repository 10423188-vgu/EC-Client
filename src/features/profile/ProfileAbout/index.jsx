import './ProfileAbout.css'
import { useMemo } from 'react'
import { useProfile } from '../hooks'
import { profileInfoSchema } from '../../../entities/user'
import { EditPanel } from './EditPanel.jsx'
import ProfileField from '../ProfileField'
import ProfileAddressList from '../ProfileAddressList'
import ReviewIdentity from './ReviewIdentity'
export default function ProfileAbout({ user }) {
  const { updateInfo, updateReviewProfile } = useProfile()
  const userInfo = useMemo(
    () => ({
      name: user?.name ?? '',
      phone: user?.phone ?? '',
    }),
    [user?.name, user?.phone],
  )
  return (
    <section className="profile-about">
      <EditPanel
        title="User information"
        data={userInfo}
        schema={profileInfoSchema}
        onSave={updateInfo.mutateAsync}
      >
        {({ isEditing, draft, handleChange, errors }) => (
          <div className="profile-about__grid profile-about__grid--two-column">
            <ProfileField
              label="Name"
              name="name"
              value={draft.name}
              error={errors.name}
              onChange={handleChange}
              isEditing={isEditing}
            />
            <ProfileField
              label="Phone"
              name="phone"
              value={draft.phone}
              error={errors.phone}
              onChange={handleChange}
              isEditing={isEditing}
            />
          </div>
        )}
      </EditPanel>

      <div className="profile-about__divider" />

      <ReviewIdentity
        user={user}
        onSave={updateReviewProfile.mutateAsync}
        saving={updateReviewProfile.isPending}
      />

      <div className="profile-about__divider" />

      <ProfileAddressList addresses={user?.addresses ?? []} />
    </section>
  )
}
