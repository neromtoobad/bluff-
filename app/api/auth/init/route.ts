import { NextResponse } from "next/server"
import { createHash, randomUUID } from "crypto"
import { CIRCLE_API_BASE } from "@/lib/circle-wallets"

// Pinned to globalThis so dev hot-reload doesn't wipe state between
// /init and /verify. Replace with a DB later.
const _g = globalThis as unknown as {
  __userIdByEmail?: Map<string, string>
  __mockOtps?: Map<string, string>
}
const userIdByEmail: Map<string, string> = _g.__userIdByEmail ?? new Map()
const mockOtps: Map<string, string> = _g.__mockOtps ?? new Map()
if (!_g.__userIdByEmail) _g.__userIdByEmail = userIdByEmail
if (!_g.__mockOtps) _g.__mockOtps = mockOtps

function isMockMode(): boolean {
  const key = process.env.CIRCLE_API_KEY
  return !key || key === "MOCK" || process.env.NEXT_PUBLIC_AUTH_MOCK === "1"
}

export async function POST(req: Request) {
  try {
    const { email } = (await req.json()) as { email?: string }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "valid email required" }, { status: 400 })
    }

    // --- MOCK PATH ---
    // The real Circle user-controlled-wallet flow requires a client-side SDK
    // PIN/biometric setup. For demo purposes we issue a fake OTP and key
    // a deterministic wallet address off the email in /verify.
    if (isMockMode()) {
      let userId = userIdByEmail.get(email)
      if (!userId) {
        userId = randomUUID()
        userIdByEmail.set(email, userId)
      }
      const otp = "424242"
      mockOtps.set(userId, otp)
      console.log(`[mock auth] OTP for ${email}: ${otp}`)
      return NextResponse.json({
        userId,
        challengeId: randomUUID(),
        mock: true,
        hint: "Use code 424242",
      })
    }

    // --- REAL CIRCLE PATH (placeholder — Circle integration is more involved) ---
    const apiKey = process.env.CIRCLE_API_KEY!
    const headers = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    }

    let userId = userIdByEmail.get(email)
    if (!userId) {
      userId = randomUUID()
      const createRes = await fetch(`${CIRCLE_API_BASE}/users`, {
        method: "POST",
        headers,
        body: JSON.stringify({ userId }),
      })
      if (!createRes.ok && createRes.status !== 409) {
        const text = await createRes.text()
        return NextResponse.json(
          { error: "Circle user create failed", detail: text },
          { status: 502 },
        )
      }
      userIdByEmail.set(email, userId)
    }

    const challengeRes = await fetch(`${CIRCLE_API_BASE}/users/email/otp`, {
      method: "POST",
      headers,
      body: JSON.stringify({ userId, email }),
    })
    if (!challengeRes.ok) {
      const text = await challengeRes.text()
      return NextResponse.json(
        { error: "Circle OTP trigger failed", detail: text },
        { status: 502 },
      )
    }
    const challengeJson = (await challengeRes.json()) as {
      data?: { challengeId?: string }
    }
    return NextResponse.json({
      userId,
      challengeId: challengeJson?.data?.challengeId ?? randomUUID(),
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "unknown" }, { status: 500 })
  }
}

export function deriveMockAddress(userId: string): string {
  const hash = createHash("sha256").update(`mock-wallet:${userId}`).digest("hex")
  return `0x${hash.slice(0, 40)}`
}

export { userIdByEmail, mockOtps, isMockMode }
