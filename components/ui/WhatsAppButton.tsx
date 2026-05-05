'use client'

import { MessageCircle } from 'lucide-react'

export default function WhatsAppButton({ whatsapp }: { whatsapp: string }) {
  const msg = `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=Hi%20Ashwini%2C%20I%27d%20like%20to%20know%20more%20about%20your%20classes`

  return (
    <a
      href={msg}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 w-13 h-13 w-[52px] h-[52px] bg-green-500 hover:bg-green-400 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all active:scale-95 border border-white/10"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={22} className="text-white" />
    </a>
  )
}
