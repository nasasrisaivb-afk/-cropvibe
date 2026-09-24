'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from 'next-auth/react'
import { useState } from 'react'
import { Toaster } from 'sonner'

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Mock API is instant and shared across pages: always revalidate on mount so a change
            // made on one screen is reflected on every other (cached data shows while refetching).
            staleTime: 0,
            gcTime: 10 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
          mutations: { retry: 1 },
        },
      })
  )

  return (
    <SessionProvider>
      <QueryClientProvider client={client}>
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          closeButton
          toastOptions={{
            classNames: {
              toast: '!bg-bg-surfaceAlt !border !border-border-strong !text-text-primary',
              description: '!text-text-secondary',
            },
          }}
        />
      </QueryClientProvider>
    </SessionProvider>
  )
}
