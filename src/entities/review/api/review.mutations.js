import { useMutation, useQueryClient } from '@tanstack/react-query'
import { reviewService } from './review.service.js'
import { REVIEW_KEYS } from './review.keys.js'
import { PRODUCT_KEYS } from '../../product/api/product.keys.js'
import { USER_KEYS } from '../../user'

const invalidateReviewsAndProduct = (qc, productId) => {
  qc.invalidateQueries({ queryKey: REVIEW_KEYS.byProduct(productId) })
  // why: hardcoded prefix — matches both myReview(productId) and myReviews(params) key shapes
  qc.invalidateQueries({ queryKey: ['reviews', 'mine'] })
  // NOTE: PRODUCT_KEYS.all is a bare ["products"] prefix, also matches detail/list/related/search
  qc.invalidateQueries({ queryKey: PRODUCT_KEYS.all })
}

export const useCreateReview = (productId) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => reviewService.createReview(productId, data),
    onSuccess: () => {
      invalidateReviewsAndProduct(qc, productId)
      qc.invalidateQueries({ queryKey: USER_KEYS.current })
    },
  })
}

export const useUpdateReview = (productId) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ reviewId, data }) =>
      reviewService.updateReview(reviewId, data),
    onSuccess: () => invalidateReviewsAndProduct(qc, productId),
  })
}

export const useDeleteReview = (productId) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (reviewId) => reviewService.deleteReview(reviewId),
    onSuccess: () => {
      invalidateReviewsAndProduct(qc, productId)
      qc.invalidateQueries({ queryKey: USER_KEYS.current })
    },
  })
}

export const useVoteHelpful = (productId) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ reviewId, vote }) =>
      reviewService.voteHelpful(reviewId, vote),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: REVIEW_KEYS.byProduct(productId) })
    },
  })
}
