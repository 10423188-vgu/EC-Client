import ProductGallery from './ProductGallery'
import { validateVariant } from './editorHelpers'

export default function VariantFields({
  draft,
  onChange,
  errors = {},
  isNew,
  disabled,
}) {
  const change = (key, value) => onChange({ ...draft, [key]: value })
  const visibleErrors = Object.keys(errors).length
    ? validateVariant(draft, isNew)
    : errors
  return (
    <section className="product-editor__fields">
      <div className="product-editor__columns">
        {[
          ['sku', 'SKU', 'text'],
          ['name', 'Variant name', 'text'],
          ['price', 'Price (VND)', 'number'],
          ['salePrice', 'Sale price (VND)', 'number'],
          ['weight', 'Weight (grams)', 'number'],
          ...(isNew ? [['stock', 'Initial stock', 'number']] : []),
        ].map(([key, label, type]) => (
          <label key={key}>
            {label}
            <input
              type={type}
              value={draft[key]}
              onChange={(event) => change(key, event.target.value)}
              disabled={disabled}
              aria-label={label}
              aria-invalid={Boolean(visibleErrors[key])}
            />
            {visibleErrors[key] && (
              <small className="product-editor__error" role="alert">
                {visibleErrors[key]}
              </small>
            )}
          </label>
        ))}
      </div>
      <label>
        Options (one per line: Color: Red)
        <textarea
          value={draft.optionsText ?? ''}
          onChange={(event) => change('optionsText', event.target.value)}
          disabled={disabled}
          rows={3}
          aria-invalid={Boolean(visibleErrors.optionsText)}
        />
        {visibleErrors.optionsText && (
          <small className="product-editor__error" role="alert">
            {visibleErrors.optionsText}
          </small>
        )}
      </label>
      <label className="product-editor__check">
        <input
          type="checkbox"
          checked={draft.isActive}
          onChange={(event) => change('isActive', event.target.checked)}
          disabled={disabled}
        />
        Active variant
      </label>
      <ProductGallery
        images={draft.images}
        onChange={(images) => change('images', images)}
        disabled={disabled}
        name="Variant"
      />
    </section>
  )
}
