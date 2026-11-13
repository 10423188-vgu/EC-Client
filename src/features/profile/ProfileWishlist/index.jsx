import './ProfileWishlist.css'
import { useState } from 'react'
import { FaHeart } from 'react-icons/fa'
import { ProfileWishlistSkeleton } from './ProfileWishlistSkeleton'
import { toast } from 'sonner'
import {
  useWishlist,
  useToggleWishlist,
  useClearWishlist,
  WishlistProductCard,
  wishlistService,
} from '../../../entities/wishlist'
import { useAuthStore } from '../../../entities/user/model'
import {
  TrashButton,
  Pagination,
  RetryButton,
  ConfirmDialog,
  Tooltip,
} from '../../../shared/components'
import WishlistControls from './WishlistControls'

export default function ProfileWishlist() {
  const [page, setPage] = useState(1)
  const [confirmClear, setConfirmClear] = useState(false)
  const wishlistCount = useAuthStore((state) => state.user?.wishlistCount)
  const {
    data: result,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useWishlist(page)
  const items = result?.data ?? []
  const totalPages = result?.pagination.totalPages ?? 1
  const totalItems = result?.pagination.total ?? wishlistCount ?? 0
  const {
    mutate: toggleWishlist,
    isPending,
    variables: removingId,
  } = useToggleWishlist()
  const clearWishlist = useClearWishlist()
  const handleRemove = (productId, productName) => {
    toggleWishlist(productId, {
      onSuccess: () => {
        if (items.length === 1 && page > 1) setPage(page - 1)

        // why: announce the change after the server confirms the toggle. Recheck
        // membership before Undo so a newer user action is never toggled off.
        toast.success(`Removed "${productName}" from wishlist`, {
          action: {
            label: 'Undo',
            onClick: async () => {
              try {
                const { data } = await wishlistService.getWishlistIds([
                  productId,
                ])
                if (data.data.includes(productId)) {
                  toast.info(`"${productName}" is already in your wishlist`)
                  return
                }
                toggleWishlist(productId, {
                  onError: () => toast.error('Failed to restore wishlist item'),
                })
              } catch {
                toast.error('Failed to check wishlist. Please try again.')
              }
            },
          },
          duration: 5000,
        })
      },
      onError: () => toast.error('Failed to remove from wishlist'),
    })
  }
  if (isLoading) {
    return (
      <ProfileWishlistSkeleton
        itemCount={wishlistCount ?? null}
        controls={<WishlistControls />}
      />
    )
  }
  return (
    <section className="profile-wishlist">
      <WishlistControls />
      {isError && result && (
        <div role="alert">
          <p>Could not refresh your wishlist. Showing saved items.</p>
          <RetryButton onClick={() => refetch()} loading={isFetching} />
        </div>
      )}
      {isError && !result ? (
        <div className="profile-wishlist__empty" role="alert">
          <p>Could not load your wishlist.</p>
          <RetryButton onClick={() => refetch()} loading={isFetching} />
        </div>
      ) : items.length === 0 ? (
        <div className="profile-wishlist__empty">
          <FaHeart className="profile-wishlist__empty-icon" />
          <p>No favorite products yet</p>
        </div>
      ) : (
        <>
          <div className="profile-wishlist__actions">
            <p className="profile-wishlist__count">
              {totalItems} saved {totalItems === 1 ? 'product' : 'products'}
            </p>
            <Tooltip content="Delete all">
              <TrashButton
                size={38}
                disabled={isPending || clearWishlist.isPending}
                aria-label="Delete all wishlist items"
                onClick={() => setConfirmClear(true)}
              />
            </Tooltip>
          </div>
          <div className="profile-wishlist__grid">
            {items.map(({ product }) => (
              <WishlistProductCard
                key={product.id}
                product={product}
                action={
                  <TrashButton
                    onClick={() => handleRemove(product.id, product.name)}
                    disabled={
                      clearWishlist.isPending ||
                      (isPending && removingId === product.id)
                    }
                    aria-label="Remove from wishlist"
                  />
                }
              />
            ))}
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
      {confirmClear && (
        <ConfirmDialog
          title="Delete all wishlist items?"
          message="This removes every saved product from your wishlist and empties any active share link. This action cannot be undone."
          confirmLabel="Delete all"
          onConfirm={() => {
            setConfirmClear(false)
            clearWishlist.mutate(undefined, {
              onSuccess: (response) => {
                setConfirmClear(false)
                setPage(1)
                const deletedCount = response.data.data.deletedCount
                toast.success(
                  `${deletedCount} ${deletedCount === 1 ? 'product' : 'products'} removed from your wishlist`,
                )
              },
              onError: () => toast.error('Could not clear your wishlist'),
            })
          }}
          onCancel={() => setConfirmClear(false)}
        />
      )}
    </section>
  )
}
