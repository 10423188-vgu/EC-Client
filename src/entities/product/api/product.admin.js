import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { api } from '../../../shared/api/api'
import { PRODUCT_KEYS } from './product.keys'

const invalidateProductViews = (
  client,
  { ids = [], stockVariantId, overview = true, shopping = true } = {},
) =>
  Promise.all(
    [
      ['admin-products', 'list'],
      PRODUCT_KEYS.all,
      ...(overview ? [['admin-products', 'overview']] : []),
      ...(stockVariantId
        ? [['admin-products', 'stock-history', ids[0], stockVariantId]]
        : ids.map((id) => ['admin-products', 'history', id])),
      ...(shopping ? [['cart'], ['wishlist']] : []),
    ].map((queryKey) => client.invalidateQueries({ queryKey })),
  )

export const getAdminProduct = (id) =>
  api.get(`/products/admin/${id}`).then((res) => res.data.data)

export const adminProductService = {
  history: (id, page, signal) =>
    api
      .get(`/products/admin/${id}/history`, { params: { page }, signal })
      .then((res) => res.data),
  createVariant: (id, data) => api.post(`/products/${id}/variants`, data),
  updateVariant: (id, variantId, data) =>
    api.put(`/products/${id}/variants/${variantId}`, data),
  deleteVariant: (id, variantId) =>
    api.delete(`/products/${id}/variants/${variantId}`),
  restoreVariant: (id, variantId) =>
    api.post(`/products/${id}/variants/${variantId}/restore`),
  adjustStock: (id, variantId, data) =>
    api.post(`/products/${id}/variants/${variantId}/stock-adjustments`, data),
  stockHistory: (id, variantId, signal) =>
    api
      .get(`/products/${id}/variants/${variantId}/stock-adjustments`, {
        signal,
      })
      .then((res) => res.data.data),
}

export const useBulkAdminProducts = () => {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (data) =>
      api.post('/products/admin/bulk', data).then((res) => res.data.data),
    onSuccess: (result) =>
      result.changed.length
        ? invalidateProductViews(client, { ids: result.changed })
        : undefined,
  })
}

export const useExportAdminProducts = () =>
  useMutation({
    mutationFn: ({ filters, ids }) =>
      api
        .post('/products/admin/export', ids ? { ids } : {}, {
          params: filters,
          responseType: 'blob',
        })
        .then((res) => res.data),
  })

export const useAdminBrands = () =>
  useQuery({
    queryKey: ['brands'],
    queryFn: ({ signal }) =>
      api
        .get('/brands', { params: { limit: 100 }, signal })
        .then((res) => res.data.data),
    staleTime: 60000,
  })

export const useAdminVariantMutation = () => {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ action, id, variantId, data }) =>
      action === 'createVariant'
        ? adminProductService.createVariant(id, data)
        : adminProductService[action](id, variantId, data),
    onSuccess: (_result, { id, variantId, action, data }) =>
      invalidateProductViews(client, {
        ids: [id],
        stockVariantId: action === 'adjustStock' ? variantId : undefined,
        overview:
          action !== 'updateVariant' ||
          ['price', 'isActive'].some((field) => field in data),
      }),
  })
}

export const useAdminProducts = (params) =>
  useQuery({
    queryKey: ['admin-products', 'list', params],
    queryFn: ({ signal }) =>
      api
        .get('/products/admin/list', { params, signal })
        .then((res) => res.data),
    placeholderData: keepPreviousData,
  })

export const useProductOverview = (days = 14) =>
  useQuery({
    queryKey: ['admin-products', 'overview', days],
    queryFn: ({ signal }) =>
      api
        .get('/products/admin/overview', { params: { days }, signal })
        .then((res) => res.data.data),
    staleTime: 30000,
  })

export const useSaveAdminProduct = () => {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) =>
      id ? api.put(`/products/${id}`, data) : api.post('/products', data),
    onSuccess: (_result, { id, data }) =>
      invalidateProductViews(client, {
        ids: id ? [id] : [],
        overview:
          !id ||
          ['name', 'slug', 'images', 'categoryId', 'brandId', 'isActive'].some(
            (field) => field in data,
          ),
        shopping:
          !id ||
          ['name', 'slug', 'images', 'categoryId', 'brandId', 'isActive'].some(
            (field) => field in data,
          ),
      }),
  })
}

export const useDeleteAdminProduct = () => {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.delete(`/products/${id}`),
    onSuccess: (_result, id) => invalidateProductViews(client, { ids: [id] }),
  })
}

export const useRestoreAdminProduct = () => {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.post(`/products/${id}/restore`),
    onSuccess: (_result, id) => invalidateProductViews(client, { ids: [id] }),
  })
}
