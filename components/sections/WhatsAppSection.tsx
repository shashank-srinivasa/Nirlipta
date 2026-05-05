'use client'

import { MessageCircle } from 'lucide-react'

export default function WhatsAppSection({ whatsapp, teacherName = 'Ashwini' }: { whatsapp: string; teacherName?: string }) {
  const first = teacherName.split(' ')[0]
  const msg = `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${first}, I'd like to know more about your classes`)}`

  return (
    <section className="py-24 section-cream relative overflow-hidden warli-bg">
      <div className="relative max-w-5xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl font-display font-semibold text-ink tracking-tight leading-tight">
              Have a question?
            </h2>
            <p className="text-ink/60 mt-2 text-lg">
              Message {first} on WhatsApp.
            </p>
          </div>
          <a
            href={msg}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-2.5 bg-ink text-parchment-100 px-7 py-4 rounded-full font-medium text-sm hover:bg-ink-light transition-all active:scale-95 shadow-lg"
          >
            <MessageCircle size={17} />
            WhatsApp {first}
          </a>
        </div>
      </div>
    </section>
  )
}
