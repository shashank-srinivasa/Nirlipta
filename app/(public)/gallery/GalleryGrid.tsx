'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

interface GalleryImage {
  id: string
  image_url: string
  caption: string | null
}

function LazyImage({ img }: { img: GalleryImage }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { rootMargin: '200px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className="break-inside-avoid group relative overflow-hidden rounded-2xl border border-parchment-300"
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}
    >
      <div className="relative aspect-auto">
        {visible && (
          <Image
            src={img.image_url}
            alt={img.caption || 'Yoga studio'}
            width={800}
            height={600}
            className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        {img.caption && visible && (
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
            <p className="text-parchment-100 text-sm font-medium">{img.caption}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function GalleryGrid({ images }: { images: GalleryImage[] }) {
  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
      {images.map(img => <LazyImage key={img.id} img={img} />)}
    </div>
  )
}
