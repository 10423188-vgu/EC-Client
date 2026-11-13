export const DASHBOARD_SECTION_TITLES = {
  dashboard: 'Dashboard',
  orders: 'Orders',
  products: 'Products',
  categories: 'Categories',
  brands: 'Brands',
  customers: 'Customers',
  coupons: 'Coupons',
  analytics: 'Analytics',
}

export const getDashboardSection = (section) =>
  section === 'catalog'
    ? 'categories'
    : DASHBOARD_SECTION_TITLES[section]
      ? section
      : 'dashboard'
