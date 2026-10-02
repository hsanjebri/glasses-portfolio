import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

/** Home-screen icon: the two-circle mark, white on black. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A0A0A' }}>
        <svg width="120" height="60" viewBox="0 0 40 20" fill="none" stroke="#F2F0EB" strokeWidth="1.8">
          <circle cx="10" cy="10" r="7.5" />
          <circle cx="30" cy="10" r="7.5" />
          <path d="M17.5 9.5q2.5-2 5 0" />
        </svg>
      </div>
    ),
    size,
  )
}
