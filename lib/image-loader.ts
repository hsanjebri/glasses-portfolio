'use client'

/**
 * Sizes images through Unsplash's own CDN (imgix) instead of re-encoding them
 * on our server: every photograph is already hosted there, and Unsplash asks
 * that it be hot-linked. Anything else is served as-is.
 */
export default function imageLoader({ src, width, quality }: { src: string; width: number; quality?: number }): string {
  if (!src.startsWith('https://images.unsplash.com/')) return src
  const url = new URL(src)
  url.searchParams.set('w', String(width))
  url.searchParams.set('q', String(quality ?? 72))
  url.searchParams.set('auto', 'format')
  url.searchParams.set('fit', 'max')
  return url.toString()
}
