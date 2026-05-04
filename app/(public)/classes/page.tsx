import { createClient } from '@/lib/supabase/server'
import ClassCard from '@/components/ui/ClassCard'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Classes' }
export const revalidate = 3600

export default async function ClassesPage() {
  const supabase = createClient()
  const [{ data: classes }, { data: settings }] = await Promise.all([
    supabase.from('classes').select('*').eq('is_active', true).order('category'),
    supabase.from('studio_settings').select('classes_page_subtitle').single(),
  ])

  const subtitle = settings?.classes_page_subtitle ||
    'Hatha on the slower days. Vinyasa when you need to move something. Pick what your body is asking for.'

  return (
    <div className="pt-16">
      <div className="section-parchment py-24 px-6 md:px-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-kumkum-500 via-marigold-400 to-forest-700" />
        <div className="max-w-7xl mx-auto">
          <p className="text-terracotta-400 text-xs font-medium tracking-[0.2em] uppercase mb-4">The schedule</p>
          <h1 className="text-5xl md:text-6xl font-display font-semibold text-ink tracking-tight mb-5 leading-tight">
            All classes.
          </h1>
          <p className="text-xl text-ink/50 max-w-xl leading-relaxed">{subtitle}</p>
        </div>
      </div>

      <div className="section-parchment max-w-7xl mx-auto px-6 md:px-12 py-16">
        {classes && classes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((yoga) => (
              <ClassCard key={yoga.id} yoga={yoga} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <p className="text-ink/30 text-lg font-display">No classes available at the moment.</p>
            <p className="text-ink/25 text-sm mt-2">Check back soon.</p>
          </div>
        )}
      </div>
    </div>
  )
}
