import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/server'
import { isValidToken } from '@/lib/admin-tokens'
import { sendBookingConfirmed } from '@/lib/email'

function auth(req: NextRequest) {
  const token = req.headers.get('x-admin-token') || req.cookies.get('admin_token')?.value
  return token && isValidToken(token)
}

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('bookings')
    .select('*, classes(title, schedule_day, schedule_time)')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('bookings')
    .insert({ ...body, status: body.status || 'confirmed' })
    .select('id')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  revalidatePath('/admin')
  return NextResponse.json({ ok: true, id: data.id })
}

export async function PUT(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, send_confirmation, ...body } = await req.json()
  const supabase = createServiceClient()
  const { error } = await supabase.from('bookings').update(body).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Send confirmation email when admin confirms a booking
  if (send_confirmation && body.status === 'confirmed') {
    const { data: booking } = await supabase
      .from('bookings')
      .select('*, classes(title)')
      .eq('id', id)
      .single()
    const { data: settings } = await supabase
      .from('studio_settings')
      .select('email, teacher_name, studio_name')
      .single()
    if (booking?.student_email) {
      await sendBookingConfirmed({
        studentName: booking.student_name,
        studentEmail: booking.student_email,
        studentPhone: booking.student_phone,
        classTitle: booking.classes?.title || 'Yoga class',
        bookingDate: booking.booking_date,
        amountPaid: booking.amount_paid,
        teacherEmail: settings?.email || process.env.ADMIN_EMAIL || '',
        teacherName: settings?.teacher_name || 'Ashwini',
        studioName: settings?.studio_name || 'Nirlipta',
      })
    }
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await req.json()
  const supabase = createServiceClient()
  const { error } = await supabase.from('bookings').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
