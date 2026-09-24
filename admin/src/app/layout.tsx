import type { Metadata } from 'next'
import { Inter, JetBrains_Mono, Orbitron } from 'next/font/google'
import { Providers } from '@/components/providers'
import '@/styles/globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
})

/** Wordmark fallback until the licensed Rocpar face is dropped into /public/fonts. */
const wordmark = Orbitron({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-wordmark',
})

export const metadata: Metadata = {
  title: { default: 'CropVibe Admin', template: '%s · CropVibe Admin' },
  description: 'CropVibe Admin Console — operate the CropVibe agri marketplace.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${mono.variable} ${wordmark.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
