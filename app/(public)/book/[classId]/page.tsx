import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import BookingForm from './BookingForm'
import { Clock, Users, Calendar, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { formatPrice, formatTime } from '@/lib/utils'
import type { Metadata } from 'next'

interface Props { params: { classId: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient()
  const { data } = await supabase.from('classes').select('title').eq('id', params.classId).single()
  return { title: data?.title ? `Book · ${data.title}` : 'Book a class' }
}

const categoryGlyph: Record<string, string> = {
  Hatha: '☽', Vinyasa: '◈', Yin: '✦', Meditation: '◎', Power: '⟁', Restorative: '❋',
}

export default async function BookingPage({ params }: Props) {
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

  const glyph = categoryGlyph[yoga.category] || '◎'

  return (
    <div className="min-h-screen bg-ink pt-20">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-kumkum-500 via-marigold-400 to-forest-700" />

      <div className="max-w-5xl mx-auto px-6 md:px-12 py-10">
        <Link href="/classes" className="inline-flex items-center gap-1.5 text-sm text-white/30 hover:text-marigold-300 transition-colors mb-10">
          <ChevronLeft size={15} /> Back to classes
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
          {/* Class info */}
          <div className="lg:col-span-2">
            <div className="bg-white/4 border border-white/8 rounded-3xl p-7 sticky top-28">
              <div className="text-7xl opacity-20 font-display mb-4 leading-none">{glyph}</div>
              <p className="text-xs text-marigold-400/70 font-medium tracking-[0.2em] uppercase mb-1">{yoga.category}</p>
              <h1 className="text-2xl font-display font-semibold text-parchment-100 mb-3 leading-tight">{yoga.title}</h1>
              {yoga.description && (
                <p className="text-sm text-white/40 leading-relaxed mb-6">{yoga.description}</p>
              )}
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-white/40">
                  <Clock size={13} className="text-marigold-400/50" /> {yoga.duration_minutes} minutes
                </div>
                <div className="flex items-center gap-2 text-sm text-white/40">
                  <Users size={13} className="text-marigold-400/50" /> Max {yoga.max_students} students
                </div>
                {yoga.schedule_day && (
                  <div className="flex items-center gap-2 text-sm text-white/40">
                    <Calendar size={13} className="text-marigold-400/50" /> {yoga.schedule_day}s · {formatTime(yoga.schedule_time)}
                  </div>
                )}
              </div>
              <div className="border-t border-white/8 pt-5">
                <p className="text-2xl font-display font-semibold text-marigold-300">{formatPrice(yoga.price)}</p>
                <p className="text-xs text-white/25 mt-0.5">per session</p>
              </div>
            </div>
          </div>

          {/* Chat booking form */}
          <div className="lg:col-span-3">
            <BookingForm
              yoga={yoga}
              teacherName={teacherName}
              studioName={studioName}
              whatsapp={whatsapp}
              paymentMode={paymentMode}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
