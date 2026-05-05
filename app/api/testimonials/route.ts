import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { name, role, text } = await req.json()
    if (!name?.trim() || !text?.trim()) {
      return NextResponse.json({ error: 'Name and review are required' }, { status: 400 })
    }
    if (text.trim().length < 20) {
      return NextResponse.json({ error: 'Review is too short' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { error } = await supabase.from('testimonials').insert({
      name: name.trim(),
      role: role?.trim() || null,
      text: text.trim(),
      is_active: false, // pending approval
      sort_order: 0,
      bg_color: 'bg-indigo-700',
    })

    if (error) return NextResponse.json({ error: 'Failed to submit' }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
