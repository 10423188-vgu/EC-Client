import { lazy } from 'react'
const Home = lazy(() => import('../../../pages/home/HomePage'))
const Product = lazy(() => import('../../../pages/product/ProductPage'))
const ProductDetail = lazy(
  () => import('../../../pages/product/ProductDetailPage'),
)
const Compare = lazy(() => import('../../../pages/compare/ComparePage'))
const SharedWishlist = lazy(
  () => import('../../../pages/wishlist/SharedWishlistPage'),
)
const VerifyEmail = lazy(() => import('../../../pages/auth/VerifyEmailPage'))
export const PublicRoutes = [
  {
    path: 'wishlist/shared/:token',
    element: <SharedWishlist />,
  },
  {
    index: true,
    element: <Home />,
  },
  {
    path: 'products',
    element: <Product />,
  },
  {
    path: 'products/:id',
    element: <ProductDetail />,
  },
  {
    path: 'compare',
    element: <Compare />,
  },
  {
    // why: not under AuthRoutes — that sits behind PublicGuard, which would redirect an
    // already-logged-in user to "/" before the token is ever consumed, and clicking the
    // verification link while already logged in (register → log in → check email later)
    // is the common case, not the exception
    path: 'verify-email',
    element: <VerifyEmail />,
  },
]
