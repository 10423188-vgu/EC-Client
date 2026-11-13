export const PRODUCT_KEYS = {
  all: ['products'],
  list: (params) => ['products', params],
  // why: nested under "products" so invalidateQueries({queryKey: PRODUCT_KEYS.all}) also
  // catches search results — a review changing reviewStats used to leave stale ratings here
  search: (params) => ['products', 'search', params],
  detail: (id) => ['products', id],
  related: (id) => ['products', id, 'related'],
}
