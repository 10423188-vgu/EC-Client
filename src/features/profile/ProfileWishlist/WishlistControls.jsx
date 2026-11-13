import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  useWishlistPreferences,
  wishlistService,
  WISHLIST_KEYS,
} from '../../../entities/wishlist'
import {
  Checkbox,
  CreateButton,
  PanelButton,
  RetryButton,
} from '../../../shared/components'
import { useAuthStore } from '../../../entities/user'
import WishlistControlsSkeleton from './WishlistControlsSkeleton'
import './WishlistControls.css'

export default function WishlistControls() {
  const queryClient = useQueryClient()
  const preferences = useWishlistPreferences()
  const userId = useAuthStore((state) => state.user?.id)
  const mutation = useMutation({
    mutationFn: ({ action, value }) => {
      if (action === 'enable') return wishlistService.enableSharing()
      if (action === 'disable') return wishlistService.disableSharing()
      return wishlistService.updatePreferences(value)
    },
    onSuccess: (response, { userId: ownerId }) =>
      queryClient.setQueryData(
        WISHLIST_KEYS.preferences(ownerId),
        response.data.data,
      ),
    onError: () =>
      toast.error('Could not update wishlist settings. Please try again.'),
  })
  const updateSettings = (action, value) =>
    mutation.mutate({ action, value, userId })
  if (preferences.isLoading) return <WishlistControlsSkeleton />
  const token = preferences.data?.shareToken
  const url = token ? `${window.location.origin}/wishlist/shared/${token}` : ''
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Wishlist link copied')
    } catch {
      toast.error('Could not copy. Select and copy the link below.')
    }
  }
  return (
    <header className="wishlist-controls" aria-busy={mutation.isPending}>
      <div>
        <h2 className="wishlist-controls__title">Your wishlist</h2>
        <p className="wishlist-controls__description">
          {token
            ? 'Anyone with this link can view the saved products.'
            : 'Your wishlist is private. Create a link to share the products.'}
        </p>
        {preferences.isError && (
          <RetryButton
            label="Retry settings"
            onClick={() => preferences.refetch()}
            loading={preferences.isFetching}
          />
        )}
        {(!preferences.isError || preferences.data) && (
          <label className="wishlist-controls__alerts">
            <Checkbox
              checked={preferences.data?.saleAlerts ?? false}
              onChange={(event) =>
                updateSettings('alerts', event.target.checked)
              }
              disabled={!preferences.data || mutation.isPending}
            />
            Notify me when saved products drop in price
          </label>
        )}
      </div>

      <div className="wishlist-controls__sharing">
        {token ? (
          <>
            <input
              value={url}
              className="wishlist-controls__share-link"
              readOnly
              aria-label="Shared wishlist link"
            />
            <div className="wishlist-controls__share-actions">
              <PanelButton label="Copy link" onClick={copyLink} />
              <PanelButton
                variant="cancel"
                label="Stop sharing"
                onClick={() => updateSettings('disable')}
                loading={
                  mutation.isPending && mutation.variables?.action === 'disable'
                }
                disabled={mutation.isPending}
              />
            </div>
          </>
        ) : (
          <CreateButton
            onClick={() => updateSettings('enable')}
            disabled={!preferences.data || mutation.isPending}
          >
            {mutation.isPending && mutation.variables?.action === 'enable'
              ? 'Creating link…'
              : 'Create share link'}
          </CreateButton>
        )}
      </div>
    </header>
  )
}
