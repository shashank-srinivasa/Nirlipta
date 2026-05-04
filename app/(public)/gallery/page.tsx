import { createClient } from '@/lib/supabase/server'
import GalleryGrid from './GalleryGrid'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const supabase = createClient()
  const { data } = await supabase.from('studio_settings').select('studio_name').single()
  const name = data?.studio_name || 'Nirlipta'
  return { title: 'Gallery', description: `Photos from ${name} — real classes, real students.` }
}
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
          <GalleryGrid images={images} />
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
