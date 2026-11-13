import { api } from './api.js'

// why: dedupe concurrent 401s — only the first triggers a refresh call, the rest
// queue behind it via failedQueue and retry once it resolves, instead of firing
// N parallel refresh requests
let isRefreshing = false
let failedQueue = []

const processQueue = (error) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve()))
  failedQueue = []
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config

    if (!original) return Promise.reject(error)

    // why: skip refresh for auth routes themselves — a 401 from /auth/login is a real
    // credential failure, and retrying /auth/refresh's own 401 here would loop forever
    const isAuthRoute = original.url?.includes('/auth/')
    if (error.response?.status === 401 && !original._retry && !isAuthRoute) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(() => api(original))
      }

      original._retry = true
      isRefreshing = true

      try {
        await Promise.race([
          api.post('/auth/refresh'),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Refresh timeout')), 10_000),
          ),
        ])

        processQueue(null)
        return api(original)
      } catch (refreshError) {
        processQueue(refreshError)
        // why: consumed by AppInit (app/AppInit.jsx) to clear auth state app-wide
        window.dispatchEvent(new CustomEvent('auth:unauthorized'))
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)
