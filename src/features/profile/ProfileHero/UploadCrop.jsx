import './UploadCrop.css'
import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
export default function UploadCrop({
  imageSrc,
  aspect,
  cropShape,
  onCropComplete,
}) {
  const [crop, setCrop] = useState({
    x: 0,
    y: 0,
  })
  const [zoom, setZoom] = useState(1)
  const handleCropComplete = useCallback(
    (_, croppedAreaPixels) => {
      onCropComplete(croppedAreaPixels)
    },
    [onCropComplete],
  )
  return (
    <div className="upload-crop">
      <div className="upload-crop__canvas">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          cropShape={cropShape}
          showGrid={false}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={handleCropComplete}
        />
      </div>

      <div className="upload-crop__controls">
        <div className="upload-crop__control">
          <span className="upload-crop__control-label">Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            className="upload-crop__slider"
            onChange={(e) => setZoom(Number(e.target.value))}
          />
        </div>
      </div>
    </div>
  )
}
