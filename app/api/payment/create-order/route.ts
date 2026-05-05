import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { amount, classId, student_name, student_email, student_phone, booking_date, notes } = await req.json()

    if (!amount || amount < 100) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    // Load keys from DB so non-technical admins can update them via Settings
    const supabase = createServiceClient()
    const { data: settings } = await supabase
      .from('studio_settings')
      .select('razorpay_key_id, razorpay_key_secret')
      .single()

    const keyId = settings?.razorpay_key_id || process.env.RAZORPAY_KEY_ID
    const keySecret = settings?.razorpay_key_secret || process.env.RAZORPAY_KEY_SECRET

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: 'Payment is not configured yet. Please contact the studio.' }, { status: 503 })
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret })

    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `yoga_${classId}_${Date.now()}`,
      notes: {
        class_id: classId,
        student_name: student_name || '',
        student_email: student_email || '',
        student_phone: student_phone || '',
        booking_date: booking_date || '',
        notes: notes || '',
      },
    })

    return NextResponse.json({ order, keyId })
  } catch (error) {
    console.error('Razorpay order error:', error)
    return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 })
  }
}
