import { Suspense } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'
import AppInit from './AppInit.jsx'
import { Router } from './Router'
import { queryClient } from '../shared/api/query-client'
export function Providers() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInit />
      <Suspense fallback={<div role="status">Loading...</div>}>
        <RouterProvider router={Router} />
      </Suspense>
      <Toaster
        position="top-right"
        richColors
        style={{ zIndex: 'var(--z-toast)' }}
      />
    </QueryClientProvider>
  )
}
