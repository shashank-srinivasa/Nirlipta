import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendContactNotification } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, message } = await req.json()

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    const supabase = createServiceClient()

    const [{ error: insertError }, { data: settings }] = await Promise.all([
      supabase.from('contact_messages').insert({
        name: name.trim(),
        email: email.trim(),
        phone: phone?.trim() || null,
        message: message.trim(),
      }),
      supabase.from('studio_settings').select('email, teacher_name').single(),
    ])

    if (insertError) {
      console.error('Contact insert error:', insertError)
      return NextResponse.json({ error: 'Failed to save message' }, { status: 500 })
    }

    // Send email notification — non-blocking
    const teacherEmail = settings?.email || process.env.ADMIN_EMAIL || ''
    if (teacherEmail) {
      sendContactNotification({
        fromName: name.trim(),
        fromEmail: email.trim(),
        fromPhone: phone?.trim(),
        message: message.trim(),
        teacherEmail,
      })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
