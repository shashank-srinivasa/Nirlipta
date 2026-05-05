import Link from 'next/link'
import { Class } from '@/types'
import ClassCard from '@/components/ui/ClassCard'

interface FeaturedClassesProps { classes: Class[] }

export default function FeaturedClasses({ classes }: FeaturedClassesProps) {
  return (
    <section className="py-16 md:py-28 section-parchment relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-forest-700 via-marigold-400 to-kumkum-500" />

      {/* Faint Indian block-print circles */}
      <div className="hidden md:block absolute right-[-60px] top-10 w-64 h-64 rounded-full border-[40px] border-marigold-400/8 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4">
          <div>
            <p className="text-terracotta-400 text-xs font-medium tracking-[0.2em] uppercase mb-3">The schedule</p>
            <h2 className="text-3xl md:text-5xl font-display font-semibold text-ink tracking-tight leading-tight">
              Classes with<br />
              <span className="italic font-normal">Nirlipta.</span>
            </h2>
          </div>
          <Link href="/classes" className="text-sm font-medium text-terracotta-400 hover:text-terracotta-500 transition-colors self-start md:self-auto">
            Full schedule →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {classes.map(yoga => <ClassCard key={yoga.id} yoga={yoga} />)}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-kumkum-500 via-marigold-400 to-forest-700" />
    </section>
  )
}
