import { ImageResponse } from 'next/og'

export const size = { width: 512, height: 512 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
          background: '#1C1408',
          borderRadius: 112,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 360,
            height: 360,
            borderRadius: '50%',
            background: 'rgba(245,168,32,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontFamily: 'serif',
              fontSize: 280,
              fontWeight: 700,
              color: '#F5A820',
              lineHeight: 1,
              marginTop: 20,
            }}
          >
            N
          </span>
        </div>
      </div>
    ),
    { ...size }
  )
}
