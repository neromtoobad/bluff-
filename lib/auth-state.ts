// In-memory state shared between /api/auth/* and /api/circle/* routes.
// Module-level singletons via globalThis so dev hot-reload + multiple
// route invocations share the same maps.
//
// NOTE on Vercel: serverless functions don't share memory across cold
// starts, so these maps will be empty on each new lambda. For production
// you'd back this with a real KV (Vercel KV, Upstash Redis, etc.).
// In a single-container dev / preview, this is fine.

import { createHash } from "crypto"

type Session = { userId: string; userToken: string; encryptionKey: string }

const _g = globalThis as unknown as {
  __userIdByEmail?: Map<string, string>
  __mockOtps?: Map<string, string>
  __circleSessions?: Map<string, Session>
}

export const userIdByEmail: Map<string, string> =
  _g.__userIdByEmail ?? new Map()
export const mockOtps: Map<string, string> = _g.__mockOtps ?? new Map()
export const circleSessions: Map<string, Session> =
  _g.__circleSessions ?? new Map()

if (!_g.__userIdByEmail) _g.__userIdByEmail = userIdByEmail
if (!_g.__mockOtps) _g.__mockOtps = mockOtps
if (!_g.__circleSessions) _g.__circleSessions = circleSessions

export function isMockMode(): boolean {
  const key = process.env.CIRCLE_API_KEY
  return !key || key === "MOCK" || process.env.NEXT_PUBLIC_AUTH_MOCK === "1"
}

export function deriveMockAddress(userId: string): string {
  const hash = createHash("sha256").update(`mock-wallet:${userId}`).digest("hex")
  return `0x${hash.slice(0, 40)}`
}
