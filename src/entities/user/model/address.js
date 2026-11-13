export const ADDRESS_COUNTRIES = [
  ['VN', 'Vietnam'],
  ['US', 'United States'],
  ['CA', 'Canada'],
  ['GB', 'United Kingdom'],
  ['AU', 'Australia'],
  ['SG', 'Singapore'],
]

export const formatAddress = (address) => {
  if (!address) return ''
  const country =
    ADDRESS_COUNTRIES.find(([code]) => code === address.countryCode)?.[1] ??
    address.countryCode
  return [
    address.street,
    address.ward,
    address.district,
    address.city,
    address.postalCode,
    country,
  ]
    .filter(Boolean)
    .join(', ')
}
