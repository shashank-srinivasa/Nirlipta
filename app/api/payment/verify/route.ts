import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createServiceClient } from '@/lib/supabase/server'
import { sendBookingNotification } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      class_id,
      student_name,
      student_email,
      student_phone,
      booking_date,
      amount_paid,
      notes,
    } = body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ success: false, error: 'Missing payment fields' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { data: settings } = await supabase
      .from('studio_settings')
      .select('razorpay_key_secret, email, teacher_name')
      .single()
    const keySecret = settings?.razorpay_key_secret || process.env.RAZORPAY_KEY_SECRET

    if (!keySecret) {
      return NextResponse.json({ success: false, error: 'Payment not configured' }, { status: 503 })
    }

    const hmac = crypto.createHmac('sha256', keySecret)
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`)
    const digest = hmac.digest('hex')

    if (digest !== razorpay_signature) {
      return NextResponse.json({ success: false, error: 'Invalid payment signature' }, { status: 400 })
    }

    const { data: yoga } = await supabase.from('classes').select('title').eq('id', class_id).single()

    const { data: booking, error } = await supabase
      .from('bookings')
      .insert({
        class_id,
        student_name,
        student_email,
        student_phone,
        booking_date,
        amount_paid,
        notes: notes || null,
        payment_id: razorpay_payment_id,
        razorpay_order_id,
        status: 'confirmed',
      })
      .select('id')
      .single()

    if (error) {
      console.error('Booking insert error:', error)
      return NextResponse.json({ success: false, error: 'Failed to save booking' }, { status: 500 })
    }

    // Send email notification — non-blocking
    const teacherEmail = settings?.email || process.env.ADMIN_EMAIL || ''
    if (teacherEmail) {
      sendBookingNotification({
        studentName: student_name,
        studentEmail: student_email,
        studentPhone: student_phone,
        classTitle: yoga?.title || 'Unknown class',
        bookingDate: booking_date,
        amountPaid: amount_paid,
        paymentId: razorpay_payment_id,
        teacherEmail,
        teacherName: settings?.teacher_name || 'Ashwini',
      })
    }

    return NextResponse.json({ success: true, bookingId: booking.id })
  } catch (error) {
    console.error('Verify payment error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
