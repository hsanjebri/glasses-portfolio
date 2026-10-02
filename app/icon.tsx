import { ImageResponse } from 'next/og'

export const size = { width: 64, height: 64 }
export const contentType = 'image/png'

/** Favicon: the two-circle mark, white on black. */
export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A0A0A', borderRadius: 14 }}>
        <svg width="50" height="26" viewBox="0 0 40 20" fill="none" stroke="#F2F0EB" strokeWidth="2.6">
          <circle cx="10" cy="10" r="7.2" />
          <circle cx="30" cy="10" r="7.2" />
          <path d="M17.2 9.4q2.8-2.2 5.6 0" />
        </svg>
      </div>
    ),
    size,
  )
}
