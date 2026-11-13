import { useQuery } from '@tanstack/react-query'
import { cartService } from './cart.service'
import { useAuthStore } from '../../user/model'
import { CART_KEYS } from './cart.keys'

export const useCart = () => {
  const user = useAuthStore((s) => s.user)
  return useQuery({
    queryKey: CART_KEYS.cart,
    queryFn: () => cartService.getCart().then((res) => res.data.data),
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
  })
}

export const useCartCount = () => {
  const user = useAuthStore((s) => s.user)
  return useQuery({
    queryKey: CART_KEYS.cart,
    queryFn: () => cartService.getCart().then((res) => res.data.data),
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
    select: (items) => items.length,
  })
}
