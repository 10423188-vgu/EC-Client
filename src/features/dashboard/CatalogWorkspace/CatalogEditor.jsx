import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  Checkbox,
  Modal,
  PanelButton,
  RetryButton,
  SelectField,
  UploadDropzone,
} from '../../../shared/components'
import { uploadService } from '../../../shared/api/upload.service'
import './CatalogEditor.css'

const slugify = (value) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const initialForm = (record, isCategory) => ({
  name: record?.name ?? '',
  slug: record?.slug ?? '',
  isActive: record?.isActive ?? true,
  ...(isCategory
    ? {
        description: record?.description ?? '',
        parentId: record?.parentId ?? '',
        imageUrl: record?.imageUrl ?? '',
        videoUrl: record?.videoUrl ?? '',
      }
    : { logoUrl: record?.logoUrl ?? '' }),
})

export default function CatalogEditor({
  kind,
  record,
  parents,
  mutation,
  onClose,
}) {
  const isCategory = kind === 'categories'
  const singular = isCategory ? 'category' : 'brand'
  const mediaKey = isCategory ? 'imageUrl' : 'logoUrl'
  const [form, setForm] = useState(() => initialForm(record, isCategory))
  const [image, setImage] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const preview = useRef(null)
  const busy = uploading || mutation.isPending
  const baseline = initialForm(record, isCategory)
  const dirty =
    Boolean(image) || JSON.stringify(form) !== JSON.stringify(baseline)
  useEffect(
    () => () => {
      if (preview.current) URL.revokeObjectURL(preview.current)
    },
    [],
  )
  const close = () => {
    if (busy) return
    if (dirty && !window.confirm('Discard unsaved changes?')) return
    onClose()
  }
  const change = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }))
  // why: category options can be large; form keystrokes should not rebuild
  // the hierarchy used to exclude descendant parents.
  const blockedParents = useMemo(() => {
    const blocked = new Set(record ? [record.id] : [])
    const children = new Map()
    for (const parent of parents.data ?? []) {
      if (!children.has(parent.parentId)) children.set(parent.parentId, [])
      children.get(parent.parentId).push(parent.id)
    }
    const pending = [...blocked]
    while (pending.length) {
      for (const child of children.get(pending.pop()) ?? []) {
        if (!blocked.has(child)) {
          blocked.add(child)
          pending.push(child)
        }
      }
    }
    return blocked
  }, [parents.data, record])
  const submit = async (event) => {
    event.preventDefault()
    if (busy) return
    if (isCategory && !parents.isSuccess)
      return setError('Load parent categories before saving')
    if (form.name.trim().length < 2 || !/^[a-z0-9-]{2,}$/.test(form.slug)) {
      return setError(
        'Enter a name of at least 2 characters and a valid lowercase slug',
      )
    }
    setError('')
    setUploading(true)
    try {
      const data = { ...form, name: form.name.trim() }
      if (image) {
        const url = await uploadService.uploadImage(image.file, kind)
        data[mediaKey] = url
        change(mediaKey, url)
        setImage(null)
        URL.revokeObjectURL(preview.current)
        preview.current = null
      }
      for (const key of [
        'parentId',
        'description',
        'imageUrl',
        'videoUrl',
        'logoUrl',
      ]) {
        if (key in data && !data[key]) data[key] = null
      }
      const original = initialForm(record, isCategory)
      const payload = record
        ? Object.fromEntries(
            Object.entries(data).filter(
              ([key, value]) =>
                value !== (original[key] === '' ? null : original[key]),
            ),
          )
        : data
      await mutation.mutateAsync({
        kind,
        action: record ? 'update' : 'create',
        id: record?.id,
        data: payload,
      })
      toast.success(`${isCategory ? 'Category' : 'Brand'} saved`)
      onClose()
    } catch (failure) {
      setError(
        failure.response?.status === 409
          ? 'This slug is already used. Choose another slug.'
          : (failure.response?.data?.message ??
              'Could not save. Check the fields and try again.'),
      )
    } finally {
      setUploading(false)
    }
  }
  return (
    <Modal
      title={`${record ? 'Edit' : 'Add'} ${singular}`}
      bodyClassName="catalog-editor__body"
      panelClassName="catalog-editor__panel"
      maxWidth="680px"
      onClose={close}
      footer={
        <div className="catalog-editor__actions">
          <PanelButton
            variant="cancel"
            label="Cancel"
            onClick={close}
            disabled={busy}
          />
          <PanelButton
            type="submit"
            form="catalog-editor-form"
            label={`Save ${singular}`}
            loading={busy}
            disabled={!dirty || (isCategory && !parents.isSuccess)}
          />
        </div>
      }
    >
      <form
        id="catalog-editor-form"
        className="catalog-editor"
        onSubmit={submit}
      >
        <div className="catalog-editor__columns">
          <label className="catalog-editor__field">
            Name
            <input
              value={form.name}
              onChange={(event) => {
                const name = event.target.value
                setForm((current) => ({
                  ...current,
                  name,
                  slug:
                    !record && current.slug === slugify(current.name)
                      ? slugify(name)
                      : current.slug,
                }))
              }}
              disabled={busy}
              required
            />
          </label>
          <label className="catalog-editor__field">
            Slug
            <input
              value={form.slug}
              onChange={(event) => change('slug', event.target.value)}
              disabled={busy}
              required
              pattern="[a-z0-9-]{2,}"
            />
          </label>
        </div>
        {isCategory && (
          <>
            <label className="catalog-editor__field">
              Parent category
              <SelectField
                value={form.parentId}
                onChange={(event) => change('parentId', event.target.value)}
                disabled={busy || !parents.isSuccess}
                aria-label="Parent category"
              >
                <option value="">None (root category)</option>
                {(parents.data ?? [])
                  .filter((parent) => !blockedParents.has(parent.id))
                  .map((parent) => (
                    <option key={parent.id} value={parent.id}>
                      {parent.name}
                      {parent.isActive ? '' : ' (Inactive)'}
                    </option>
                  ))}
              </SelectField>
            </label>
            {parents.isPending && (
              <p role="status">Loading parent categories…</p>
            )}
            {parents.isError && (
              <RetryButton
                label="Retry parent categories"
                onClick={() => parents.refetch()}
                loading={parents.isFetching}
              />
            )}
            <label className="catalog-editor__field">
              Description
              <textarea
                value={form.description}
                onChange={(event) => change('description', event.target.value)}
                disabled={busy}
                rows={3}
              />
            </label>
          </>
        )}
        <section
          className="catalog-editor__media"
          aria-label={isCategory ? 'Category image' : 'Brand logo'}
        >
          <UploadDropzone
            label={isCategory ? 'Category image upload' : 'Brand logo upload'}
            onFilesSelect={([file]) => {
              if (preview.current) URL.revokeObjectURL(preview.current)
              preview.current = URL.createObjectURL(file)
              setImage({ file, preview: preview.current })
            }}
            disabled={busy}
            compact
          />
          {(image?.preview || form[mediaKey]) && (
            <div className="catalog-editor__preview">
              <img
                src={image?.preview ?? form[mediaKey]}
                alt={form.name || 'Selected image'}
              />
              <PanelButton
                variant="tertiary"
                label="Remove image"
                disabled={busy}
                onClick={() => {
                  if (preview.current) URL.revokeObjectURL(preview.current)
                  preview.current = null
                  setImage(null)
                  change(mediaKey, '')
                }}
              />
            </div>
          )}
          <label className="catalog-editor__field">
            {isCategory ? 'Image URL' : 'Logo URL'}
            <input
              type="url"
              value={form[mediaKey]}
              onChange={(event) => change(mediaKey, event.target.value)}
              disabled={busy || Boolean(image)}
            />
          </label>
          {isCategory && (
            <label className="catalog-editor__field">
              Video URL (optional)
              <input
                type="url"
                value={form.videoUrl}
                onChange={(event) => change('videoUrl', event.target.value)}
                disabled={busy}
              />
            </label>
          )}
        </section>
        <label className="catalog-editor__check">
          <Checkbox
            checked={form.isActive}
            onChange={(event) => change('isActive', event.target.checked)}
            disabled={busy}
          />
          Active {singular}
        </label>
        {record && (
          <p className="catalog-editor__notice">
            Name and slug changes sync to products in the background. Inactive
            hides this item from public category/brand lists.
          </p>
        )}
        {error && (
          <p className="catalog-editor__error" role="alert">
            {error}
          </p>
        )}
      </form>
    </Modal>
  )
}
