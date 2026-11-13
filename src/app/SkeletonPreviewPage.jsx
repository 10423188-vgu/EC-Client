import './SkeletonPreviewPage.css'
import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useScrollRestoration } from '../shared/hooks/useScrollRestoration'
import { FiCheck } from 'react-icons/fi'
import { CHECKOUT_STEPS } from '../entities/order'
import { useAuthStore } from '../entities/user/model'
import {
  Checkbox,
  CreateButton,
  ArrowButton,
  SlidingTabs,
  StepIndicator,
} from '../shared/components'
import HomeIntro from '../features/home/HomeIntro'
import HomeFeatures from '../features/home/HomeFeatures'
import ProductFacetSkeleton from '../features/product/ProductFacet/ProductFacetSkeleton'
import ProductList from '../features/product/ProductList'
import { ProductDetailSkeleton } from '../features/product/ProductDetailSkeleton'
import { ProductRelatedSkeleton } from '../features/product/ProductRelated'
import { ReviewProductSkeleton } from '../features/review/ReviewProduct/ReviewProductSkeleton'
import { ProfileWishlistSkeleton } from '../features/profile/ProfileWishlist/ProfileWishlistSkeleton'
import ProfileHero from '../features/profile/ProfileHero'
import ProfileTabs from '../features/profile/ProfileTabs'
import WishlistControls from '../features/profile/ProfileWishlist/WishlistControls'
import { SecurityItemSkeleton } from '../features/profile/ProfileSecurity/ProfileSecuritySkeleton'
import {
  ORDER_SKELETON_COUNT,
  ORDER_TABS,
  OrderCardSkeleton,
} from '../features/order/OrderList'
import OrderDetailSkeleton from '../features/order/OrderDetail/OrderDetailSkeleton'
import CheckoutFlowSkeleton from '../features/checkout/CheckoutFlow/CheckoutFlowSkeleton'
import { PaymentQrSkeleton } from '../features/payment/PaymentQr'
import PaymentResultSummarySkeleton from '../features/payment/PaymentResult/PaymentResultSummarySkeleton'
import SharedWishlistSkeleton from '../features/wishlist/SharedWishlist/SharedWishlistSkeleton'
import DashboardWorkspaceSkeleton from '../features/dashboard/DashboardWorkspaceSkeleton'
import '../pages/product/ProductPage.css'
import '../pages/product/ProductDetailPage.css'
import '../features/order/OrderList/OrderList.css'
import '../features/wishlist/SharedWishlist/SharedWishlist.css'
import '../features/payment/PaymentResult/PaymentResult.css'
import '../features/payment/PaymentPage.css'
import '../features/profile/ProfileSecurity/ProfileSecurity.css'

const DASHBOARD_SECTIONS = [
  'dashboard',
  'analytics',
  'orders',
  'products',
  'categories',
  'brands',
  'customers',
  'coupons',
]
const VIEWS = [
  ['home-intro', 'Home categories'],
  ['home-features', 'Home products'],
  ['products', 'Product list and filters'],
  ['product-detail', 'Product detail, reviews, related'],
  ['profile-wishlist', 'Profile wishlist'],
  ['profile-security', 'Profile security'],
  ['orders', 'Order list'],
  ['order-detail', 'Order detail'],
  ['checkout', 'Checkout'],
  ['payment-qr', 'Payment QR'],
  ['payment-result', 'Payment result summary'],
  ['shared-wishlist', 'Shared wishlist'],
  ...DASHBOARD_SECTIONS.map((section) => [
    `dashboard-${section}`,
    `Dashboard ${section === 'dashboard' ? 'overview' : section}`,
  ]),
]
const LOADING_QUERY = {
  data: [],
  isLoading: true,
  isError: false,
  isFetching: true,
}
const PREVIEW_USER = {
  name: 'Demo member',
  createdAt: '2026-08-01T00:00:00.000Z',
  hasPassword: true,
  ordersCount: 1,
  wishlistCount: 1,
  reviewsCount: 1,
}

function PreviewWishlistControls() {
  return (
    <header className="wishlist-controls">
      <div>
        <h2 className="wishlist-controls__title">Your wishlist</h2>
        <p className="wishlist-controls__description">
          Your wishlist is private. Create a link to share the products.
        </p>
        <label className="wishlist-controls__alerts">
          <Checkbox checked readOnly />
          Notify me when saved products drop in price
        </label>
      </div>
      <div className="wishlist-controls__sharing">
        <CreateButton disabled>Create share link</CreateButton>
      </div>
    </header>
  )
}

function Preview({ view, user }) {
  const profileUser = user ?? PREVIEW_USER
  if (view === 'home-intro') {
    return <HomeIntro categoriesQuery={LOADING_QUERY} />
  }
  if (view === 'home-features') {
    return (
      <HomeFeatures
        featuredProductsQuery={LOADING_QUERY}
        renderProduct={() => null}
      />
    )
  }
  if (view === 'products') {
    return (
      <main className="product">
        <div className="product__body">
          <ProductFacetSkeleton />
          <ProductList
            products={[]}
            pagination={null}
            params={{ sortBy: 'createdAt', sortOrder: 'desc' }}
            filterOpen
            isLoading
            isError={false}
            isFetching
            isPlaceholderData={false}
            hasData={false}
            onParamsChange={() => {}}
            onToggleFilter={() => {}}
          />
        </div>
      </main>
    )
  }
  if (view === 'product-detail') {
    return (
      <main className="product-detail">
        <ProductDetailSkeleton />
        <ReviewProductSkeleton showCta={false} />
        <ProductRelatedSkeleton />
      </main>
    )
  }
  if (view === 'profile-wishlist') {
    return (
      <main className="profile">
        <ProfileHero user={profileUser} />
        <ProfileTabs
          activeTab="wishlist"
          wishlistCount={profileUser.wishlistCount}
          onChange={() => {}}
        />
        <ProfileWishlistSkeleton
          itemCount={profileUser.wishlistCount}
          controls={user ? <WishlistControls /> : <PreviewWishlistControls />}
        />
      </main>
    )
  }
  if (view === 'profile-security') {
    return (
      <main className="profile">
        <ProfileHero user={profileUser} />
        <ProfileTabs
          activeTab="security"
          wishlistCount={profileUser.wishlistCount}
          onChange={() => {}}
        />
        <section className="profile-security" aria-label="Security settings">
          <SecurityItemSkeleton ariaLabel="Password settings loading" />
          <SecurityItemSkeleton />
          <SecurityItemSkeleton ariaLabel="Active sessions loading" />
        </section>
      </main>
    )
  }
  if (view === 'orders') {
    return (
      <main className="orders-page">
        <h1 className="orders-page__title">My Orders</h1>
        <div className="orders-page__filters">
          <SlidingTabs
            tabs={ORDER_TABS}
            value=""
            className="orders-page__filters-track"
            onChange={() => {}}
            ariaLabel="Filter orders by status"
          />
        </div>
        <div className="orders-page__list" role="status" aria-busy="true">
          {Array.from({ length: ORDER_SKELETON_COUNT }, (_, index) => (
            <OrderCardSkeleton key={index} />
          ))}
        </div>
      </main>
    )
  }
  if (view === 'order-detail') return <OrderDetailSkeleton />
  if (view === 'checkout') {
    return (
      <main className="checkout-page">
        <StepIndicator steps={CHECKOUT_STEPS} activeIndex={1} />
        <CheckoutFlowSkeleton />
      </main>
    )
  }
  if (view === 'payment-qr') return <PaymentQrSkeleton />
  if (view === 'payment-result') {
    return (
      <main className="payment-page payment-result">
        <StepIndicator steps={CHECKOUT_STEPS} activeIndex={3} />
        <div className="payment-card payment-result__card">
          <div className="payment-result__icon payment-result__icon--success">
            <FiCheck />
          </div>
          <h1 className="payment-result__title">Payment successful!</h1>
          <p className="payment-result__subtitle">
            Your order has been confirmed.
          </p>
          <p className="payment-result__order-id">
            Order ID:{' '}
            <span
              className="skeleton skeleton-preview__order-id"
              aria-hidden="true"
            />
          </p>
          <PaymentResultSummarySkeleton />
          <div className="payment-result__actions">
            <span className="eye-button" aria-hidden="true">
              <span className="eye-button__icon" />
              <span className="eye-button__label">View order</span>
            </span>
            <ArrowButton to="/products">Continue shopping</ArrowButton>
          </div>
        </div>
      </main>
    )
  }
  if (view === 'shared-wishlist') {
    return (
      <section className="shared-wishlist">
        <header className="shared-wishlist__header">
          <span>CURATED FAVORITES</span>
          <h1>Shared wishlist</h1>
          <p>Explore the products saved in this collection.</p>
        </header>
        <SharedWishlistSkeleton />
      </section>
    )
  }
  if (view.startsWith('dashboard-')) {
    return (
      <main className="skeleton-preview__dashboard">
        <DashboardWorkspaceSkeleton section={view.slice('dashboard-'.length)} />
      </main>
    )
  }
  return null
}

export default function SkeletonPreviewPage() {
  useScrollRestoration()
  const user = useAuthStore((state) => state.user)
  const [params] = useSearchParams()
  const selected = params.get('view')
  const view = VIEWS.some(([id]) => id === selected) ? selected : VIEWS[0][0]
  const label = VIEWS.find(([id]) => id === view)?.[1]

  useEffect(() => {
    // why: localhost shares the real app's login state and Chrome zoom level.
    if (window.location.hostname === '127.0.0.1') {
      const url = new URL(window.location.href)
      url.hostname = 'localhost'
      window.location.replace(url)
    }
  }, [])

  return (
    <div className="skeleton-preview">
      <nav className="skeleton-preview__nav" aria-label="Skeleton previews">
        <h1>Skeleton previews</h1>
        <div className="skeleton-preview__links">
          {VIEWS.map(([id, title]) => (
            <Link
              key={id}
              to={`?view=${id}`}
              className={
                id === view
                  ? 'skeleton-preview__link skeleton-preview__link--active'
                  : 'skeleton-preview__link'
              }
            >
              {title}
            </Link>
          ))}
        </div>
      </nav>
      <div
        className={`skeleton-preview__content${view.startsWith('profile-') ? ' skeleton-preview__content--profile' : ''}`}
      >
        <h2 className="skeleton-preview__heading">{label}</h2>
        <Preview view={view} user={user} />
      </div>
    </div>
  )
}
