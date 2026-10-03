import type { NextConfig } from 'next'

/** Sent with every response. A CSP is left out: it would need nonces for Next's inline scripts. */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
]

/** The clip and the logos change rarely; a week of caching, revalidated in the background. */
const mediaCache = [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' }]

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    loader: 'custom',
    loaderFile: './lib/image-loader.ts',
    qualities: [60, 72, 85],
  },
  experimental: {
    optimizePackageImports: ['motion', 'gsap'],
    // Tailwind keeps the stylesheet small; inlining it removes the render-blocking request.
    inlineCss: true,
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      { source: '/video/:file*', headers: mediaCache },
      { source: '/brands/:file*', headers: mediaCache },
    ]
  },
}

export default nextConfig
