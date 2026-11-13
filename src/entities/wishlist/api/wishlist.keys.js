export const WISHLIST_KEYS = {
  ids: ['wishlist', 'ids'],
  list: ['wishlist', 'list'],
  listPage: (page) => ['wishlist', 'list', page],
  idsFor: (productIds) => ['wishlist', 'ids', productIds],
  preferences: (userId) => ['wishlistPreferences', userId],
  shared: (token, page) => ['sharedWishlist', token, page],
}
