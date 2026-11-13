export const REVIEW_KEYS = {
  // NOTE: omitting params yields a 3-element prefix that matches all cached queries for this product's reviews
  byProduct: (productId, params) =>
    params !== undefined
      ? ['reviews', 'product', productId, params]
      : ['reviews', 'product', productId],
  myReview: (productId) => ['reviews', 'mine', productId],
  myReviews: (params) => ['reviews', 'mine', 'list', params],
}
