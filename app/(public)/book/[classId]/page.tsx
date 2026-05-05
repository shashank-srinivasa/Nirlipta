import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import BookingForm from './BookingForm'
import { Clock, Users, Calendar, ChevronLeft, Tag } from 'lucide-react'
import Link from 'next/link'
import { formatPrice, formatTime } from '@/lib/utils'
import type { Metadata } from 'next'

interface Props { params: { classId: string }; searchParams: { date?: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient()
  const { data } = await supabase.from('classes').select('title').eq('id', params.classId).single()
  return { title: data?.title ? `Book · ${data.title}` : 'Book a class' }
}

const categoryColor: Record<string, string> = {
  Hatha: 'bg-forest-700/10 text-forest-700',
  Vinyasa: 'bg-indigo-700/10 text-indigo-700',
  Yin: 'bg-[#4A2060]/10 text-[#4A2060]',
  Meditation: 'bg-marigold-400/10 text-marigold-500',
  Power: 'bg-kumkum-500/10 text-kumkum-500',
  Restorative: 'bg-forest-600/10 text-forest-600',
}

export default async function BookingPage({ params, searchParams }: Props) {
  const supabase = createClient()
  const [{ data: yoga }, { data: settings }] = await Promise.all([
    supabase.from('classes').select('*').eq('id', params.classId).eq('is_active', true).single(),
    supabase.from('studio_settings').select('teacher_name, studio_name, whatsapp_number, payment_mode').single(),
  ])

  if (!yoga) notFound()

  const teacherName = settings?.teacher_name || 'Ashwini Karmbadka'
  const studioName = settings?.studio_name || 'Nirlipta'
  const whatsapp = settings?.whatsapp_number || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919999999999'
  const paymentMode = settings?.payment_mode || 'whatsapp'
  const catClass = categoryColor[yoga.category] || 'bg-parchment-200 text-ink/60'

  return (
    <div className="min-h-screen bg-parchment-100 pt-20">
      <div className="h-1 bg-gradient-to-r from-kumkum-500 via-marigold-400 to-forest-700" />

      <div className="max-w-4xl mx-auto px-6 md:px-10 py-8">
        <Link
          href="/book"
          className="inline-flex items-center gap-1.5 text-sm text-ink/40 hover:text-ink transition-colors mb-8"
        >
          <ChevronLeft size={15} /> Back
        </Link>

        {/* Mobile: compact class summary strip */}
        <div className="lg:hidden bg-white rounded-2xl border border-parchment-300 shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${catClass}`}>
                {yoga.category}
              </span>
              <h1 className="text-sm font-semibold text-ink truncate">{yoga.title}</h1>
            </div>
            <p className="text-base font-display font-bold text-ink shrink-0">{formatPrice(yoga.price)}</p>
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs text-ink/40">
            {yoga.duration_minutes && <span className="flex items-center gap-1"><Clock size={10} /> {yoga.duration_minutes}m</span>}
            {yoga.schedule_day && yoga.schedule_time && (
              <span className="flex items-center gap-1"><Calendar size={10} /> {yoga.schedule_day.split(',')[0].trim()} · {formatTime(yoga.schedule_time)}</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

          {/* Left — class summary card (desktop only) */}
          <div className="hidden lg:block lg:col-span-2">
            <div className="bg-white rounded-2xl border border-parchment-300 shadow-sm p-6 lg:sticky lg:top-24">
              <div className="flex items-center gap-2 mb-4">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${catClass}`}>
                  {yoga.category}
                </span>
                {yoga.level && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-parchment-200 text-ink/50 uppercase tracking-wider">
                    {yoga.level}
                  </span>
                )}
              </div>

              <h1 className="text-2xl font-display font-semibold text-ink mb-2 leading-tight">{yoga.title}</h1>

              {yoga.description && (
                <p className="text-sm text-ink/55 leading-relaxed mb-5">{yoga.description}</p>
              )}

              <div className="space-y-2.5 mb-5">
                <div className="flex items-center gap-2.5 text-sm text-ink/60">
                  <Clock size={14} className="text-marigold-500 shrink-0" />
                  <span>{yoga.duration_minutes} minutes per session</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-ink/60">
                  <Users size={14} className="text-marigold-500 shrink-0" />
                  <span>Max {yoga.max_students} students</span>
                </div>
                {yoga.schedule_day && (
                  <div className="flex items-start gap-2.5 text-sm text-ink/60">
                    <Calendar size={14} className="text-marigold-500 shrink-0 mt-0.5" />
                    <span>
                      {yoga.schedule_day.split(',').map((d: string) => d.trim()).join(', ')}
                      {yoga.schedule_time ? ` · ${formatTime(yoga.schedule_time)}` : ''}
                      {yoga.recurrence && yoga.recurrence !== 'one-time' && (
                        <span className="ml-1 text-ink/35">({yoga.recurrence})</span>
                      )}
                    </span>
                  </div>
                )}
                {yoga.instructor && (
                  <div className="flex items-center gap-2.5 text-sm text-ink/60">
                    <Tag size={14} className="text-marigold-500 shrink-0" />
                    <span>with {yoga.instructor}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-parchment-200 pt-4">
                <p className="text-2xl font-display font-bold text-ink">{formatPrice(yoga.price)}</p>
                <p className="text-xs text-ink/35 mt-0.5">per session · inclusive of all</p>
              </div>
            </div>
          </div>

          {/* Right — booking form */}
          <div className="lg:col-span-3">
            <BookingForm
              yoga={yoga}
              teacherName={teacherName}
              studioName={studioName}
              whatsapp={whatsapp}
              paymentMode={paymentMode}
              initialDate={searchParams.date || ''}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
