'use client'

import { MessageCircle } from 'lucide-react'

export default function WhatsAppSection({ whatsapp }: { whatsapp: string }) {
  const msg = `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=Hi%20Ashwini%2C%20I%27d%20like%20to%20know%20more%20about%20your%20classes`

  return (
    <section className="py-24 section-cream relative overflow-hidden warli-bg">
      <div className="relative max-w-5xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <p className="text-ink/40 text-xs font-medium tracking-[0.2em] uppercase mb-3">Before you book</p>
            <h2 className="text-3xl font-display font-semibold text-ink tracking-tight leading-tight">
              Not sure where to start?
            </h2>
            <p className="text-ink/60 mt-2 text-lg max-w-sm">
              Message Ashwini directly. She responds to every inquiry herself.
            </p>
          </div>
          <a
            href={msg}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-2.5 bg-ink text-parchment-100 px-7 py-4 rounded-full font-medium text-sm hover:bg-ink-light transition-all active:scale-95 shadow-lg"
          >
            <MessageCircle size={17} />
            WhatsApp Ashwini
          </a>
        </div>
      </div>
    </section>
  )
}
