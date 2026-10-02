import type { NextConfig } from 'next'

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
}

export default nextConfig
