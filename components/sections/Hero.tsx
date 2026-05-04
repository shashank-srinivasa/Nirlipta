'use client'

import { useEffect, useRef, useState } from 'react'

export default function Hero({ studioName = 'Nirlipta', tagline }: { studioName?: string; tagline?: string | null }) {
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

  return (
    <section className="relative min-h-screen bg-ink flex flex-col justify-center overflow-hidden px-6 md:px-12">

      {/* Cursor glow */}
      <div ref={glowRef} className="pointer-events-none fixed inset-0 z-0 transition-none" />

      {/* Main display name */}
      <div className="relative z-10 flex-1 flex flex-col justify-center">
        <h1
          className="w-full font-display font-bold leading-none tracking-[-0.04em] select-none"
          style={{ fontSize: 'clamp(3.5rem, 18.5vw, 18vw)' }}
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

        {/* Tagline */}
        <div
          className="flex items-center justify-center gap-5 mt-8 select-none"
          style={{ opacity: revealed ? 1 : 0, transition: 'opacity 1s ease', transitionDelay: '600ms' }}
        >
          {tagline ? (
            <span className="text-white/50 text-xl md:text-2xl font-display font-medium tracking-tight text-center">
              {tagline}
            </span>
          ) : (
            ['Sthira', 'Sukha', 'Prana'].map((word, i) => (
              <span key={word} className="flex items-center gap-5">
                <span className="text-white/50 text-2xl md:text-3xl font-display font-bold tracking-tight">{word}</span>
                {i < 2 && <span className="text-white/20">·</span>}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Bottom accent stripe */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-kumkum-500 via-marigold-400 to-forest-700" />
    </section>
  )
}
