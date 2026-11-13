import { useQuery } from '@tanstack/react-query'
import { wishlistService } from './wishlist.service'
import { useAuthStore } from '../../user/model'
import { WISHLIST_KEYS } from './wishlist.keys'

export const useWishlistPreferences = () => {
  const userId = useAuthStore((state) => state.user?.id)
  return useQuery({
    queryKey: WISHLIST_KEYS.preferences(userId),
    enabled: !!userId,
    queryFn: () =>
      wishlistService.getPreferences().then((res) => res.data.data),
  })
}

export const useSharedWishlist = (token, page) =>
  useQuery({
    queryKey: WISHLIST_KEYS.shared(token, page),
    queryFn: ({ signal }) =>
      wishlistService
        .getSharedWishlist(token, page, signal)
        .then((res) => res.data.data),
    enabled: /^[A-Za-z0-9_-]{43}$/.test(token ?? ''),
    retry: false,
  })

export const useWishlistIds = (productIds) => {
  const user = useAuthStore((s) => s.user)
  const ids = [...new Set(productIds)].sort()
  return useQuery({
    queryKey: WISHLIST_KEYS.idsFor(ids),
    queryFn: ({ signal }) =>
      wishlistService.getWishlistIds(ids, signal).then((res) => res.data.data),
    enabled: !!user && ids.length > 0,
    staleTime: 5 * 60 * 1000,
  })
}

export const useWishlist = (page) => {
  const user = useAuthStore((s) => s.user)
  return useQuery({
    queryKey: WISHLIST_KEYS.listPage(page),
    queryFn: ({ signal }) =>
      wishlistService.getWishlist(page, signal).then((res) => res.data.data),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  })
}
