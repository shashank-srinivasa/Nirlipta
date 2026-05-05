import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-razorpay-signature') || ''

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('[WEBHOOK] RAZORPAY_WEBHOOK_SECRET not set')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  const expected = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex')
  if (expected !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const event = JSON.parse(rawBody)
  if (event.event !== 'order.paid') {
    return NextResponse.json({ ok: true })
  }

  const payment = event.payload?.payment?.entity
  const order = event.payload?.order?.entity
  if (!payment || !order) return NextResponse.json({ ok: true })

  const {
    class_id,
    student_name,
    student_email,
    student_phone,
    booking_date,
    notes,
  } = order.notes || {}

  if (!class_id || !booking_date) {
    console.error('[WEBHOOK] Missing class_id or booking_date in order notes', order.id)
    return NextResponse.json({ ok: true })
  }

  const supabase = createServiceClient()

  // Idempotency: skip if already recorded by client-side verify
  const { data: existing } = await supabase
    .from('bookings')
    .select('id')
    .eq('payment_id', payment.id)
    .maybeSingle()
  if (existing) return NextResponse.json({ ok: true })

  // Capacity check
  const { data: yoga } = await supabase.from('classes').select('title, max_students').eq('id', class_id).single()
  const { count } = await supabase
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .eq('class_id', class_id)
    .eq('booking_date', booking_date)
    .neq('status', 'cancelled')
  if (yoga?.max_students && (count ?? 0) >= yoga.max_students) {
    console.warn('[WEBHOOK] Class full, cannot insert booking', class_id, booking_date)
    return NextResponse.json({ ok: true })
  }

  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      class_id,
      student_name: student_name || '',
      student_email: student_email || '',
      student_phone: student_phone || '',
      booking_date,
      amount_paid: payment.amount,
      notes: notes || null,
      payment_id: payment.id,
      razorpay_order_id: order.id,
      status: 'pending',
    })
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') return NextResponse.json({ ok: true }) // duplicate, already inserted
    console.error('[WEBHOOK] Insert error:', error)
    return NextResponse.json({ error: 'Insert failed' }, { status: 500 })
  }

  console.log('[WEBHOOK] Booking created via webhook:', booking.id)
  return NextResponse.json({ ok: true })
}
