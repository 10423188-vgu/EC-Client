import './AvatarModal.css'
import { useState, useCallback, useRef } from 'react'
import {
  Modal,
  UploadDropzone,
  PanelButton,
  SlidingTabs,
} from '../../../shared/components'
import UploadCrop from './UploadCrop.jsx'
import { uploadLib } from './upload.js'
const TABS = [
  {
    value: 'upload',
    label: 'Upload',
  },
  {
    value: 'frame',
    label: 'Border',
  },
]

// why: Master keeps the site's default purple/magenta gradient — every other
// tier gets its own border/glow color to match its frame artwork
const TIER_ACCENT = {
  Challenger: 'challenger',
  Grandmaster: 'grandmaster',
  Diamond: 'diamond',
  Emerald: 'emerald',
  Platinum: 'platinum',
  Gold: 'gold',
  Silver: 'silver',
  Bronze: 'bronze',
}
export default function AvatarModal({
  user,
  onUploadAvatar,
  onSetFrame,
  onClose,
}) {
  const [tab, setTab] = useState('upload')
  const [imageSrc, setImageSrc] = useState(null)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [loading, setLoading] = useState(false)
  const objectUrlRef = useRef(null)
  const handleFileSelect = useCallback((file) => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    const url = URL.createObjectURL(file)
    objectUrlRef.current = url
    setImageSrc(url)
  }, [])
  const handleClose = useCallback(() => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    onClose()
  }, [onClose])
  const handleSelectFrame = async (name) => {
    try {
      await onSetFrame(name)
    } catch {
      // why: onSetFrame's mutation already shows an error toast — nothing else to do here
    }
  }
  const handleSaveAvatar = async () => {
    if (!croppedAreaPixels) return
    setLoading(true)
    try {
      const croppedBlob = await uploadLib.getCroppedImage(
        imageSrc,
        croppedAreaPixels,
      )
      const url = await uploadLib.uploadToCloudinary(croppedBlob, 'avatars')
      await onUploadAvatar(url)
      handleClose()
    } catch {
      // why: onUploadAvatar's mutation already shows an error toast — nothing else to do here
    } finally {
      setLoading(false)
    }
  }
  return (
    <Modal title="Avatar" maxWidth="500px" onClose={handleClose}>
      <SlidingTabs
        tabs={TABS}
        value={tab}
        className="avatar-modal__tabs"
        onChange={setTab}
        ariaLabel="Avatar options"
      />

      {tab === 'upload' ? (
        <>
          {!imageSrc ? (
            <UploadDropzone
              onFilesSelect={([file]) => handleFileSelect(file)}
            />
          ) : (
            <UploadCrop
              imageSrc={imageSrc}
              aspect={1}
              cropShape="round"
              onCropComplete={setCroppedAreaPixels}
            />
          )}

          {imageSrc && (
            <div className="avatar-modal__footer">
              <PanelButton
                variant="cancel"
                label="Change photo"
                onClick={() => setImageSrc(null)}
                disabled={loading}
              />
              <PanelButton
                variant="save"
                label="Save"
                loadingLabel="Uploading…"
                onClick={handleSaveAvatar}
                loading={loading}
                disabled={!croppedAreaPixels}
              />
            </div>
          )}
        </>
      ) : (
        <div className="avatar-modal__frame-grid">
          {(user.unlockedFrames ?? []).map((name) => (
            <button
              key={name}
              type="button"
              className={`avatar-modal__frame-option${name === user.frame ? ' avatar-modal__frame-option--selected' : ''}${TIER_ACCENT[name] ? ` avatar-modal__frame-option--${TIER_ACCENT[name]}` : ''}`}
              onClick={() => handleSelectFrame(name)}
            >
              <img
                src={`/images/profile-frame/${name.toLowerCase()}.webp`}
                alt=""
                className="avatar-modal__frame-image"
              />
              <span className="avatar-modal__frame-label">{name}</span>
            </button>
          ))}
        </div>
      )}
    </Modal>
  )
}
