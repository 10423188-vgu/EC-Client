import { useId, useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  Modal,
  PanelButton,
  RetryButton,
  SlidingTabs,
} from '../../../shared/components'
import {
  getAdminProduct,
  useAdminBrands,
  useSaveAdminProduct,
} from '../../../entities/product'
import { useCategories } from '../../../entities/category'
import { flattenCategories } from './productCategories'
import ProductInformation from './ProductInformation'
import ProductGallery from './ProductGallery'
import ProductVariants from './ProductVariants'
import VariantFields from './VariantFields'
import {
  makeSlug,
  changedProductFields,
  newVariant,
  saveGallery,
  validateVariant,
  variantPayload,
} from './editorHelpers'
import './ProductEditor.css'

const EDITOR_TABS = [
  { value: 'information', label: 'Information' },
  { value: 'images', label: 'Images' },
  { value: 'variants', label: 'Variants' },
]
const initialForm = (product) => ({
  name: product?.name ?? '',
  slug: product?.slug ?? '',
  categoryId: product?.categoryId ?? '',
  brandId: product?.brandId ?? '',
  description: product?.description ?? '',
  isActive: product?.isActive ?? true,
  isFeatured: product?.isFeatured ?? false,
  attributesText: (product?.attributes ?? [])
    .map(({ key, value }) => `${key}: ${value}`)
    .join('\n'),
  tagsText: (product?.tags ?? []).join(', '),
  images: product?.images ?? [],
})
export default function ProductEditor({ product, onClose }) {
  const isNew = !product?.id
  const formId = useId()
  const [tab, setTab] = useState('information')
  const [form, setForm] = useState(() => initialForm(product))
  const [baseline] = useState(() => JSON.stringify(initialForm(product)))
  const [slugEdited, setSlugEdited] = useState(!isNew)
  const [newVariants, setNewVariants] = useState(() => [newVariant()])
  const [variants, setVariants] = useState(product?.variants ?? [])
  const [variantDirty, setVariantDirty] = useState(false)
  const [variantBusy, setVariantBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [errors, setErrors] = useState({})
  const [variantErrors, setVariantErrors] = useState([])
  const [saveError, setSaveError] = useState('')
  const categoryQuery = useCategories({ includeChildren: true })
  const brandsQuery = useAdminBrands()
  // why: form edits should not re-traverse an unchanged category tree.
  const categories = useMemo(
    () => flattenCategories(categoryQuery.data ?? []),
    [categoryQuery.data],
  )
  const save = useSaveAdminProduct()
  const busy = uploading || save.isPending || variantBusy
  const dirty =
    JSON.stringify(form) !== baseline ||
    variantDirty ||
    (isNew &&
      newVariants.some(
        (variant) => variant.sku || variant.price || variant.images.length,
      ))
  const close = () => {
    if (busy) return
    if (dirty && !window.confirm('Discard unsaved product changes?')) return
    onClose()
  }
  const change = (key, value) => {
    setSaveError('')
    setErrors((current) => ({ ...current, [key]: undefined }))
    if (key === 'slug') setSlugEdited(true)
    setForm((current) => ({
      ...current,
      [key]: value,
      ...(key === 'name' && !slugEdited ? { slug: makeSlug(value) } : {}),
    }))
  }
  const reloadVariants = async () =>
    setVariants((await getAdminProduct(product.id)).variants)
  const submit = async (event) => {
    event.preventDefault()
    if (busy) return
    if (variantDirty)
      return toast.warning('Save or cancel variant changes first')
    const validation = {}
    if (form.name.trim().length < 2)
      validation.name = 'Name must have at least 2 characters'
    if (!/^[a-z0-9-]{2,}$/.test(form.slug))
      validation.slug = 'Use lowercase letters, numbers and hyphens'
    if (!form.categoryId) validation.categoryId = 'Select a category'
    const attributes = form.attributesText
      .split('\n')
      .filter((line) => line.trim())
    if (
      attributes.some(
        (line) =>
          line.indexOf(':') < 1 || !line.slice(line.indexOf(':') + 1).trim(),
      )
    )
      validation.attributesText = 'Use one Key: Value per line'
    setErrors(validation)
    if (Object.keys(validation).length) {
      setTab('information')
      return
    }
    const checks = isNew
      ? newVariants.map((variant) => validateVariant(variant, true))
      : []
    setVariantErrors(checks)
    if (
      checks.some((check) => Object.keys(check).length) ||
      (isNew &&
        new Set(newVariants.map((variant) => variant.sku.trim())).size !==
          newVariants.length)
    ) {
      setTab('variants')
      setSaveError('Check variant fields; SKU must be unique')
      return
    }
    setSaveError('')
    setUploading(true)
    try {
      const uploaded = await saveGallery(
        [
          form.images,
          ...(isNew ? newVariants.map((variant) => variant.images) : []),
        ].flat(),
        (preview, url) => {
          setForm((current) => ({
            ...current,
            images: current.images.map((image) =>
              image.preview === preview
                ? { ...image, file: undefined, url }
                : image,
            ),
          }))
          if (isNew)
            setNewVariants((current) =>
              current.map((variant) => ({
                ...variant,
                images: variant.images.map((image) =>
                  image.preview === preview
                    ? { ...image, file: undefined, url }
                    : image,
                ),
              })),
            )
        },
      )
      let offset = 0
      const takeImages = (count) => {
        const images = uploaded
          .slice(offset, offset + count)
          .map((image, position) => ({ ...image, position }))
        offset += count
        return images
      }
      const images = takeImages(form.images.length)
      const data = {
        ...(!isNew && { expectedRevision: product.revision }),
        name: form.name.trim(),
        slug: form.slug,
        description: form.description,
        categoryId: form.categoryId,
        brandId: form.brandId || null,
        isActive: form.isActive,
        isFeatured: form.isFeatured,
        images,
        tags: [
          ...new Set(
            form.tagsText
              .split(',')
              .map((tag) => tag.trim())
              .filter(Boolean),
          ),
        ],
        attributes: attributes.map((line) => {
          const colon = line.indexOf(':')
          return {
            key: line.slice(0, colon).trim(),
            value: line.slice(colon + 1).trim(),
          }
        }),
      }
      if (isNew) {
        data.variants = newVariants.map((variant) =>
          variantPayload(variant, takeImages(variant.images.length), true),
        )
      }
      const payload = isNew ? data : changedProductFields(data, product)
      await save.mutateAsync({ id: product?.id, data: payload })
      toast.success(isNew ? 'Product created' : 'Product saved')
      onClose()
    } catch (error) {
      const message =
        error.response?.data?.message ??
        error.response?.data?.errors?.body?.join(', ') ??
        'Could not save product. Check connection and retry.'
      setSaveError(message)
      toast.error(message)
    } finally {
      setUploading(false)
    }
  }
  return (
    <Modal
      title={isNew ? 'Add product' : 'Edit product'}
      bodyClassName="product-editor__body"
      panelClassName="product-editor"
      onClose={close}
      maxWidth="920px"
      footer={
        <div className="product-editor__footer">
          <span>
            {busy
              ? 'Saving changes…'
              : variantDirty
                ? 'Save or cancel variant changes first'
                : dirty
                  ? 'Unsaved changes'
                  : 'Changes to variants are saved separately'}
          </span>
          <PanelButton
            variant="cancel"
            label="Cancel"
            onClick={close}
            disabled={busy}
          />
          <PanelButton
            type="submit"
            form={formId}
            label="Save product"
            loadingLabel="Saving…"
            loading={uploading || save.isPending}
            disabled={
              variantBusy ||
              variantDirty ||
              categoryQuery.isLoading ||
              brandsQuery.isLoading ||
              categoryQuery.isError ||
              brandsQuery.isError
            }
          />
        </div>
      }
    >
      <SlidingTabs
        tabs={EDITOR_TABS}
        value={tab}
        onChange={setTab}
        stretch
        ariaLabel="Product editor sections"
      />
      {(categoryQuery.isError || brandsQuery.isError) && (
        <div className="product-editor__error" role="alert">
          <p>Could not load categories or brands.</p>
          <RetryButton
            label="Retry options"
            onClick={() => {
              categoryQuery.refetch()
              brandsQuery.refetch()
            }}
            loading={categoryQuery.isFetching || brandsQuery.isFetching}
          />
        </div>
      )}
      {saveError && (
        <p className="product-editor__error" role="alert">
          {saveError}
        </p>
      )}
      <form
        id={formId}
        className="product-editor__form"
        onSubmit={submit}
        noValidate
      >
        <section hidden={tab !== 'information'}>
          <ProductInformation
            form={form}
            onChange={change}
            errors={errors}
            categories={categories}
            brands={brandsQuery.data ?? []}
            disabled={busy}
          />
        </section>
        <section hidden={tab !== 'images'}>
          <ProductGallery
            images={form.images}
            onChange={(images) => change('images', images)}
            disabled={busy}
          />
        </section>
        {isNew && (
          <section
            className="product-editor__fields"
            hidden={tab !== 'variants'}
          >
            {newVariants.map((variant, index) => (
              <article
                key={variant.clientId}
                className="product-editor__variant-form"
              >
                <h3>Variant {index + 1}</h3>
                <VariantFields
                  draft={variant}
                  onChange={(next) => {
                    setSaveError('')
                    setNewVariants((current) =>
                      current.map((item) =>
                        item.clientId === next.clientId ? next : item,
                      ),
                    )
                  }}
                  errors={variantErrors[index]}
                  isNew
                  disabled={busy}
                />
                <PanelButton
                  variant="cancel"
                  label="Remove draft variant"
                  onClick={() =>
                    setNewVariants((current) =>
                      current.filter(
                        (item) => item.clientId !== variant.clientId,
                      ),
                    )
                  }
                  disabled={busy || newVariants.length === 1}
                />
              </article>
            ))}
            <PanelButton
              variant="tertiary"
              label="Add draft variant"
              onClick={() =>
                setNewVariants((current) => [...current, newVariant()])
              }
              disabled={busy || newVariants.length >= 20}
            />
          </section>
        )}
      </form>
      {!isNew && (
        <section hidden={tab !== 'variants'}>
          <ProductVariants
            productId={product.id}
            variants={variants}
            onUpdated={reloadVariants}
            onDirtyChange={setVariantDirty}
            onBusyChange={setVariantBusy}
          />
        </section>
      )}
    </Modal>
  )
}
