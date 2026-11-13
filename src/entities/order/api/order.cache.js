import { ORDER_KEYS } from './order.keys'

export const invalidateOrderViews = (client, id, { metrics = true } = {}) =>
  Promise.all(
    [
      ['orders', 'list'],
      ['orders', 'admin', 'list'],
      ...(metrics ? [['orders', 'admin', 'metrics']] : []),
      ...(metrics ? [['orders', 'admin', 'analytics']] : []),
      ...(id ? [ORDER_KEYS.detail(id), ORDER_KEYS.adminDetail(id)] : []),
    ].map((queryKey) => client.invalidateQueries({ queryKey })),
  )
