import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { isValidToken } from '@/lib/admin-tokens'

function auth(req: NextRequest) {
  const token = req.headers.get('x-admin-token') || req.cookies.get('admin_token')?.value
  return token && isValidToken(token)
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const ext = file.name.split('.').pop() || 'jpg'
  const path = `teacher-${Date.now()}.${ext}`

  const supabase = createServiceClient()
  const buffer = new Uint8Array(await file.arrayBuffer())

  const { error: uploadError } = await supabase.storage
    .from('settings')
    .upload(path, buffer, { contentType: file.type, upsert: true })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data: { publicUrl } } = supabase.storage.from('settings').getPublicUrl(path)

  return NextResponse.json({ ok: true, publicUrl })
}
