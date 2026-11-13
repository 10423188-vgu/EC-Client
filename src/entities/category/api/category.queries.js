import { useQuery } from '@tanstack/react-query'
import { categoryService } from './category.service'
import { CATEGORY_KEYS } from './category.keys'

export const useCategories = (params) => {
  return useQuery({
    queryKey: CATEGORY_KEYS.list(params),
    queryFn: () =>
      categoryService.getCategories(params).then((res) => res.data.data),
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
}
