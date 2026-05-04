import Link from 'next/link'
import { Instagram, Youtube, MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export default async function Footer() {
  const supabase = createClient()
  const { data: settings } = await supabase
    .from('studio_settings')
    .select('studio_name, teacher_name, footer_tagline, instagram_url, youtube_url, whatsapp_number')
    .single()
  const whatsapp = settings?.whatsapp_number || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919999999999'
  const studioName = settings?.studio_name || 'Nirlipta'
  const teacherName = settings?.teacher_name || 'Ashwini Karmbadka'
  const footerTagline = settings?.footer_tagline || `Yoga with ${teacherName}.`

  return (
    <footer className="bg-ink border-t border-white/5">
      <div className="h-[3px] bg-gradient-to-r from-kumkum-500 via-marigold-400 to-forest-700" />
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-full bg-marigold-500 flex items-center justify-center shrink-0">
                <span className="text-parchment-100 text-xs font-bold font-display">{studioName[0]}</span>
              </div>
              <span className="font-display font-semibold text-parchment-100 text-sm">{studioName} by {teacherName.split(' ')[0]}</span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed max-w-xs">
              {footerTagline}
            </p>
          </div>

          <div>
            <h4 className="text-white/60 text-xs tracking-[0.18em] uppercase mb-4">Pages</h4>
            <div className="space-y-2.5">
              {[
                { href: '/classes', label: 'Classes & Schedule' },
                { href: '/about', label: `About ${teacherName.split(' ')[0]}` },
                { href: '/gallery', label: 'Gallery' },
                { href: '/blog', label: 'Blog' },
                { href: '/contact', label: 'Contact' },
              ].map(link => (
                <Link key={link.href} href={link.href} className="block text-sm text-white/60 hover:text-marigold-300 transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white/60 text-xs tracking-[0.18em] uppercase mb-4">Connect</h4>
            <div className="flex gap-3 mb-6">
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer"
                className="p-2 rounded-full bg-white/5 hover:bg-green-600 text-white/60 hover:text-white transition-colors" aria-label="WhatsApp">
                <MessageCircle size={15} />
              </a>
              {settings?.instagram_url && (
                <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer"
                  className="p-2 rounded-full bg-white/5 hover:bg-pink-600 text-white/60 hover:text-white transition-colors" aria-label="Instagram">
                  <Instagram size={15} />
                </a>
              )}
              {settings?.youtube_url && (
                <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer"
                  className="p-2 rounded-full bg-white/5 hover:bg-red-600 text-white/60 hover:text-white transition-colors" aria-label="YouTube">
                  <Youtube size={15} />
                </a>
              )}
            </div>
            <p className="text-xs text-white/40">© {new Date().getFullYear()} {studioName} · {teacherName}</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
