import { uploadService } from '../../../shared/api/upload.service'

export const makeSlug = (name) =>
  name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

export const newVariant = () => ({
  clientId: crypto.randomUUID(),
  sku: '',
  name: 'Default',
  price: '',
  salePrice: '',
  stock: '0',
  weight: '',
  isActive: true,
  options: {},
  optionsText: '',
  images: [],
})

export const variantDraft = (variant) => ({
  ...variant,
  price: String(variant.price ?? ''),
  salePrice: variant.salePrice == null ? '' : String(variant.salePrice),
  weight: variant.weight == null ? '' : String(variant.weight),
  stock: String(variant.stock ?? 0),
  optionsText: Object.entries(variant.options ?? {})
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n'),
})

export const validateVariant = (variant, isNew = false) => {
  const errors = {}
  if (!variant.sku.trim()) errors.sku = 'SKU is required'
  if (!variant.name.trim()) errors.name = 'Variant name is required'
  if (!(Number(variant.price) > 0)) errors.price = 'Price must be positive'
  if (
    variant.salePrice !== '' &&
    (!(Number(variant.salePrice) > 0) ||
      Number(variant.salePrice) >= Number(variant.price))
  ) {
    errors.salePrice = 'Sale price must be positive and lower than price'
  }
  if (
    isNew &&
    (!Number.isInteger(Number(variant.stock)) || Number(variant.stock) < 0)
  )
    errors.stock = 'Stock must be a non-negative integer'
  if (variant.weight !== '' && !(Number(variant.weight) > 0))
    errors.weight = 'Weight must be positive'
  const lines = (variant.optionsText ?? '')
    .split('\n')
    .filter((line) => line.trim())
  if (
    lines.some(
      (line) =>
        line.indexOf(':') < 1 || !line.slice(line.indexOf(':') + 1).trim(),
    )
  )
    errors.optionsText = 'Use one Key: Value per line'
  return errors
}

export const variantPayload = (variant, images, isNew) => ({
  sku: variant.sku.trim(),
  name: variant.name.trim(),
  price: Number(variant.price),
  salePrice: variant.salePrice === '' ? null : Number(variant.salePrice),
  weight: variant.weight === '' ? null : Number(variant.weight),
  options: Object.fromEntries(
    (variant.optionsText ?? '')
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => {
        const colon = line.indexOf(':')
        return [line.slice(0, colon).trim(), line.slice(colon + 1).trim()]
      }),
  ),
  images,
  isActive: variant.isActive,
  ...(isNew && { stock: Number(variant.stock) }),
})

export const changedProductFields = (data, original) =>
  Object.fromEntries(
    Object.entries(data).filter(
      ([field, value]) =>
        JSON.stringify(value) !== JSON.stringify(original[field]),
    ),
  )

export const saveGallery = async (images, onUploaded) => {
  const result = new Array(images.length)
  let next = 0
  let failure
  // why: two workers overlap network IO without flooding Cloudinary. Wait for
  // in-flight uploads after failure so their URLs are retained before retry.
  const worker = async () => {
    while (next < images.length && !failure) {
      const position = next++
      const image = images[position]
      try {
        const url = image.file
          ? await uploadService.uploadImage(image.file, 'products')
          : image.url
        if (image.file) onUploaded(image.preview, url)
        result[position] = { url, altText: image.altText ?? null, position }
      } catch (error) {
        failure = error
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(2, images.length) }, worker))
  if (failure) throw failure
  return result
}
