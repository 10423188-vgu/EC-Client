import { useEffect, useRef, useState } from 'react'
import { PanelButton, UploadDropzone } from '../../../shared/components'

export default function ProductGallery({
  images,
  onChange,
  disabled,
  name = 'Product',
}) {
  const previews = useRef(new Set())
  const [draggingIndex, setDraggingIndex] = useState(null)
  const [dropTargetIndex, setDropTargetIndex] = useState(null)
  const [error, setError] = useState('')
  const [url, setUrl] = useState('')
  useEffect(() => {
    const retained = new Set(images.map((image) => image.preview))
    for (const preview of previews.current) {
      if (!retained.has(preview)) {
        URL.revokeObjectURL(preview)
        previews.current.delete(preview)
      }
    }
  }, [images])
  useEffect(
    () => () => {
      for (const preview of previews.current) URL.revokeObjectURL(preview)
    },
    [],
  )
  const addFiles = (files) => {
    if (disabled) return
    const selected = [...files]
    setError('')
    onChange([
      ...images,
      ...selected.map((file) => {
        const preview = URL.createObjectURL(file)
        previews.current.add(preview)
        return { file, preview, altText: '' }
      }),
    ])
  }
  const move = (index, target) => {
    if (index === target || index < 0 || target < 0) return
    const next = [...images]
    const [image] = next.splice(index, 1)
    next.splice(target, 0, image)
    onChange(next)
  }
  const handleImageDrop = (event, targetIndex) => {
    event.preventDefault()
    const sourceIndex = Number(event.dataTransfer.getData('text/plain'))
    if (Number.isInteger(sourceIndex)) move(sourceIndex, targetIndex)
    setDraggingIndex(null)
    setDropTargetIndex(null)
  }
  return (
    <section className="product-editor__gallery">
      <UploadDropzone
        label={`${name} image upload`}
        maxFiles={Math.max(0, 12 - images.length)}
        onFilesSelect={addFiles}
        disabled={disabled || images.length >= 12}
        status={`${images.length}/12 images`}
        multiple
        compact
      />
      <div className="product-editor__inline">
        <input
          type="url"
          value={url}
          placeholder="Or paste an image URL"
          onChange={(event) => setUrl(event.target.value)}
          disabled={disabled}
          aria-label={`${name} image URL`}
        />
        <PanelButton
          variant="tertiary"
          label="Add URL"
          onClick={() => {
            try {
              const parsed = new URL(url)
              if (
                !['https:', 'http:'].includes(parsed.protocol) ||
                images.length >= 12
              )
                throw new Error()
              onChange([...images, { url, altText: '' }])
              setUrl('')
              setError('')
            } catch {
              setError('Enter a valid image URL; maximum 12 images')
            }
          }}
          disabled={disabled || !url}
        />
      </div>
      {error && (
        <p className="product-editor__error" role="alert">
          {error}
        </p>
      )}
      <div className="product-editor__image-grid">
        {images.length > 1 && (
          <p className="product-editor__image-reorder-hint">
            Drag images to reorder · The first image is the cover.
          </p>
        )}
        {images.map((image, index) => (
          <article
            key={image.preview ?? `${image.url}-${index}`}
            className={`product-editor__image-card${draggingIndex === index ? ' product-editor__image-card--dragging' : ''}${dropTargetIndex === index ? ' product-editor__image-card--drop-target' : ''}`}
            draggable={!disabled}
            onDragStart={(event) => {
              event.dataTransfer.effectAllowed = 'move'
              event.dataTransfer.setData('text/plain', String(index))
              setDraggingIndex(index)
            }}
            onDragOver={(event) => {
              event.preventDefault()
              event.dataTransfer.dropEffect = 'move'
              setDropTargetIndex(index)
            }}
            onDrop={(event) => handleImageDrop(event, index)}
            onDragEnd={() => {
              setDraggingIndex(null)
              setDropTargetIndex(null)
            }}
          >
            <img
              src={image.preview ?? image.url}
              alt={image.altText || `${name} image ${index + 1}`}
              loading="lazy"
              decoding="async"
            />
            <span>{index === 0 ? 'Cover image' : `Image ${index + 1}`}</span>
            <input
              value={image.altText ?? ''}
              placeholder="Image description"
              onChange={(event) =>
                onChange(
                  images.map((item, i) =>
                    i === index
                      ? { ...item, altText: event.target.value }
                      : item,
                  ),
                )
              }
              disabled={disabled}
              aria-label={`${name} image ${index + 1} description`}
            />
            <div className="product-editor__image-actions">
              <PanelButton
                variant="tertiary"
                label="Cover"
                onClick={() => move(index, 0)}
                disabled={disabled || index === 0}
              />
              <PanelButton
                variant="tertiary"
                label="←"
                title="Move image earlier"
                onClick={() => move(index, index - 1)}
                disabled={disabled || index === 0}
              />
              <PanelButton
                variant="tertiary"
                label="→"
                title="Move image later"
                onClick={() => move(index, index + 1)}
                disabled={disabled || index === images.length - 1}
              />
              <PanelButton
                variant="cancel"
                label="Remove"
                onClick={() => onChange(images.filter((_, i) => i !== index))}
                disabled={disabled}
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
