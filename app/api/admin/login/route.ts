import { NextRequest, NextResponse } from 'next/server'
import { createToken } from '@/lib/admin-tokens'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ success: false }, { status: 400 })
  }

  if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ success: false }, { status: 401 })
  }

  const token = createToken()
  return NextResponse.json({ success: true, token })
}
