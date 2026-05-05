import { createClient } from '@/lib/supabase/server'
import ContactForm from './ContactForm'
import { MapPin, Phone, Mail, MessageCircle } from 'lucide-react'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const supabase = createClient()
  const { data } = await supabase.from('studio_settings').select('teacher_name').single()
  const teacher = data?.teacher_name?.split(' ')[0] || 'Ashwini'
  return { title: 'Contact', description: `Get in touch with ${teacher}. Ask about classes, pricing, or anything else.` }
}
export const revalidate = 3600

export default async function ContactPage() {
  const supabase = createClient()
  const { data: settings } = await supabase.from('studio_settings').select('*').single()
  const whatsapp = settings?.whatsapp_number || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919999999999'
  const teacherFirst = settings?.teacher_name?.split(' ')[0] || 'Ashwini'

  return (
    <div className="pt-16">
      <div className="section-parchment py-24 px-6 md:px-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-kumkum-500 via-marigold-400 to-forest-700" />
        <div className="max-w-7xl mx-auto">
          <p className="text-terracotta-400 text-xs font-medium tracking-[0.2em] uppercase mb-4">Get in touch</p>
          <h1 className="text-4xl md:text-6xl font-display font-semibold text-ink tracking-tight mb-5 leading-tight">Say hi.</h1>
          <p className="text-xl text-ink/50 max-w-xl leading-relaxed">
            Questions about a class, unsure if yoga is for you, or just curious — {teacherFirst} reads every message and replies herself.
          </p>
        </div>
      </div>

      <div className="section-parchment max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          <div className="lg:col-span-2 space-y-6">
            {settings?.address && (
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-marigold-500/10 flex items-center justify-center shrink-0">
                  <MapPin size={16} className="text-marigold-600" />
                </div>
                <div>
                  <p className="font-medium text-ink text-sm mb-1">Studio Location</p>
                  <p className="text-sm text-ink/50">{settings.address}</p>
                </div>
              </div>
            )}

            {settings?.phone && (
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-marigold-500/10 flex items-center justify-center shrink-0">
                  <Phone size={16} className="text-marigold-600" />
                </div>
                <div>
                  <p className="font-medium text-ink text-sm mb-1">Phone</p>
                  <a href={`tel:${settings.phone}`} className="text-sm text-ink/50 hover:text-marigold-600 transition-colors">
                    {settings.phone}
                  </a>
                </div>
              </div>
            )}

            {settings?.email && (
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-marigold-500/10 flex items-center justify-center shrink-0">
                  <Mail size={16} className="text-marigold-600" />
                </div>
                <div>
                  <p className="font-medium text-ink text-sm mb-1">Email</p>
                  <a href={`mailto:${settings.email}`} className="text-sm text-ink/50 hover:text-marigold-600 transition-colors">
                    {settings.email}
                  </a>
                </div>
              </div>
            )}

            <div className="pt-4">
              <a
                href={`https://wa.me/${whatsapp}?text=Hi%2C%20I%27d%20like%20to%20know%20more%20about%20your%20yoga%20classes`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 bg-ink text-parchment-100 px-6 py-3.5 rounded-full font-medium text-sm hover:bg-ink/80 transition-all active:scale-95"
              >
                <MessageCircle size={16} /> Message on WhatsApp
              </a>
            </div>
          </div>

          <div className="lg:col-span-3">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  )
}
