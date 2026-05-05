import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import { formatDate, formatPrice } from '@/lib/utils'
import { CheckCircle } from 'lucide-react'

interface Props { searchParams: { booking?: string } }

export default async function PaymentSuccessPage({ searchParams }: Props) {
  let booking = null
  if (searchParams.booking) {
    const supabase = createServiceClient()
    const { data } = await supabase
      .from('bookings')
      .select('*, classes(title)')
      .eq('id', searchParams.booking)
      .single()
    booking = data
  }

  return (
    <div className="min-h-screen bg-parchment-100 flex items-center justify-center px-6 py-20">
      <div className="bg-white rounded-3xl p-10 shadow-sm border border-parchment-300 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-forest-700/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-forest-700" />
        </div>

        <h1 className="text-2xl font-display font-semibold text-ink mb-2">Payment Received</h1>
        <p className="text-ink/50 mb-8">
          Your payment was successful. The studio will confirm your booking shortly and send you a confirmation email.
        </p>

        {booking && (
          <div className="bg-parchment-100 rounded-2xl p-5 text-left space-y-3 mb-8">
            <div className="flex justify-between text-sm">
              <span className="text-ink/40">Class</span>
              <span className="font-medium text-ink">{booking.classes?.title}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink/40">Date</span>
              <span className="font-medium text-ink">{formatDate(booking.booking_date)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink/40">Name</span>
              <span className="font-medium text-ink">{booking.student_name}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-parchment-300 pt-3 mt-1">
              <span className="text-ink/40">Amount paid</span>
              <span className="font-semibold text-ink">{formatPrice(booking.amount_paid)}</span>
            </div>
            {booking.payment_id && (
              <div className="flex justify-between text-sm">
                <span className="text-ink/40">Payment ID</span>
                <span className="font-mono text-xs text-ink/50">{booking.payment_id.slice(0, 20)}…</span>
              </div>
            )}
          </div>
        )}

        <p className="text-sm text-ink/40 mb-6">See you soon!</p>

        <Link href="/classes" className="btn-marigold inline-block">
          Explore More Classes
        </Link>
      </div>
    </div>
  )
}
