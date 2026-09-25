/**
 * Default: normal Next.js server build (NextAuth + middleware).
 * STATIC_DEMO=1: static export for GitHub Pages (see scripts/build-static.mjs).
 */
const staticDemo = process.env.STATIC_DEMO === '1'
const basePath = process.env.BASE_PATH ?? ''

/** @type {import('next').NextConfig} */
const nextConfig = staticDemo
  ? {
      output: 'export',
      basePath,
      trailingSlash: true,
      images: { unoptimized: true },
      env: { NEXT_PUBLIC_STATIC_DEMO: '1', NEXT_PUBLIC_BASE_PATH: basePath },
    }
  : {}

export default nextConfig
