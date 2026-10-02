import { ImageResponse } from 'next/og'

import { site } from '@/content/site'
import { loadDisplayFont } from '@/lib/og-font'

export const alt = `${site.brand.name} — ${site.tagline}`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/** The brand word on sand, last syllable italic — generated from site.ts. */
export default async function OpenGraphImage() {
  const [roman, italic] = site.brand.display
  const [regular, oblique] = await Promise.all([loadDisplayFont('normal'), loadDisplayFont('italic')])
  const fonts = [
    ...(regular ? [{ name: 'Display', data: regular, style: 'normal' as const, weight: 400 as const }] : []),
    ...(oblique ? [{ name: 'Display', data: oblique, style: 'italic' as const, weight: 400 as const }] : []),
  ]

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#0A0A0A',
          color: '#F2F0EB',
          padding: '56px 64px',
          fontFamily: 'Display',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 20, letterSpacing: 4, color: '#8C8984' }}>
          <svg width="44" height="22" viewBox="0 0 40 20" fill="none" stroke="#F2F0EB" strokeWidth="2">
            <circle cx="10" cy="10" r="7.5" />
            <circle cx="30" cy="10" r="7.5" />
          </svg>
          {site.address.city.toUpperCase()}
        </div>
        <div style={{ display: 'flex', fontSize: 300, lineHeight: 0.9, letterSpacing: -8 }}>
          <span>{roman}</span>
          <span style={{ fontStyle: 'italic' }}>{italic}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 38, color: '#BDBAB4' }}>
          <span>{site.tagline}</span>
          <span style={{ fontSize: 20, letterSpacing: 4, color: '#8C8984' }}>{site.coordinates}</span>
        </div>
      </div>
    ),
    { ...size, fonts },
  )
}
