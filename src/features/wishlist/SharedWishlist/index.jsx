import { useParams, useSearchParams } from 'react-router-dom'
import {
  useSharedWishlist,
  WishlistProductCard,
} from '../../../entities/wishlist'
import {
  ArrowTextLink,
  Pagination,
  RetryButton,
} from '../../../shared/components'
import SharedWishlistSkeleton from './SharedWishlistSkeleton'
import './SharedWishlist.css'

export default function SharedWishlist() {
  const { token } = useParams()
  const [params, setParams] = useSearchParams()
  const page = Math.max(
    1,
    Math.min(10000, Math.trunc(Number(params.get('page'))) || 1),
  )
  const query = useSharedWishlist(token, page)
  const data = query.data
  const invalidToken = !/^[A-Za-z0-9_-]{43}$/.test(token ?? '')
  const unavailable = invalidToken || query.error?.response?.status === 404
  return (
    <section className="shared-wishlist">
      <meta name="robots" content="noindex, nofollow" />
      <meta name="referrer" content="no-referrer" />
      <header className="shared-wishlist__header">
        <span>CURATED FAVORITES</span>
        <h1>Shared wishlist</h1>
        <p>Explore the products saved in this collection.</p>
      </header>

      {unavailable ? (
        <div className="shared-wishlist__state" role="alert">
          <h2>This wishlist is unavailable</h2>
          <p>The link may have been revoked or changed.</p>
          <ArrowTextLink to="/products">Browse products</ArrowTextLink>
        </div>
      ) : query.isError ? (
        <div className="shared-wishlist__state" role="alert">
          <p>Could not load this wishlist.</p>
          <RetryButton
            onClick={() => query.refetch()}
            loading={query.isFetching}
          />
        </div>
      ) : query.isLoading ? (
        <SharedWishlistSkeleton />
      ) : (
        <>
          <div className="shared-wishlist__grid">
            {data?.data.map(({ product }) => (
              <WishlistProductCard key={product.id} product={product} />
            ))}
          </div>
          {!data?.data.length && (
            <p className="shared-wishlist__state">
              No products available on this page.
            </p>
          )}
          {data && (
            <Pagination
              page={page}
              totalPages={data.pagination.totalPages}
              onPageChange={(next) => setParams({ page: next })}
            />
          )}
        </>
      )}
    </section>
  )
}
