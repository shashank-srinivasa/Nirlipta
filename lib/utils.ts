import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(paise: number): string {
  return `₹${(paise / 100).toLocaleString('en-IN')}`
}

export function formatTime(time: string): string {
  if (!time) return ''
  const [h, m] = time.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function getLevelBadge(level: string): string {
  switch (level) {
    case 'Beginner':     return 'text-forest-700 bg-forest-700/10'
    case 'Intermediate': return 'text-marigold-600 bg-marigold-400/10'
    case 'Advanced':     return 'text-kumkum-500 bg-kumkum-400/10'
    default:             return 'text-ink/50 bg-ink/5'
  }
}

// Strips script tags and on* event attributes from HTML before rendering.
// Blog content is admin-entered, but defence-in-depth guards against stored XSS.
export function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\s+on\w+="[^"]*"/gi, '')
    .replace(/\s+on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '')
}
