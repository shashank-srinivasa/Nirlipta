import Link from 'next/link'
import { Clock, Users, Calendar } from 'lucide-react'
import { Class } from '@/types'
import { formatPrice, getLevelBadge } from '@/lib/utils'

interface ClassCardProps { yoga: Class }

const categoryTheme: Record<string, { bg: string; label: string; accent: string; glyph: string }> = {
  Hatha:       { bg: 'bg-forest-700',   label: 'bg-white/10 text-parchment-200', accent: 'text-marigold-300',   glyph: '☽' },
  Vinyasa:     { bg: 'bg-indigo-700',   label: 'bg-white/10 text-parchment-200', accent: 'text-[#93A8E8]',      glyph: '◈' },
  Yin:         { bg: 'bg-[#4A2060]',    label: 'bg-white/10 text-parchment-200', accent: 'text-[#D4A8F0]',      glyph: '✦' },
  Meditation:  { bg: 'bg-[#5C2D0A]',   label: 'bg-white/10 text-parchment-200', accent: 'text-parchment-200',  glyph: '◎' },
  Power:       { bg: 'bg-kumkum-600',   label: 'bg-white/10 text-parchment-200', accent: 'text-marigold-300',   glyph: '⟁' },
  Restorative: { bg: 'bg-[#2D4A3E]',   label: 'bg-white/10 text-parchment-200', accent: 'text-[#88C8A0]',      glyph: '❋' },
}

export default function ClassCard({ yoga }: ClassCardProps) {
  const theme = categoryTheme[yoga.category] || categoryTheme.Hatha

  return (
    <Link href={`/book/${yoga.id}`} className="group block">
      <div className={`relative rounded-2xl overflow-hidden transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-2xl ${theme.bg} border border-white/5`}>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        {/* Background glyph */}
        <div className="absolute top-5 right-5 text-7xl opacity-[0.06] font-display leading-none pointer-events-none select-none">
          {theme.glyph}
        </div>

        <div className="p-6">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/30">{yoga.category}</span>
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${getLevelBadge(yoga.level)}`}>
                {yoga.level}
              </span>
            </div>
            <h3 className="text-xl font-display font-semibold text-parchment-100 leading-tight group-hover:text-white transition-colors">
              {yoga.title}
            </h3>
          </div>

          {yoga.description && (
            <p className="text-sm text-white/45 line-clamp-2 leading-relaxed mb-5">{yoga.description}</p>
          )}

          <div className="flex flex-wrap gap-3 mb-5">
            <span className="flex items-center gap-1.5 text-xs text-white/30"><Clock size={11} /> {yoga.duration_minutes}m</span>
            <span className="flex items-center gap-1.5 text-xs text-white/30"><Users size={11} /> {yoga.max_students} max</span>
            {yoga.schedule_day && (
              <span className="flex items-center gap-1.5 text-xs text-white/30"><Calendar size={11} /> {yoga.schedule_day}s · {yoga.schedule_time}</span>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <span className={`text-lg font-display font-semibold ${theme.accent}`}>{formatPrice(yoga.price)}</span>
            <span className="text-xs bg-white/10 text-white/60 group-hover:bg-marigold-400 group-hover:text-ink transition-all px-3 py-1.5 rounded-full font-medium tracking-wide">
              Book →
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
