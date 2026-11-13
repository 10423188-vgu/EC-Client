export const userLib = {
  getMemberSince: (createdAt) =>
    createdAt
      ? new Date(createdAt).toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        })
      : 'Unknown',

  getDefaultAddress: (addresses = []) =>
    addresses.find((a) => a.isDefault) ?? addresses[0] ?? null,

  formatLocation: (address) => {
    if (!address) return null
    const parts = [address.district, address.city].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : null
  },
}
