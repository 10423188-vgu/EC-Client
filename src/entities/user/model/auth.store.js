import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: undefined,
  isInitialized: false,

  setUser: (userOrUpdater) =>
    set((state) => ({
      user:
        typeof userOrUpdater === 'function'
          ? userOrUpdater(state.user)
          : userOrUpdater,
      isInitialized: true,
    })),

  clearUser: () => set({ user: null, isInitialized: true }),
}))
