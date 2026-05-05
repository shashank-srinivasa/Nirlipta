import Link from 'next/link'
import { MessageCircle } from 'lucide-react'

export const metadata = { title: 'Request Sent' }

export default function BookingSentPage() {
  return (
    <div className="min-h-screen bg-parchment-100 flex items-center justify-center px-6 py-20">
      <div className="bg-white rounded-3xl p-10 shadow-sm border border-parchment-300 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <MessageCircle size={40} className="text-green-500" />
        </div>

        <h1 className="text-2xl font-display font-semibold text-ink mb-2">Message Sent</h1>
        <p className="text-ink/50 mb-8 leading-relaxed">
          Your booking request has been sent via WhatsApp. Ashwini will confirm your spot shortly.
        </p>

        <p className="text-sm text-ink/35 mb-8">
          Didn&apos;t open WhatsApp? Check that pop-ups are allowed, or message directly from the app.
        </p>

        <Link href="/classes" className="btn-marigold inline-block">
          Explore More Classes
        </Link>
      </div>
    </div>
  )
}
