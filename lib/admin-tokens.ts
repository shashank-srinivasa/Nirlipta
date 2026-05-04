import crypto from 'crypto'

// In-memory token store with 8-hour expiry.
// Tokens are cleared on server restart, forcing re-login — acceptable for a single-admin studio app.
const tokens = new Map<string, number>()
const TOKEN_TTL_MS = 8 * 60 * 60 * 1000

export function createToken(): string {
  const token = crypto.randomBytes(32).toString('hex')
  tokens.set(token, Date.now() + TOKEN_TTL_MS)
  return token
}

export function isValidToken(token: string): boolean {
  const expiry = tokens.get(token)
  if (!expiry) return false
  if (Date.now() > expiry) { tokens.delete(token); return false }
  return true
}
