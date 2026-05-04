'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { href: '/classes', label: 'Classes' },
  { href: '/about', label: 'About' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [pathname])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const dark = pathname === '/' && !scrolled

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled
        ? 'bg-parchment-100/90 backdrop-blur-xl border-b border-parchment-300'
        : 'bg-transparent'
    )}>
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-kumkum-500 via-marigold-400 to-forest-700" />

      <nav className="max-w-7xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-marigold-500 flex items-center justify-center shrink-0">
            <span className="text-parchment-100 text-xs font-bold font-display">N</span>
          </div>
          <span className={cn('font-display font-semibold text-sm tracking-tight transition-colors', dark ? 'text-white/80' : 'text-ink')}>
            Nirlipta
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm font-medium transition-colors',
                pathname === link.href
                  ? 'text-marigold-400'
                  : dark ? 'text-white/50 hover:text-white/90' : 'text-ink/70 hover:text-ink'
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/classes" className="btn-marigold py-2 px-5 text-sm">
            Book a class
          </Link>
        </div>

        <button className={cn('md:hidden p-2 transition-colors', dark ? 'text-white/50' : 'text-ink/60')} onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu" aria-expanded={menuOpen}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {menuOpen && (
        <div className="md:hidden bg-parchment-100/95 backdrop-blur-xl border-t border-parchment-300 px-6 py-5 space-y-4">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href}
              className={cn('block text-sm font-medium py-1.5 transition-colors', pathname === link.href ? 'text-terracotta-400' : 'text-ink/60')}>
              {link.label}
            </Link>
          ))}
          <Link href="/classes" className="btn-marigold block text-center mt-2">Book a class</Link>
        </div>
      )}
    </header>
  )
}
