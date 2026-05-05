'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Clock, Users, Calendar, ChevronRight } from 'lucide-react'
import { Class } from '@/types'
import { formatPrice, formatTime } from '@/lib/utils'

const DAY_MAP: Record<number, string> = {
  0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday',
  4: 'thursday', 5: 'friday', 6: 'saturday',
}

const categoryTheme: Record<string, { bg: string; accent: string; glyph: string }> = {
  Hatha:       { bg: 'bg-forest-700',  accent: 'text-marigold-300',  glyph: '☽' },
  Vinyasa:     { bg: 'bg-indigo-700',  accent: 'text-[#93A8E8]',     glyph: '◈' },
  Yin:         { bg: 'bg-[#4A2060]',   accent: 'text-[#D4A8F0]',     glyph: '✦' },
  Meditation:  { bg: 'bg-[#5C2D0A]',  accent: 'text-parchment-200', glyph: '◎' },
  Power:       { bg: 'bg-kumkum-600',  accent: 'text-marigold-300',  glyph: '⟁' },
  Restorative: { bg: 'bg-[#2D4A3E]',  accent: 'text-[#88C8A0]',     glyph: '❋' },
}

function toLocalDateStr(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function BookPage() {
  const [allClasses, setAllClasses] = useState<Class[]>([])
  const [date, setDate] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setDate(toLocalDateStr(new Date()))
    fetch('/api/classes')
      .then(r => r.json())
      .then(data => { setAllClasses(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const matchingClasses = date
    ? allClasses.filter(c => {
        if (!c.schedule_day) return true // flexible — show always
        const dayName = DAY_MAP[new Date(date + 'T00:00:00').getDay()]
        return c.schedule_day.split(',').map(d => d.trim().toLowerCase()).includes(dayName)
      })
    : []

  const tomorrow = toLocalDateStr(new Date(Date.now() + 86400000))

  return (
    <div className="min-h-screen bg-ink pt-20">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-kumkum-500 via-marigold-400 to-forest-700" />

      <div className="max-w-2xl mx-auto px-6 py-14">
        <p className="text-marigold-400/70 text-xs font-medium tracking-[0.2em] uppercase mb-3">Book a class</p>
        <h1 className="text-4xl font-display font-semibold text-parchment-100 mb-10 leading-tight">
          When would you like to come in?
        </h1>

        {/* Date picker */}
        <div className="mb-10">
          <label className="block text-sm font-medium text-white/50 mb-2">Select a date</label>
          <input
            type="date"
            value={date}
            min={tomorrow}
            onChange={e => setDate(e.target.value)}
            className="w-full bg-white/6 border border-white/10 rounded-xl px-4 py-3 text-parchment-100 text-sm focus:outline-none focus:ring-2 focus:ring-marigold-400/40 focus:border-marigold-400/50 transition"
          />
        </div>

        {/* Results */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map(i => <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" />)}
          </div>
        ) : !date ? null : matchingClasses.length === 0 ? (
          <div className="text-center py-16 border border-white/8 rounded-2xl">
            <p className="text-3xl mb-4 opacity-30">🧘</p>
            <p className="text-parchment-100/60 font-medium mb-1">No classes on this day</p>
            <p className="text-white/30 text-sm">Try a different date or <Link href="/classes" className="text-marigold-400 hover:underline">browse all classes</Link>.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-white/30 mb-4">{matchingClasses.length} class{matchingClasses.length !== 1 ? 'es' : ''} available</p>
            {matchingClasses.map(yoga => {
              const theme = categoryTheme[yoga.category] || categoryTheme.Hatha
              return (
                <Link
                  key={yoga.id}
                  href={`/book/${yoga.id}?date=${date}`}
                  className="group block"
                >
                  <div className={`relative ${theme.bg} border border-white/8 rounded-2xl p-5 hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200`}>
                    <div className="absolute top-4 right-4 text-5xl opacity-[0.07] font-display leading-none pointer-events-none select-none">
                      {theme.glyph}
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-white/30 uppercase tracking-[0.18em] mb-0.5">{yoga.category}</p>
                        <h3 className="text-lg font-display font-semibold text-parchment-100 mb-2 leading-tight">{yoga.title}</h3>
                        <div className="flex flex-wrap gap-3">
                          <span className="flex items-center gap-1.5 text-xs text-white/35">
                            <Clock size={11} /> {yoga.duration_minutes}m
                          </span>
                          <span className="flex items-center gap-1.5 text-xs text-white/35">
                            <Users size={11} /> Max {yoga.max_students}
                          </span>
                          {yoga.schedule_time && (
                            <span className="flex items-center gap-1.5 text-xs text-white/35">
                              <Calendar size={11} /> {formatTime(yoga.schedule_time)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className={`text-lg font-display font-semibold ${theme.accent}`}>{formatPrice(yoga.price)}</span>
                        <span className="flex items-center gap-1 text-xs bg-white/10 group-hover:bg-marigold-400 group-hover:text-ink text-white/60 px-3 py-1.5 rounded-full font-medium transition-colors">
                          Book <ChevronRight size={12} />
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
