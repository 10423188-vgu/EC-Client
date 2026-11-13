import { useCallback, useState } from 'react'

import { useSearch } from '../../entities/product'
import { DEFAULT_PARAMS } from '../../entities/product/model/product.constants'

const toSearchSort = (sortBy, sortOrder) => {
  if (sortBy === 'price')
    return sortOrder === 'asc' ? 'price_asc' : 'price_desc'
  if (sortBy === 'name') return 'name_asc'
  if (sortBy === 'createdAt')
    return sortOrder === 'asc' ? 'createdAt_asc' : 'createdAt_desc'
  return 'relevance'
}

const buildSearchParams = (params) => ({
  q: params.search || undefined,
  categorySlugs: params.categorySlugs?.length
    ? params.categorySlugs
    : undefined,
  minPrice: params.minPrice,
  maxPrice: params.maxPrice,
  sort: toSearchSort(params.sortBy, params.sortOrder),
  page: params.page,
  limit: params.limit,
})

export const useProductCatalog = () => {
  const [params, setParams] = useState(DEFAULT_PARAMS)
  const [filterOpen, setFilterOpen] = useState(true)

  const searchParams = buildSearchParams(params)
  const { data, isLoading, isError, isFetching, isPlaceholderData, refetch } =
    useSearch(searchParams)

  const handleParamsChange = useCallback((updates) => {
    setParams((prev) => ({
      ...prev,
      ...updates,
      page: 'page' in updates ? updates.page : 1,
    }))
  }, [])

  const toggleFilter = useCallback(() => setFilterOpen((o) => !o), [])

  return {
    params,
    filterOpen,
    toggleFilter,
    handleParamsChange,
    products: data?.products ?? [],
    pagination: data?.pagination,
    aggregations: data?.aggregations ?? null,
    isLoading,
    isError,
    isFetching,
    isPlaceholderData,
    hasData: Boolean(data),
    refetch,
  }
}
