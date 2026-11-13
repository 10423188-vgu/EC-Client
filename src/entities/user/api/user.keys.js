export const USER_KEYS = {
  current: ['currentUser'],
  adminCustomers: (params) => ['adminCustomers', params],
  adminCustomer: (id, page) => ['adminCustomer', id, page],
  adminCustomerOverview: (days) => ['adminCustomerOverview', days],
}
