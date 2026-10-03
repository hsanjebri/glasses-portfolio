/**
 * Pings Unsplash's download endpoint for every photograph in content/photos.ts,
 * as the Unsplash API guidelines ask when a photo is used. Run it once after
 * changing the photo selection:  npm run photos
 * Needs UNSPLASH_ACCESS_KEY in .env.local.
 */
import { readFileSync } from 'node:fs'

const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
const key = env.match(/^UNSPLASH_ACCESS_KEY=(.+)$/m)?.[1]?.trim()
if (!key) {
  console.error('UNSPLASH_ACCESS_KEY is missing from .env.local')
  process.exit(1)
}

const source = readFileSync(new URL('../content/photos.ts', import.meta.url), 'utf8')
const endpoints = [...source.matchAll(/download: '([^']+)'/g)].map((m) => m[1])

let ok = 0
for (const [i, url] of endpoints.entries()) {
  const res = await fetch(url, { headers: { Authorization: `Client-ID ${key}` } })
  if (res.ok) ok++
  else console.warn(res.status, url)
  const last = i === endpoints.length - 1
  if (!last && res.headers.get('x-ratelimit-remaining') === '0') {
    console.warn('Rate limit reached — run again in an hour to finish.')
    break
  }
}
console.log(`${ok}/${endpoints.length} downloads registered with Unsplash.`)
