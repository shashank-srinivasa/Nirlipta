import crypto from 'crypto'

const SECRET = process.env.ADMIN_TOKEN_SECRET || process.env.ADMIN_PASSWORD || 'fallback-secret'
const TOKEN_TTL_MS = 15 * 60 * 1000 // 15 minutes

export function createToken(): string {
  const expiry = Date.now() + TOKEN_TTL_MS
  const payload = `${expiry}`
  const sig = crypto.createHmac('sha256', SECRET).update(payload).digest('hex')
  return Buffer.from(`${payload}.${sig}`).toString('base64url')
}

export function isValidToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, 'base64url').toString()
    const [payload, sig] = decoded.split('.')
    if (!payload || !sig) return false
    const expected = crypto.createHmac('sha256', SECRET).update(payload).digest('hex')
    if (!crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))) return false
    return Date.now() < parseInt(payload, 10)
  } catch {
    return false
  }
}
