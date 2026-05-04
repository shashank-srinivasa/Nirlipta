import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Gallery' }
export const revalidate = 3600

export default async function GalleryPage() {
  const supabase = createClient()
  const { data: images } = await supabase.from('gallery').select('*').order('sort_order')

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
        {images && images.length > 0 ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {images.map((img) => (
              <div key={img.id} className="break-inside-avoid group relative overflow-hidden rounded-2xl border border-parchment-300">
                <div className="relative aspect-auto">
                  <Image
                    src={img.image_url}
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
        ) : (
          <div className="py-32 text-center text-ink/30">
            <p className="text-lg">No photos yet.</p>
            <p className="text-sm mt-2">Photos uploaded from the admin panel will appear here.</p>
          </div>
        )}
      </div>
    </div>
  )
}
