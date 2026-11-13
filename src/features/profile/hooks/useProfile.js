import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  updateProfileMutation,
  resendVerificationMutation,
  updateAvatarMutation,
  updateBannerMutation,
  addressService,
  userService,
  USER_KEYS,
} from '../../../entities/user/api'
import { useAuthStore } from '../../../entities/user/model'

export function useProfile() {
  const setUser = useAuthStore((s) => s.setUser)
  const queryClient = useQueryClient()

  // why: useCurrentUser() re-mounts on other pages (e.g. checkout) and hydrates the store from
  // its own React Query cache — updating only Zustand here left that cache stale, so navigating
  // within staleTime silently reverted the edit just made. Same updater drives both.
  const syncUser = (updater) => {
    setUser(updater)
    queryClient.setQueryData(USER_KEYS.current, updater)
  }

  const updateInfo = useMutation({
    ...updateProfileMutation,
    onSuccess: (res) => {
      const updated = res.data.data
      syncUser((prev) => ({ ...prev, ...updated }))
    },
    onError: () => toast.error('Failed to update profile. Please try again.'),
  })

  const requestEmailChange = useMutation({
    mutationFn: userService.requestEmailChange,
    onSuccess: (res) => {
      const result = res.data.data
      syncUser((prev) => ({ ...prev, pendingEmail: result.pendingEmail }))
      if (result.verificationEmailSent) {
        toast.success(`Verification link sent to ${result.pendingEmail}.`)
      } else {
        toast.warning(
          'Email saved, but the verification message could not be sent. Try again later.',
        )
      }
    },
    onError: (err) =>
      toast.error(
        err.response?.data?.message ?? 'Could not update your email address.',
      ),
  })

  const cancelEmailChange = useMutation({
    mutationFn: userService.cancelEmailChange,
    onSuccess: (res) => {
      const result = res.data.data
      syncUser((prev) => ({ ...prev, pendingEmail: null }))
      if (result.emailVerified) {
        toast.success('Canceled the email change. Your current email is kept.')
      } else if (result.verificationEmailSent) {
        toast.success(`Verification link sent to ${result.currentEmail}.`)
      } else {
        toast.warning(
          'Your current email is kept, but the verification email could not be sent. Try again later.',
        )
      }
    },
    onError: (err) =>
      toast.error(
        err.response?.data?.message ?? 'Could not cancel the email change.',
      ),
  })

  const resendVerification = useMutation({
    ...resendVerificationMutation,
    onSuccess: () => toast.success('Verification email sent.'),
    onError: (err) =>
      toast.error(
        err.response?.data?.message ?? 'Could not send the verification email.',
      ),
  })

  const updateReviewProfile = useMutation({
    mutationFn: userService.updateReviewProfile,
    onSuccess: (res) => {
      const updated = res.data.data
      syncUser((prev) => ({ ...prev, ...updated }))
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
    },
    onError: () =>
      toast.error('Failed to update public review profile. Please try again.'),
  })

  const createAddress = useMutation({
    mutationFn: (data) => addressService.createAddress(data),
    onSuccess: (res) => {
      const created = res.data.data
      syncUser((prev) => ({
        ...prev,
        addresses: [...(prev.addresses ?? []), created],
      }))
    },
    onError: (err) =>
      toast.error(
        err.response?.data?.message ??
          'Failed to add address. Please try again.',
      ),
  })

  const editAddress = useMutation({
    mutationFn: ({ id, ...data }) => addressService.updateAddress(id, data),
    onSuccess: (res) => {
      const updated = res.data.data
      syncUser((prev) => ({
        ...prev,
        addresses: (prev.addresses ?? []).map((a) =>
          a.id === updated.id ? updated : a,
        ),
      }))
    },
    onError: () => toast.error('Failed to update address. Please try again.'),
  })

  // why: no default onError here (unlike the other mutations above) — its one caller
  // (AddressBookModal) always passes its own call-time onError to drive undo/restore
  // state, so a hook-level toast would just duplicate that one
  const deleteAddress = useMutation({
    mutationFn: (id) => addressService.deleteAddress(id),
    onSuccess: (res, id) => {
      const { promoted } = res.data.data
      syncUser((prev) => ({
        ...prev,
        addresses: (prev.addresses ?? [])
          .filter((a) => a.id !== id)
          .map((a) => (promoted && a.id === promoted.id ? promoted : a)),
      }))
    },
  })

  const setDefaultAddress = useMutation({
    mutationFn: (id) => addressService.setDefaultAddress(id),
    onSuccess: (res) => {
      const updated = res.data.data
      syncUser((prev) => ({
        ...prev,
        addresses: (prev.addresses ?? []).map((a) => ({
          ...a,
          isDefault: a.id === updated.id,
        })),
      }))
    },
    onError: () =>
      toast.error('Failed to set default address. Please try again.'),
  })

  const setFrame = useMutation({
    mutationFn: (frame) => userService.setFrame(frame),
    onSuccess: (res) => {
      const updated = res.data.data
      syncUser((prev) => ({ ...prev, ...updated }))
    },
    onError: () =>
      toast.error('Failed to update avatar frame. Please try again.'),
  })

  const useImageUpload = (mutationConfig, field) =>
    useMutation({
      ...mutationConfig,
      onSuccess: (res) => {
        syncUser((prev) => ({ ...prev, [field]: res.data.data[field] }))
      },
      onError: () =>
        toast.error(`Failed to upload ${field}. Please try again.`),
    })

  const uploadAvatar = useImageUpload(updateAvatarMutation, 'avatar')
  const uploadBanner = useImageUpload(updateBannerMutation, 'banner')

  return {
    updateInfo,
    requestEmailChange,
    cancelEmailChange,
    resendVerification,
    updateReviewProfile,
    createAddress,
    editAddress,
    deleteAddress,
    setDefaultAddress,
    setFrame,
    uploadAvatar,
    uploadBanner,
  }
}
