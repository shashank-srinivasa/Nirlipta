import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Nirlipta by Ashwini',
    short_name: 'Nirlipta',
    description: 'Book yoga classes with Ashwini Karmbadka. Hatha, Vinyasa & more in Bengaluru.',
    start_url: '/',
    display: 'standalone',
    background_color: '#1C1408',
    theme_color: '#F5A820',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    screenshots: [
      {
        src: '/',
        sizes: '390x844',
        type: 'image/png',
        // @ts-expect-error — form_factor is valid but not yet in Next.js types
        form_factor: 'narrow',
        label: 'Home',
      },
    ],
  }
}
