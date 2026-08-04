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
            staleTime: 5 * 60 * 1000,
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
          position="top-right"
          toastOptions={{
            classNames: {
              toast: 'bg-bg-surfaceAlt border border-border-default text-text-primary',
            },
          }}
        />
      </QueryClientProvider>
    </SessionProvider>
  )
}
