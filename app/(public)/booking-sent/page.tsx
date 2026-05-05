import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'Request Sent' }

export default async function BookingSentPage() {
  const supabase = createClient()
  const { data: settings } = await supabase.from('studio_settings').select('teacher_name').single()
  const teacherFirst = settings?.teacher_name?.split(' ')[0] || 'Ashwini'

  return (
    <div className="min-h-screen bg-parchment-100 flex items-center justify-center px-6 py-20">
      <div className="bg-white rounded-3xl p-10 shadow-sm border border-parchment-300 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <MessageCircle size={40} className="text-green-500" />
        </div>

        <h1 className="text-2xl font-display font-semibold text-ink mb-2">Request sent!</h1>
        <p className="text-ink/50 mb-8 leading-relaxed">
          Your booking request has been sent to {teacherFirst} on WhatsApp. She&apos;ll confirm your spot shortly.
        </p>

        <Link href="/classes" className="btn-marigold inline-block">
          Explore more classes
        </Link>
      </div>
    </div>
  )
}
