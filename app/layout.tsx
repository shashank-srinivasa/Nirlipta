import type { Metadata } from 'next'
import './globals.css'
import Providers from './Providers'

export const metadata: Metadata = {
  title: {
    default: 'Nirlipta by Ashwini — Yoga, Bengaluru',
    template: '%s | Nirlipta by Ashwini',
  },
  description: 'Nirlipta by Ashwini Karmbadka. Hatha & Vinyasa. Bengaluru and Puttur.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Nirlipta',
  },
  formatDetection: { telephone: false },
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#1C1408' },
    { media: '(prefers-color-scheme: light)', color: '#F5A820' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Kolam — fixed full-screen tiling background */}
        <div
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none select-none z-0"
          style={{
            backgroundImage: 'url(/kolam.svg)',
            backgroundRepeat: 'repeat',
            backgroundSize: '160px 160px',
            opacity: 0.07,
          }}
        />
        <div className="relative z-10">
          {children}
        </div>
        <Providers />
      </body>
    </html>
  )
}
