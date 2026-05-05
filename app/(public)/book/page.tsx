'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Clock, Users, Calendar, ArrowRight, Search } from 'lucide-react'
import { Class } from '@/types'
import { formatPrice, formatTime } from '@/lib/utils'

const DAY_MAP: Record<number, string> = {
  0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday',
  4: 'thursday', 5: 'friday', 6: 'saturday',
}

const categoryColor: Record<string, string> = {
  Hatha: 'bg-forest-700/10 text-forest-700',
  Vinyasa: 'bg-indigo-700/10 text-indigo-700',
  Yin: 'bg-[#4A2060]/10 text-[#4A2060]',
  Meditation: 'bg-marigold-400/10 text-marigold-500',
  Power: 'bg-kumkum-500/10 text-kumkum-500',
  Restorative: 'bg-forest-600/10 text-forest-600',
}

function toLocalDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatDisplayDate(dateStr: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })
}

export default function BookPage() {
  const [allClasses, setAllClasses] = useState<Class[]>([])
  const [date, setDate] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setDate(toLocalDateStr(new Date(Date.now() + 86400000)))
    fetch('/api/classes')
      .then(r => r.json())
      .then(data => { setAllClasses(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const matchingClasses = date
    ? allClasses.filter(c => {
        if (!c.schedule_day) return true
        const dayName = DAY_MAP[new Date(date + 'T00:00:00').getDay()]
        return c.schedule_day.split(',').map(d => d.trim().toLowerCase()).includes(dayName)
      })
    : []

  const tomorrow = toLocalDateStr(new Date(Date.now() + 86400000))

  return (
    <div className="min-h-screen bg-parchment-100 pt-20">
      {/* Top accent bar */}
      <div className="h-1 bg-gradient-to-r from-kumkum-500 via-marigold-400 to-forest-700" />

      {/* Hero strip */}
      <div className="bg-ink px-6 py-12 md:py-16">
        <div className="max-w-2xl mx-auto">
          <p className="text-marigold-400 text-xs font-medium tracking-[0.2em] uppercase mb-3">Book a class</p>
          <h1 className="text-3xl md:text-4xl font-display font-semibold text-parchment-100 leading-tight">
            When would you like to come in?
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Date picker card */}
        <div className="bg-white rounded-2xl border border-parchment-300 shadow-sm p-6 mb-8">
          <label className="block text-sm font-semibold text-ink mb-1">Choose a date</label>
          <p className="text-sm text-ink/40 mb-4">We&apos;ll show available classes for that day.</p>
          <input
            type="date"
            value={date}
            min={tomorrow}
            onChange={e => setDate(e.target.value)}
            className="w-full border border-parchment-300 rounded-xl px-4 py-3 text-ink text-sm focus:outline-none focus:ring-2 focus:ring-marigold-400/40 focus:border-marigold-400 transition bg-parchment-50"
          />
          {date && (
            <p className="text-xs text-ink/40 mt-2 flex items-center gap-1.5">
              <Calendar size={11} /> {formatDisplayDate(date)}
            </p>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 rounded-2xl bg-parchment-200 animate-pulse" />
            ))}
          </div>
        ) : !date ? null : matchingClasses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-parchment-300 p-10 text-center">
            <div className="w-14 h-14 rounded-full bg-parchment-200 flex items-center justify-center mx-auto mb-4">
              <Search size={22} className="text-ink/25" />
            </div>
            <p className="font-semibold text-ink mb-1">No classes on this day</p>
            <p className="text-sm text-ink/50 mb-5">Try a different date, or browse everything we offer.</p>
            <Link href="/classes" className="inline-flex items-center gap-2 text-sm font-medium text-marigold-500 hover:text-marigold-600 transition-colors">
              Browse all classes <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs font-medium text-ink/40 uppercase tracking-wider mb-4">
              {matchingClasses.length} class{matchingClasses.length !== 1 ? 'es' : ''} available
            </p>
            {matchingClasses.map(yoga => {
              const catClass = categoryColor[yoga.category] || 'bg-parchment-200 text-ink/60'
              return (
                <Link key={yoga.id} href={`/book/${yoga.id}?date=${date}`} className="group block">
                  <div className="bg-white border border-parchment-300 rounded-2xl p-5 hover:border-marigold-400 hover:shadow-md transition-all duration-200">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${catClass}`}>
                            {yoga.category}
                          </span>
                          {yoga.schedule_time && (
                            <span className="text-xs text-ink/40 flex items-center gap-1">
                              <Clock size={10} /> {formatTime(yoga.schedule_time)}
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-semibold text-ink mb-1 leading-snug group-hover:text-marigold-500 transition-colors">
                          {yoga.title}
                        </h3>
                        {yoga.description && (
                          <p className="text-xs text-ink/45 line-clamp-1 mb-2">{yoga.description}</p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-ink/40">
                          <span className="flex items-center gap-1"><Clock size={10} /> {yoga.duration_minutes} min</span>
                          <span className="flex items-center gap-1"><Users size={10} /> {yoga.max_students} spots</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3 shrink-0">
                        <span className="text-xl font-display font-semibold text-ink">{formatPrice(yoga.price)}</span>
                        <span className="flex items-center gap-1.5 text-xs bg-ink text-parchment-100 group-hover:bg-marigold-400 group-hover:text-ink px-3 py-1.5 rounded-full font-medium transition-colors whitespace-nowrap">
                          Book <ArrowRight size={11} />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
