import './UploadDropzone.css'
import { useId, useState } from 'react'
import { MdCloudUpload } from 'react-icons/md'
import { useDropzone } from 'react-dropzone'

const IMAGE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
}

export function UploadDropzone({
  onFilesSelect,
  accept = IMAGE_TYPES,
  maxFiles = 1,
  maxSize = 5 * 1024 * 1024,
  multiple = false,
  disabled = false,
  compact = false,
  label = 'Image upload',
  hint = 'JPG, PNG, WEBP — max 5MB each',
  status,
}) {
  const [error, setError] = useState('')
  const descriptionId = useId()
  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      accept,
      maxSize,
      multiple,
      disabled,
      onDrop: (accepted, rejected) => {
        if (accepted.length + rejected.length > maxFiles) {
          setError(
            `You can select up to ${maxFiles} more image${maxFiles === 1 ? '' : 's'}`,
          )
          return
        }
        if (rejected.length) {
          const code = rejected[0].errors[0]?.code
          setError(
            code === 'file-too-large'
              ? `Each file must be no larger than ${maxSize / (1024 * 1024)}MB`
              : code === 'too-many-files'
                ? 'Select one image at a time'
                : 'Unsupported file type. Check the accepted formats below.',
          )
          return
        }
        setError('')
        if (accepted.length) onFilesSelect(accepted)
      },
    })

  return (
    <div
      {...getRootProps({
        role: 'button',
        'aria-label': label,
        'aria-disabled': disabled,
        'aria-describedby': descriptionId,
      })}
      className={`upload-dropzone${compact ? ' upload-dropzone--compact' : ''}${isDragActive ? ' upload-dropzone--active' : ''}${isDragReject || error ? ' upload-dropzone--rejected' : ''}${disabled ? ' upload-dropzone--disabled' : ''}`}
    >
      <input {...getInputProps({ 'aria-hidden': true })} />
      <MdCloudUpload className="upload-dropzone__icon" aria-hidden="true" />
      <p className="upload-dropzone__title">
        {isDragActive ? 'Drop images here' : 'Drag & drop or click to browse'}
      </p>
      <p id={descriptionId} className="upload-dropzone__hint">
        {hint}
      </p>
      {status && (
        <p className="upload-dropzone__status" aria-live="polite">
          {status}
        </p>
      )}
      {error && (
        <p className="upload-dropzone__error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
