import { useMutation, useQueryClient } from '@tanstack/react-query'
import { wishlistService } from './wishlist.service'
import { WISHLIST_KEYS } from './wishlist.keys'
import { USER_KEYS } from '../../user'

export const useToggleWishlist = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: wishlistService.toggle,
    onMutate: async (productId) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: WISHLIST_KEYS.ids }),
        queryClient.cancelQueries({ queryKey: WISHLIST_KEYS.list }),
      ])

      const prevIds = queryClient.getQueriesData({
        queryKey: WISHLIST_KEYS.ids,
      })
      const prevList = queryClient.getQueriesData({
        queryKey: WISHLIST_KEYS.list,
      })
      const isRemoving =
        prevIds.some(([, ids]) => ids?.includes(productId)) ||
        prevList.some(([, page]) =>
          page?.data.some((item) => item.product.id === productId),
        )

      for (const [key, ids] of prevIds) {
        if (!ids || !key[2]?.includes(productId)) continue
        queryClient.setQueryData(
          key,
          isRemoving
            ? ids.filter((id) => id !== productId)
            : [...ids, productId],
        )
      }

      // why: only remove can be optimistic here — adding needs product data this mutation doesn't have
      if (isRemoving) {
        for (const [key, page] of prevList) {
          if (!page) continue
          queryClient.setQueryData(key, {
            ...page,
            data: page.data.filter((item) => item.product.id !== productId),
          })
        }
      }

      return { prevIds, prevList }
    },
    onError: (_err, _vars, ctx) => {
      for (const [key, ids] of ctx.prevIds) queryClient.setQueryData(key, ids)
      for (const [key, page] of ctx.prevList)
        queryClient.setQueryData(key, page)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: WISHLIST_KEYS.ids })
      queryClient.invalidateQueries({ queryKey: WISHLIST_KEYS.list })
      queryClient.invalidateQueries({ queryKey: USER_KEYS.current })
    },
  })
}

export const useClearWishlist = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: wishlistService.clear,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: WISHLIST_KEYS.ids })
      queryClient.invalidateQueries({ queryKey: WISHLIST_KEYS.list })
      queryClient.invalidateQueries({ queryKey: USER_KEYS.current })
    },
  })
}
