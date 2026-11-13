export const DEFAULT_PARAMS = {
  page: 1,
  limit: 12,
  sortBy: 'createdAt',
  sortOrder: 'desc',
}

export const SORT_OPTIONS = [
  { label: 'Newest', value: 'createdAt_desc' },
  { label: 'Oldest', value: 'createdAt_asc' },
  { label: 'Price: Low → High', value: 'price_asc' },
  { label: 'Price: High → Low', value: 'price_desc' },
  { label: 'Name A-Z', value: 'name_asc' },
]

export const BREADCRUMB_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Products' },
]

export const BREADCRUMB_DETAIL_ITEMS = (name) => [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: name ?? '...' },
]
