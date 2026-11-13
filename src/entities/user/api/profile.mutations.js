import { userService } from './user.service'

export const updateProfileMutation = {
  mutationFn: userService.updateProfile,
}

export const updateAvatarMutation = {
  mutationFn: (url) => userService.updateAvatar({ url }),
}

export const updateBannerMutation = {
  mutationFn: (url) => userService.updateBanner({ url }),
}
