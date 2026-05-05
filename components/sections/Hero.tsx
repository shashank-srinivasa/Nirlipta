'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

export default function Hero({
  studioName = 'Nirlipta',
  tagline,
  teacherName,
}: {
  studioName?: string
  tagline?: string | null
  teacherName?: string | null
}) {
  const CHARS = studioName.toUpperCase().split('')
  const [revealed, setRevealed] = useState(false)
  const glowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 100)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const el = glowRef.current
    if (!el) return
    let raf: number
    let tx = window.innerWidth / 2
    let ty = window.innerHeight / 2
    let cx = tx
    let cy = ty

    const onMove = (e: MouseEvent) => { tx = e.clientX; ty = e.clientY }
    window.addEventListener('mousemove', onMove)

    const tick = () => {
      cx += (tx - cx) * 0.06
      cy += (ty - cy) * 0.06
      el.style.background = `radial-gradient(600px circle at ${cx}px ${cy}px, rgba(196,101,8,0.22) 0%, transparent 70%)`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  const teacher = teacherName || 'Ashwini Karmbadka'
  const fadeIn = (delay: number) => ({
    opacity: revealed ? 1 : 0,
    transition: 'opacity 0.9s ease',
    transitionDelay: `${delay}ms`,
  })

  return (
    <section className="relative min-h-screen bg-ink flex flex-col justify-center overflow-hidden px-6 md:px-12">

      {/* Cursor glow */}
      <div ref={glowRef} className="pointer-events-none fixed inset-0 z-0 transition-none" />

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center">

        {/* Teacher name + studio name grouped so label sits above the N */}
        <div className="inline-flex flex-col items-start">
          <p
            className="text-[9px] md:text-xs font-bold tracking-[0.12em] md:tracking-[0.22em] uppercase text-white/40 select-none leading-none"
            style={fadeIn(0)}
          >
            {teacher}&rsquo;s
          </p>
          <h1
            className="font-display font-bold leading-none tracking-[-0.04em] select-none"
            style={{ fontSize: 'clamp(2.8rem, 16vw, 18vw)' }}
            aria-label={studioName}
          >
            {CHARS.map((ch, i) => (
              <span
                key={i}
                className="inline-block"
                style={{
                  color: i === 0 ? '#F5A820' : 'rgba(250,246,236,0.92)',
                  opacity: revealed ? 1 : 0,
                  transform: revealed ? 'translateY(0)' : 'translateY(60px)',
                  transition: `opacity 0.6s ease, transform 0.7s cubic-bezier(0.16,1,0.3,1)`,
                  transitionDelay: `${i * 60}ms`,
                }}
              >
                {ch}
              </span>
            ))}
          </h1>
        </div>

        {/* Three practice words */}
        <div
          className="mt-6 flex items-center gap-8 select-none"
          style={fadeIn(600)}
        >
          {['Hatha', 'Vinyasa', 'Pranayama'].map((word) => (
            <span key={word} className="text-white/45 text-sm md:text-base font-display tracking-wide">{word}</span>
          ))}
        </div>

        {/* CTA bubbles */}
        <div className="mt-10 flex items-center gap-4" style={fadeIn(800)}>
          <Link
            href="/book"
            className="px-6 py-2.5 rounded-full bg-marigold-400 text-ink text-sm font-semibold tracking-wide hover:bg-marigold-300 transition-colors duration-300"
          >
            Book a class
          </Link>
          <Link
            href="/classes"
            className="px-6 py-2.5 rounded-full border border-white/20 text-white/60 text-sm font-medium tracking-wide hover:border-white/40 hover:text-white/90 transition-colors duration-300"
          >
            See schedule
          </Link>
        </div>

      </div>

      {/* Bottom accent stripe */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-kumkum-500 via-marigold-400 to-forest-700" />
    </section>
  )
}
