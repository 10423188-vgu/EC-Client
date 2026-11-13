import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { categoryService } from '../../entities/category'
import { brandService } from '../../entities/brand'

const SERVICES = { categories: categoryService, brands: brandService }

export function useCatalogWorkspace(kind) {
  const [params, setParams] = useSearchParams()
  const filters = {
    search: (params.get('catalogSearch') ?? '').slice(0, 100),
    status: ['active', 'inactive'].includes(params.get('catalogStatus'))
      ? params.get('catalogStatus')
      : undefined,
    page: Math.min(
      1000,
      Math.max(1, Math.trunc(Number(params.get('catalogPage'))) || 1),
    ),
    limit: [10, 20, 50].includes(Number(params.get('catalogLimit')))
      ? Number(params.get('catalogLimit'))
      : 10,
    sortOrder: params.get('catalogSort') === 'desc' ? 'desc' : 'asc',
  }
  const change = (values) => {
    setParams((current) => {
      const next = new URLSearchParams(current)
      next.delete('catalogPage')
      for (const [key, value] of Object.entries(values)) {
        if (value) next.set(key, String(value))
        else next.delete(key)
      }
      return next
    })
  }
  const list = useQuery({
    queryKey: ['admin-catalog', kind, filters],
    queryFn: ({ signal }) => SERVICES[kind].adminList(filters, signal),
    placeholderData: (previous, query) =>
      query?.queryKey[1] === kind ? previous : undefined,
  })
  const parents = useQuery({
    queryKey: ['admin-catalog', 'parents'],
    queryFn: ({ signal }) => categoryService.parentOptions(signal),
    enabled: kind === 'categories',
    staleTime: 60000,
  })
  const client = useQueryClient()
  const mutation = useMutation({
    mutationFn: ({ kind: target, action, id, data }) => {
      const service = SERVICES[target]
      if (action === 'create') return service.create(data)
      if (action === 'update') return service.update(id, data)
      return service.remove(id)
    },
    onSuccess: (_result, { kind: target }) => {
      const queryKeys = [
        ['admin-catalog', target],
        [target],
        ['admin-products', 'list'],
        ['products'],
      ]
      if (target === 'categories') {
        queryKeys.push(
          ['admin-catalog', 'parents'],
          ['admin-products', 'overview'],
        )
      }
      return Promise.all(
        queryKeys.map((queryKey) => client.invalidateQueries({ queryKey })),
      )
    },
  })
  return { kind, filters, change, list, parents, mutation }
}
