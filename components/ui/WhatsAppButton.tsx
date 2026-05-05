'use client'

import { MessageCircle } from 'lucide-react'

export default function WhatsAppButton({ whatsapp, teacherName = 'Ashwini' }: { whatsapp: string; teacherName?: string }) {
  const first = teacherName.split(' ')[0]
  const msg = `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${first}, I'd like to know more about your classes`)}`

  return (
    <a
      href={msg}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 w-[52px] h-[52px] bg-green-500 hover:bg-green-400 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all active:scale-95 border border-white/10"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={22} className="text-white" />
    </a>
  )
}
