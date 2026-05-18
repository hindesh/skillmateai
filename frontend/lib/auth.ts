const TOKEN_KEY = 'skillmate_token'

export interface TokenPayload {
  sub: string
  id: string   // alias for sub, populated after decode
  name: string
  email: string
  role: 'teacher' | 'student'
  grade_level: string | null
  exp: number
}

export function setToken(token: string): void {
  const maxAge = 30 * 24 * 60 * 60
  document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax`
}

export function getToken(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${TOKEN_KEY}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

export function clearToken(): void {
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    const base64 = token.split('.')[1]
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'))
    const payload = JSON.parse(json) as TokenPayload
    payload.id = payload.sub
    return payload
  } catch {
    return null
  }
}

export function getProfile(): TokenPayload | null {
  const token = getToken()
  if (!token) return null
  const payload = decodeToken(token)
  if (!payload) {
    clearToken()  // corrupted token — clear it so middleware stops bouncing
    return null
  }
  if (payload.exp * 1000 < Date.now()) {
    clearToken()
    return null
  }
  return payload
}
