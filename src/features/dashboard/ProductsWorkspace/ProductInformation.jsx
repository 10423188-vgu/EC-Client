import { SelectField } from '../../../shared/components'
export default function ProductInformation({
  form,
  onChange,
  errors,
  categories,
  brands,
  disabled,
}) {
  return (
    <section className="product-editor__fields">
      <div className="product-editor__columns">
        {[
          ['name', 'Name'],
          ['slug', 'Slug'],
        ].map(([key, label]) => (
          <label key={key}>
            {label}
            <input
              value={form[key]}
              onChange={(event) => onChange(key, event.target.value)}
              disabled={disabled}
              aria-label={label}
              aria-invalid={Boolean(errors[key])}
            />
            {errors[key] && (
              <small className="product-editor__error" role="alert">
                {errors[key]}
              </small>
            )}
          </label>
        ))}
        <label>
          Category
          <SelectField
            value={form.categoryId}
            onChange={(event) => onChange('categoryId', event.target.value)}
            disabled={disabled}
            aria-label="Category"
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </SelectField>
          {errors.categoryId && (
            <small className="product-editor__error" role="alert">
              {errors.categoryId}
            </small>
          )}
        </label>
        <label>
          Brand
          <SelectField
            value={form.brandId}
            onChange={(event) => onChange('brandId', event.target.value)}
            disabled={disabled}
            aria-label="Brand"
          >
            <option value="">No brand</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </SelectField>
        </label>
      </div>
      <label>
        Description
        <textarea
          value={form.description}
          onChange={(event) => onChange('description', event.target.value)}
          disabled={disabled}
          rows={5}
        />
      </label>
      <label>
        Specifications (one per line: CPU: AMD)
        <textarea
          value={form.attributesText}
          onChange={(event) => onChange('attributesText', event.target.value)}
          disabled={disabled}
          rows={5}
        />
        {errors.attributesText && (
          <small className="product-editor__error" role="alert">
            {errors.attributesText}
          </small>
        )}
      </label>
      <label>
        Tags (comma-separated)
        <input
          value={form.tagsText}
          onChange={(event) => onChange('tagsText', event.target.value)}
          disabled={disabled}
        />
      </label>
      <div className="product-editor__inline">
        <label className="product-editor__check">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) => onChange('isActive', event.target.checked)}
            disabled={disabled}
          />
          Active product
        </label>
        <label className="product-editor__check">
          <input
            type="checkbox"
            checked={form.isFeatured}
            onChange={(event) => onChange('isFeatured', event.target.checked)}
            disabled={disabled}
          />
          Featured product
        </label>
      </div>
    </section>
  )
}
