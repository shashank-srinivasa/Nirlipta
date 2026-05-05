import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { class_id, student_name, student_email, student_phone, booking_date, amount_paid, status } = await req.json()
    if (!class_id || !student_name || !booking_date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const supabase = createServiceClient()

    // Capacity check
    const { data: yoga } = await supabase.from('classes').select('max_students').eq('id', class_id).single()
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
      booking_date, amount_paid: amount_paid || 0, status: status || 'pending',
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
