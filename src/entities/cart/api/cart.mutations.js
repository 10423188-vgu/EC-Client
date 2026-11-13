import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cartService } from './cart.service'
import { CART_KEYS } from './cart.keys'

export const useAddToCart = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: cartService.addItem,
    onMutate: async (variantId) => {
      await queryClient.cancelQueries({ queryKey: CART_KEYS.cart })
      const previous = queryClient.getQueryData(CART_KEYS.cart)
      queryClient.setQueryData(CART_KEYS.cart, (old = []) => {
        const existing = old.find((item) => item.variant.id === variantId)
        // why: no full product/variant data on hand to build a new cart row, so a
        // genuinely new item skips the optimistic update and only appears after
        // onSettled refetches
        if (!existing) return old
        return old.map((item) =>
          item.variant.id === variantId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        )
      })
      return { previous }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(CART_KEYS.cart, ctx.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CART_KEYS.cart })
    },
  })
}

export const useUpsertCartItem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: cartService.upsertItem,
    onMutate: async ({ variantId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: CART_KEYS.cart })
      const previous = queryClient.getQueryData(CART_KEYS.cart)
      queryClient.setQueryData(CART_KEYS.cart, (old = []) => {
        const existing = old.find((item) => item.variant.id === variantId)
        // why: same gap as useAddToCart — despite the "upsert" name, this never
        // inserts optimistically, only updates an already-present row
        if (!existing) return old
        return old.map((item) =>
          item.variant.id === variantId ? { ...item, quantity } : item,
        )
      })
      return { previous }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(CART_KEYS.cart, ctx.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CART_KEYS.cart })
    },
  })
}

export const useRemoveCartItem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: cartService.removeItem,
    onMutate: async (variantId) => {
      await queryClient.cancelQueries({ queryKey: CART_KEYS.cart })
      const previous = queryClient.getQueryData(CART_KEYS.cart)
      queryClient.setQueryData(CART_KEYS.cart, (old = []) =>
        old.filter((item) => item.variant.id !== variantId),
      )
      return { previous }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(CART_KEYS.cart, ctx.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CART_KEYS.cart })
    },
  })
}

export const useClearCart = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: cartService.clearCart,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: CART_KEYS.cart })
      const previous = queryClient.getQueryData(CART_KEYS.cart)
      queryClient.setQueryData(CART_KEYS.cart, [])
      return { previous }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(CART_KEYS.cart, ctx.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CART_KEYS.cart })
    },
  })
}
