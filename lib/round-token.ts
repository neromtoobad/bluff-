import { createHmac, randomBytes } from "crypto"

// Stateless round persistence for Vercel: every /api/round/start signs the
// round's secret payload (liar, claims, truth, deadline) into an HMAC-protected
// token. The client passes it back to /stream, /bet, /settle. The token can be
// decoded only on the server (secret-keyed HMAC) so the client never sees the
// liar identity — that's the whole game.

const SECRET =
  process.env.ROUND_TOKEN_SECRET ||
  // Dev fallback: deterministic-per-process secret so the dev server works
  // out of the box without env config. Prod MUST set ROUND_TOKEN_SECRET or
  // restarts will invalidate every active round.
  (function () {
    const g = globalThis as any
    if (!g.__bluffDevSecret) g.__bluffDevSecret = randomBytes(32).toString("hex")
    return g.__bluffDevSecret as string
  })()

export type SignedRound = {
  id: string
  topic: string
  topicSource?: "twitter" | "trends" | "pool"
  topicUrl?: string | null
  liar: "A" | "B"
  truth: string
  source: string
  claimA: string
  claimB: string
  bettingDeadline: number
}

export function signRound(payload: SignedRound): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url")
  const sig = createHmac("sha256", SECRET).update(body).digest("base64url")
  return `${body}.${sig}`
}

export function verifyRound(token: string): SignedRound {
  const [body, sig] = token.split(".")
  if (!body || !sig) throw new Error("malformed round token")
  const expected = createHmac("sha256", SECRET).update(body).digest("base64url")
  // Constant-time-ish compare (Node's HMAC base64url returns same length).
  if (sig.length !== expected.length) throw new Error("invalid round token")
  let diff = 0
  for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i)
  if (diff !== 0) throw new Error("invalid round token")
  return JSON.parse(Buffer.from(body, "base64url").toString("utf8"))
}
