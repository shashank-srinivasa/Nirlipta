import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { isValidToken } from '@/lib/admin-tokens'
import crypto from 'crypto'

function auth(req: NextRequest) {
  const token = req.headers.get('x-admin-token') || req.cookies.get('admin_token')?.value
  return token && isValidToken(token)
}

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + (process.env.ADMIN_TOKEN_SECRET || process.env.ADMIN_PASSWORD || 'salt')).digest('hex')
}

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = createServiceClient()
  const { data, error } = await supabase.from('admin_users').select('id, email, name, is_active, created_at').order('created_at')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { email, password, name } = await req.json()
  if (!email || !password || !name) return NextResponse.json({ error: 'Email, name, and password are required' }, { status: 400 })
  const supabase = createServiceClient()

  // Enforce max 5 admins
  const { count } = await supabase.from('admin_users').select('id', { count: 'exact', head: true }).eq('is_active', true)
  if ((count ?? 0) >= 5) return NextResponse.json({ error: 'Maximum 5 admin users allowed' }, { status: 400 })

  const { error } = await supabase.from('admin_users').insert({ email: email.toLowerCase(), password_hash: hashPassword(password), name })
  if (error) return NextResponse.json({ error: error.code === '23505' ? 'An admin with this email already exists' : error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function PUT(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, password, name, is_active } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const supabase = createServiceClient()
  const update: Record<string, unknown> = {}
  if (name !== undefined) update.name = name
  if (is_active !== undefined) update.is_active = is_active
  if (password) update.password_hash = hashPassword(password)
  const { error } = await supabase.from('admin_users').update(update).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await req.json()
  const supabase = createServiceClient()
  const { error } = await supabase.from('admin_users').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
