import { NextRequest, NextResponse } from 'next/server'
import { isValidToken } from '@/lib/admin-tokens'

export async function POST(req: NextRequest) {
  const { token } = await req.json()
  if (!token || !isValidToken(token)) {
    return NextResponse.json({ valid: false }, { status: 401 })
  }
  return NextResponse.json({ valid: true })
}
