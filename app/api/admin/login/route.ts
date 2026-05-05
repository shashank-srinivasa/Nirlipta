import { NextRequest, NextResponse } from 'next/server'
import { createToken } from '@/lib/admin-tokens'
import { createServiceClient } from '@/lib/supabase/server'
import crypto from 'crypto'

// Simple in-process rate limiter: max 10 attempts per IP per 15 minutes
const attempts = new Map<string, { count: number; resetAt: number }>()
const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 10

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = attempts.get(ip)
  if (!record || now > record.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }
  if (record.count >= MAX_ATTEMPTS) return false
  record.count++
  return true
}

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + (process.env.ADMIN_TOKEN_SECRET || process.env.ADMIN_PASSWORD || 'salt')).digest('hex')
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ success: false, error: 'Too many attempts. Try again in 15 minutes.' }, { status: 429 })
  }

  try {
    const { email, password } = await req.json()
    if (!email || !password) return NextResponse.json({ success: false }, { status: 400 })

    // Check DB admin_users first
    const supabase = createServiceClient()
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('id, password_hash, is_active')
      .eq('email', email.toLowerCase())
      .single()

    if (adminUser) {
      if (!adminUser.is_active) return NextResponse.json({ success: false }, { status: 401 })
      const hash = hashPassword(password)
      if (hash !== adminUser.password_hash) return NextResponse.json({ success: false }, { status: 401 })
      const token = createToken()
      return NextResponse.json({ success: true, token })
    }

    // Fallback: env var credentials (for initial setup)
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = createToken()
      return NextResponse.json({ success: true, token })
    }

    return NextResponse.json({ success: false }, { status: 401 })
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 })
  }
}
