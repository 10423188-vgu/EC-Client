const ACCEPTED_RETURN_STATUSES = ['APPROVED', 'REFUNDED', 'NO_REFUND']

export const getRemainingReturnItems = (order) => {
  const returnedByItem = new Map()
  for (const request of order.returnRequests ?? []) {
    if (!ACCEPTED_RETURN_STATUSES.includes(request.status)) continue
    for (const item of request.items) {
      returnedByItem.set(
        item.orderItemId,
        (returnedByItem.get(item.orderItemId) ?? 0) + item.quantity,
      )
    }
  }
  return order.items.map((item) => ({
    ...item,
    remaining: item.quantity - (returnedByItem.get(item.id) ?? 0),
  }))
}
