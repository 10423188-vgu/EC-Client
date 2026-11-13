import './UploadModal.css'
import { useState, useCallback, useRef } from 'react'
import { Modal, UploadDropzone, PanelButton } from '../../../shared/components'
import UploadCrop from './UploadCrop.jsx'
import { uploadLib } from './upload.js'
export default function UploadModal({
  title = 'Upload image',
  aspect = 1,
  cropShape = 'round',
  folder = 'avatars',
  onUpload,
  onClose,
}) {
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
  const handleSave = async () => {
    if (!croppedAreaPixels) return
    setLoading(true)
    try {
      const croppedBlob = await uploadLib.getCroppedImage(
        imageSrc,
        croppedAreaPixels,
      )
      const url = await uploadLib.uploadToCloudinary(croppedBlob, folder)
      await onUpload(url)
      handleClose()
    } catch {
      // why: onUpload's mutation already shows an error toast — nothing else to do here
    } finally {
      setLoading(false)
    }
  }
  return (
    <Modal title={title} maxWidth="500px" onClose={handleClose}>
      {!imageSrc ? (
        <UploadDropzone onFilesSelect={([file]) => handleFileSelect(file)} />
      ) : (
        <UploadCrop
          imageSrc={imageSrc}
          aspect={aspect}
          cropShape={cropShape}
          onCropComplete={setCroppedAreaPixels}
        />
      )}

      {imageSrc && (
        <div className="upload-modal__footer">
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
            onClick={handleSave}
            loading={loading}
            disabled={!croppedAreaPixels}
          />
        </div>
      )}
    </Modal>
  )
}
