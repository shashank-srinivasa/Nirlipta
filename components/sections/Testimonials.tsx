import { createClient } from '@/lib/supabase/server'

export default async function Testimonials() {
  const supabase = createClient()
  const { data: testimonials } = await supabase
    .from('testimonials')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

  if (!testimonials || testimonials.length === 0) return null

  return (
    <section className="py-16 md:py-28 section-parchment relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-kumkum-500 via-marigold-400 to-forest-700" />

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="mb-14">
          <p className="text-terracotta-400 text-xs font-medium tracking-[0.2em] uppercase mb-3">From students</p>
          <h2 className="text-3xl md:text-5xl font-display font-semibold text-ink tracking-tight leading-tight">
            In their words.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {testimonials.map(t => (
            <div key={t.id} className={`rounded-2xl p-6 md:p-8 flex flex-col justify-between ${t.bg_color}`}>
              <div>
                <span className="font-display text-5xl leading-none block mb-2 text-parchment-200 opacity-30">&ldquo;</span>
                <blockquote className="leading-[1.7] text-[0.92rem] mb-8 text-parchment-200">
                  {t.text}
                </blockquote>
              </div>
              <div className="border-t border-white/10 pt-5">
                <p className="font-semibold text-sm text-parchment-200">{t.name}</p>
                <p className="text-xs mt-0.5 text-parchment-300/50">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-forest-700 via-marigold-400 to-kumkum-500" />
    </section>
  )
}
