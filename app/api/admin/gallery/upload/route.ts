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
  const caption = formData.get('caption') as string | null
  const sortOrder = parseInt(formData.get('sort_order') as string || '0', 10)

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const ext = file.name.split('.').pop()
  const path = `${Date.now()}.${ext}`

  const supabase = createServiceClient()

  const arrayBuffer = await file.arrayBuffer()
  const buffer = new Uint8Array(arrayBuffer)

  const { error: uploadError } = await supabase.storage
    .from('gallery')
    .upload(path, buffer, { contentType: file.type })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(path)

  const { error: insertError } = await supabase.from('gallery').insert({
    image_url: publicUrl,
    caption: caption || null,
    sort_order: sortOrder,
  })

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })

  return NextResponse.json({ ok: true, publicUrl })
}
