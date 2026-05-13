import { NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { CIRCLE_API_BASE } from "@/lib/circle-wallets"

// In-memory map: email -> Circle userId. Replace with a DB later.
const userIdByEmail = new Map<string, string>()

export async function POST(req: Request) {
  try {
    const { email } = (await req.json()) as { email?: string }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "valid email required" }, { status: 400 })
    }

    const apiKey = process.env.CIRCLE_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "CIRCLE_API_KEY not set" }, { status: 500 })
    }

    const headers = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    }

    // 1. Create (or reuse) a Circle user keyed by email.
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

    // 2. Trigger email OTP challenge for this user.
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
    const challengeId = challengeJson?.data?.challengeId ?? randomUUID()

    return NextResponse.json({ userId, challengeId })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "unknown" }, { status: 500 })
  }
}

export { userIdByEmail }
