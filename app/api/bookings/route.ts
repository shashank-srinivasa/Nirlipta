import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendBookingReceived } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { class_id, student_name, student_email, student_phone, booking_date, amount_paid } = await req.json()
    if (!class_id || !student_name || !booking_date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const supabase = createServiceClient()

    // Capacity check
    const { data: yoga } = await supabase.from('classes').select('title, max_students').eq('id', class_id).single()
    const { count } = await supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('class_id', class_id)
      .eq('booking_date', booking_date)
      .neq('status', 'cancelled')
    if (yoga?.max_students && (count ?? 0) >= yoga.max_students) {
      return NextResponse.json({ error: 'This class is fully booked for that date' }, { status: 409 })
    }

    const { error } = await supabase.from('bookings').insert({
      class_id, student_name, student_email: student_email || '', student_phone: student_phone || '',
      booking_date, amount_paid: amount_paid || 0, status: 'pending',
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const { data: settings } = await supabase
      .from('studio_settings')
      .select('email, teacher_name, studio_name')
      .single()
    const teacherEmail = settings?.email || process.env.ADMIN_EMAIL || ''
    if (teacherEmail) {
      sendBookingReceived({
        studentName: student_name,
        studentEmail: student_email || '',
        studentPhone: student_phone || '',
        classTitle: yoga?.title || 'Yoga class',
        bookingDate: booking_date,
        amountPaid: amount_paid || 0,
        teacherEmail,
        teacherName: settings?.teacher_name || 'Ashwini',
        studioName: settings?.studio_name || 'Nirlipta',
      })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
