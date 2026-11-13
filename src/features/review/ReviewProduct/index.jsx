import { useState, useCallback, useMemo, useRef } from 'react'
import { toast } from 'sonner'
import './ReviewProduct.css'
import {
  useProductReviews,
  useMyReview,
  useCreateReview,
  useUpdateReview,
  useDeleteReview,
  useVoteHelpful,
  ReviewStats,
  ReviewCard,
} from '../../../entities/review/index.js'
import { useAuthStore } from '../../../entities/user/model/index.js'
import { ReviewForm } from '../ReviewForm/index.jsx'
import { ReviewProductSkeleton } from './ReviewProductSkeleton'
import {
  ConfirmDialog,
  Pagination,
  RetryButton,
  SelectField,
} from '../../../shared/components'
import useReviewGsap from '../animations/review.gsap'
const SORT_OPTIONS = [
  {
    value: 'helpful',
    label: 'Most helpful',
  },
  {
    value: 'recent',
    label: 'Most recent',
  },
  {
    value: 'highest',
    label: 'Highest rated',
  },
  {
    value: 'lowest',
    label: 'Lowest rated',
  },
]
export const ReviewProduct = ({ productId }) => {
  const sectionRef = useRef(null)
  const user = useAuthStore((s) => s.user)
  const [sort, setSort] = useState('helpful')
  const [ratingFilter, setRatingFilter] = useState(undefined)
  const [page, setPage] = useState(1)
  const [editingReview, setEditingReview] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState(null)
  const [confirmDeleteReview, setConfirmDeleteReview] = useState(null)
  const params = useMemo(
    () => ({
      sort,
      rating: ratingFilter,
      page,
      limit: 10,
    }),
    [sort, ratingFilter, page],
  )
  const { data, isLoading, isError, isFetching, refetch } = useProductReviews(
    productId,
    params,
  )
  useReviewGsap(sectionRef, productId, isLoading)
  const { data: myReview } = useMyReview(productId)
  const createMutation = useCreateReview(productId)
  const updateMutation = useUpdateReview(productId)
  const deleteMutation = useDeleteReview(productId)
  const voteMutation = useVoteHelpful(productId)
  const handleCreate = useCallback(
    async (formData) => {
      await createMutation.mutateAsync(formData)
      toast.success('Your review has been submitted!')
      setShowForm(false)
    },
    [createMutation],
  )
  const handleUpdate = useCallback(
    async (formData) => {
      await updateMutation.mutateAsync({
        reviewId: editingReview._id,
        data: formData,
      })
      toast.success('Review updated!')
      setEditingReview(null)
    },
    [updateMutation, editingReview],
  )
  const handleDelete = useCallback(
    (review) => {
      setConfirmDeleteReview(null)
      setPendingDeleteId(review._id)
      deleteMutation.mutate(review._id, {
        onSuccess: () => {
          setPendingDeleteId(null)
          // why: only announce deletion after the server confirms the mutation.
          toast.success('Review deleted', {
            action: {
              label: 'Undo',
              onClick: async () => {
                try {
                  await createMutation.mutateAsync({
                    rating: review.rating,
                    title: review.title,
                    body: review.body,
                  })
                } catch {
                  toast.error('Failed to restore review.')
                }
              },
            },
            duration: 5000,
          })
        },
        onError: () => {
          setPendingDeleteId(null)
          toast.error('Could not delete review.')
        },
      })
    },
    [deleteMutation, createMutation],
  )
  const handleVote = useCallback(
    (reviewId, vote) => {
      if (!user) {
        toast.info('Please sign in to vote')
        return
      }
      return voteMutation.mutateAsync({ reviewId, vote })
    },
    [user, voteMutation],
  )
  const handleRatingFilter = useCallback((rating) => {
    setRatingFilter(rating)
    setPage(1)
  }, [])
  const reviews = (data?.data ?? []).filter((r) => r._id !== pendingDeleteId)
  const reviewStats = data?.reviewStats
  const pagination = data?.pagination
  const canReview = !!user && !myReview
  if (isLoading) return <ReviewProductSkeleton showCta={canReview} />
  return (
    <section
      ref={sectionRef}
      className="review-product"
      aria-label="Customer reviews"
    >
      <h2 className="review-product__title">Customer Reviews</h2>

      <div className="review-product__layout">
        <aside className="review-product__left">
          {reviewStats && (
            <ReviewStats
              reviewStats={reviewStats}
              activeRating={ratingFilter}
              onFilterRating={handleRatingFilter}
            />
          )}

          {canReview && !showForm && (
            <div className="review-product__cta">
              <p className="review-product__cta-text">Review this product</p>
              <p className="review-product__cta-description">
                Share your thoughts with other customers
              </p>
              <button
                type="button"
                className="review-product__write-button"
                onClick={() => setShowForm(true)}
              >
                Write a customer review
              </button>
            </div>
          )}

          {(showForm || editingReview) && (
            <ReviewForm
              initialValues={
                editingReview
                  ? {
                      rating: editingReview.rating,
                      title: editingReview.title,
                      body: editingReview.body,
                    }
                  : undefined
              }
              onSubmit={editingReview ? handleUpdate : handleCreate}
              onCancel={() => {
                setShowForm(false)
                setEditingReview(null)
              }}
              isLoading={
                editingReview
                  ? updateMutation.isPending
                  : createMutation.isPending
              }
            />
          )}
        </aside>

        <div className="review-product__right">
          <div className="review-product__controls">
            <div className="review-product__filter-chips">
              {ratingFilter && (
                <button
                  type="button"
                  className="review-product__chip review-product__chip--active"
                  onClick={() => handleRatingFilter(undefined)}
                >
                  {ratingFilter} star ✕
                </button>
              )}
            </div>

            <SelectField
              value={sort}
              onChange={(e) => {
                setSort(e.target.value)
                setPage(1)
              }}
              aria-label="Sort reviews"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </SelectField>
          </div>

          {isError && (
            <div className="review-product__state review-product__state--error">
              <p>
                {data
                  ? 'Could not refresh reviews. Showing saved reviews.'
                  : 'Could not load reviews.'}
              </p>
              <RetryButton onClick={() => refetch()} loading={isFetching} />
            </div>
          )}

          {!isLoading && !isError && reviews.length === 0 && (
            <div className="review-product__state">
              {ratingFilter
                ? `No ${ratingFilter}-star reviews yet.`
                : 'No reviews yet. Be the first to review!'}
            </div>
          )}

          <div className="review-product__list">
            {reviews.map((review) => (
              <ReviewCard
                key={review._id}
                review={review}
                currentUserId={user?.id}
                onVote={handleVote}
                onEdit={setEditingReview}
                onDelete={setConfirmDeleteReview}
              />
            ))}
          </div>

          {pagination && (
            <Pagination
              className="review-product__pagination"
              page={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>

      {confirmDeleteReview && (
        <ConfirmDialog
          title="Delete this review?"
          message="You'll have a few seconds to undo this after deleting."
          confirmLabel="Delete"
          onConfirm={() => handleDelete(confirmDeleteReview)}
          onCancel={() => setConfirmDeleteReview(null)}
        />
      )}
    </section>
  )
}
