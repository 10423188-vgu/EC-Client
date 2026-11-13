import { useQuery } from '@tanstack/react-query'
import { reviewService } from './review.service.js'
import { REVIEW_KEYS } from './review.keys.js'
import { useAuthStore } from '../../user/model/index.js'

export const useProductReviews = (productId, params = {}) =>
  useQuery({
    queryKey: REVIEW_KEYS.byProduct(productId, params),
    queryFn: () =>
      reviewService
        .getProductReviews(productId, params)
        .then((res) => res.data),
    enabled: !!productId,
    staleTime: 2 * 60 * 1000,
    retry: false,
  })

export const useMyReview = (productId) => {
  const user = useAuthStore((s) => s.user)
  return useQuery({
    queryKey: REVIEW_KEYS.myReview(productId),
    queryFn: () =>
      reviewService.getMyReview(productId).then((res) => res.data.data),
    enabled: !!user && !!productId,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
}

export const useMyReviews = (params = {}) => {
  const user = useAuthStore((s) => s.user)
  return useQuery({
    queryKey: REVIEW_KEYS.myReviews(params),
    queryFn: () => reviewService.getMyReviews(params).then((res) => res.data),
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
    retry: false,
  })
}
