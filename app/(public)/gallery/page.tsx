import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Gallery' }
export const revalidate = 3600

const fallbackImages = [
  { id: '1', src: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80', caption: 'Morning Hatha Flow' },
  { id: '2', src: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80', caption: 'Vinyasa Session' },
  { id: '3', src: 'https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=800&q=80', caption: 'Meditation Practice' },
  { id: '4', src: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&q=80', caption: 'Restorative Yoga' },
  { id: '5', src: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=800&q=80', caption: 'Yin Yoga' },
  { id: '6', src: 'https://images.unsplash.com/photo-1588286840104-8957b019727f?w=800&q=80', caption: 'Power Flow' },
  { id: '7', src: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80', caption: 'Studio Space' },
  { id: '8', src: 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=800&q=80', caption: 'Pranayama' },
]

export default async function GalleryPage() {
  const supabase = createClient()
  const { data: images } = await supabase.from('gallery').select('*').order('sort_order')

  const displayImages = images && images.length > 0
    ? images.map((img) => ({ id: img.id, src: img.image_url, caption: img.caption }))
    : fallbackImages

  return (
    <div className="pt-16">
      <div className="section-parchment py-24 px-6 md:px-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-kumkum-500 via-marigold-400 to-forest-700" />
        <div className="max-w-7xl mx-auto">
          <p className="text-terracotta-400 text-xs font-medium tracking-[0.2em] uppercase mb-4">From the studio</p>
          <h1 className="text-5xl md:text-6xl font-display font-semibold text-ink tracking-tight mb-5 leading-tight">Gallery.</h1>
          <p className="text-xl text-ink/50 max-w-xl leading-relaxed">
            Real classes, real students. Nobody is posing perfectly and that is the whole point.
          </p>
        </div>
      </div>

      <div className="section-parchment max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {displayImages.map((img) => (
            <div key={img.id} className="break-inside-avoid group relative overflow-hidden rounded-2xl border border-parchment-300">
              <div className="relative aspect-auto">
                <Image
                  src={img.src}
                  alt={img.caption || 'Yoga studio'}
                  width={800}
                  height={600}
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {img.caption && (
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <p className="text-parchment-100 text-sm font-medium">{img.caption}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
