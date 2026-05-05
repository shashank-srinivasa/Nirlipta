import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: '#1C1408',
          borderRadius: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontFamily: 'serif',
            fontSize: 110,
            fontWeight: 700,
            color: '#F5A820',
            lineHeight: 1,
            marginTop: 8,
          }}
        >
          N
        </span>
      </div>
    ),
    { ...size }
  )
}
