import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { PanelButton } from '../../../shared/components'
import { useAdminVariantMutation } from '../../../entities/product'
import VariantFields from './VariantFields'
import ProductInventory from './ProductInventory'
import {
  newVariant,
  changedProductFields,
  saveGallery,
  validateVariant,
  variantDraft,
  variantPayload,
} from './editorHelpers'

export default function ProductVariants({
  productId,
  variants,
  onUpdated,
  onDirtyChange,
  onBusyChange,
}) {
  const [draft, setDraft] = useState(null)
  const [baseline, setBaseline] = useState('')
  const [errors, setErrors] = useState({})
  const [uploading, setUploading] = useState(false)
  const [inventoryId, setInventoryId] = useState(null)
  const mutation = useAdminVariantMutation()
  const busy = uploading || mutation.isPending
  useEffect(() => {
    onBusyChange(busy)
  }, [busy, onBusyChange])
  const dirty = Boolean(draft && JSON.stringify(draft) !== baseline)
  useEffect(() => {
    onDirtyChange(dirty)
  }, [dirty, onDirtyChange])
  const open = (variant) => {
    if (dirty && !window.confirm('Discard unsaved variant changes?')) return
    const next = variant ? variantDraft(variant) : newVariant()
    setDraft(next)
    setBaseline(JSON.stringify(next))
    setErrors({})
  }
  const inventoryVariant = variants.find(
    (variant) => variant.id === inventoryId,
  )
  if (inventoryVariant)
    return (
      <ProductInventory
        productId={productId}
        variant={inventoryVariant}
        onUpdated={onUpdated}
        onBusyChange={onBusyChange}
        onDirtyChange={onDirtyChange}
        onClose={() => setInventoryId(null)}
      />
    )
  return (
    <section className="product-editor__fields">
      <div className="product-editor__variant-list">
        {variants.map((variant) => (
          <article key={variant.id} className="product-editor__variant-row">
            <div>
              <strong>{variant.name}</strong>
              <small>
                {variant.sku} · Stock {variant.stock} ·{' '}
                {variant.deletedAt
                  ? 'Deleted'
                  : variant.isActive
                    ? 'Active'
                    : 'Inactive'}
              </small>
            </div>
            <div className="product-editor__actions">
              {variant.deletedAt ? (
                <PanelButton
                  variant="tertiary"
                  label="Restore variant"
                  onClick={async () => {
                    try {
                      await mutation.mutateAsync({
                        action: 'restoreVariant',
                        id: productId,
                        variantId: variant.id,
                      })
                      await onUpdated()
                      toast.success('Variant restored as inactive')
                    } catch (error) {
                      toast.error(
                        error.response?.data?.message ??
                          'Could not restore variant',
                      )
                    }
                  }}
                  disabled={busy}
                />
              ) : (
                <>
                  <PanelButton
                    variant="tertiary"
                    label="Edit variant"
                    onClick={() => open(variant)}
                    disabled={busy}
                  />
                  <PanelButton
                    variant="tertiary"
                    label="Adjust stock"
                    onClick={() => {
                      if (
                        dirty &&
                        !window.confirm('Discard unsaved variant changes?')
                      )
                        return
                      setDraft(null)
                      setInventoryId(variant.id)
                    }}
                    disabled={busy}
                  />
                  <PanelButton
                    variant="cancel"
                    label="Delete variant"
                    onClick={async () => {
                      if (
                        !window.confirm(
                          `Move variant “${variant.name}” to trash? Its stock and order history will be kept.`,
                        )
                      )
                        return
                      try {
                        await mutation.mutateAsync({
                          action: 'deleteVariant',
                          id: productId,
                          variantId: variant.id,
                        })
                        if (draft?.id === variant.id) setDraft(null)
                        await onUpdated()
                        toast.success('Variant moved to trash')
                      } catch (error) {
                        toast.error(
                          error.response?.data?.message ??
                            'Could not delete variant',
                        )
                      }
                    }}
                    disabled={busy}
                  />
                </>
              )}
            </div>
          </article>
        ))}
      </div>
      <PanelButton
        variant="tertiary"
        label="Add variant"
        onClick={() => open(null)}
        disabled={busy}
      />
      {draft && (
        <form
          className="product-editor__variant-form"
          noValidate
          onSubmit={async (event) => {
            event.preventDefault()
            if (busy) return
            const validation = validateVariant(draft, !draft.id)
            setErrors(validation)
            if (Object.keys(validation).length) return
            setUploading(true)
            try {
              const images = await saveGallery(draft.images, (preview, url) =>
                setDraft((current) => ({
                  ...current,
                  images: current.images.map((image) =>
                    image.preview === preview
                      ? { ...image, file: undefined, url }
                      : image,
                  ),
                })),
              )
              const data = {
                ...variantPayload(draft, images, !draft.id),
                ...(draft.id && { expectedRevision: draft.revision }),
              }
              await mutation.mutateAsync({
                action: draft.id ? 'updateVariant' : 'createVariant',
                id: productId,
                variantId: draft.id,
                data: draft.id
                  ? changedProductFields(
                      data,
                      variants.find((variant) => variant.id === draft.id),
                    )
                  : data,
              })
              setDraft(null)
              await onUpdated()
              toast.success('Variant saved')
            } catch (error) {
              toast.error(
                error.response?.data?.message ?? 'Could not save variant',
              )
            } finally {
              setUploading(false)
            }
          }}
        >
          <VariantFields
            draft={draft}
            onChange={setDraft}
            errors={errors}
            isNew={!draft.id}
            disabled={busy}
          />
          <div className="product-editor__actions">
            <PanelButton
              variant="cancel"
              label="Cancel variant"
              onClick={() => {
                if (
                  !dirty ||
                  window.confirm('Discard unsaved variant changes?')
                )
                  setDraft(null)
              }}
              disabled={busy}
            />
            <PanelButton
              type="submit"
              label="Save variant"
              loadingLabel="Saving…"
              loading={busy}
            />
          </div>
        </form>
      )}
    </section>
  )
}
