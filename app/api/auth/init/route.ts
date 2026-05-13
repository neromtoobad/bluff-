import { NextResponse } from "next/server"
import { createHash, randomUUID } from "crypto"
import { CIRCLE_API_BASE } from "@/lib/circle-wallets"

// Pinned to globalThis so dev hot-reload doesn't wipe state between
// /init and /verify. Replace with a DB later.
const _g = globalThis as unknown as {
  __userIdByEmail?: Map<string, string>
  __mockOtps?: Map<string, string>
  __circleSessions?: Map<
    string,
    { userId: string; userToken: string; encryptionKey: string }
  >
}
const userIdByEmail: Map<string, string> = _g.__userIdByEmail ?? new Map()
const mockOtps: Map<string, string> = _g.__mockOtps ?? new Map()
const circleSessions = _g.__circleSessions ?? new Map()
if (!_g.__userIdByEmail) _g.__userIdByEmail = userIdByEmail
if (!_g.__mockOtps) _g.__mockOtps = mockOtps
if (!_g.__circleSessions) _g.__circleSessions = circleSessions

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

    // --- REAL CIRCLE USER-CONTROLLED WALLETS PATH ---
    //
    // NOTE: Circle's documented UCW flow is not a single "email -> OTP -> wallet"
    // REST endpoint. The canonical flow is:
    //   1. POST /v1/w3s/users         — create userId
    //   2. POST /v1/w3s/users/token   — issue a session token + encryption key
    //   3. (client) initialize the Circle Web SDK with the session token; the
    //      SDK guides the user through PIN / biometric setup, which provisions
    //      the wallet and returns a wallet address.
    //
    // We do steps 1+2 here. The client uses the returned userToken to drive
    // the SDK. If you have a custom email-OTP gateway, plug it in where the
    // mock OTP currently lives.
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

    const tokenRes = await fetch(`${CIRCLE_API_BASE}/users/token`, {
      method: "POST",
      headers,
      body: JSON.stringify({ userId }),
    })
    if (!tokenRes.ok) {
      const text = await tokenRes.text()
      return NextResponse.json(
        { error: "Circle session token failed", detail: text },
        { status: 502 },
      )
    }
    const tokenJson = (await tokenRes.json()) as {
      data?: { userToken?: string; encryptionKey?: string }
    }
    const userToken = tokenJson?.data?.userToken
    const encryptionKey = tokenJson?.data?.encryptionKey
    if (!userToken || !encryptionKey) {
      return NextResponse.json(
        { error: "Circle did not return a userToken" },
        { status: 502 },
      )
    }

    circleSessions.set(userId, { userId, userToken, encryptionKey })

    // Issue a wallet-init challenge that the client SDK can drive.
    const initRes = await fetch(`${CIRCLE_API_BASE}/user/initialize`, {
      method: "POST",
      headers: {
        ...headers,
        "X-User-Token": userToken,
      },
      body: JSON.stringify({
        idempotencyKey: `init-${userId}`,
        blockchains: ["ARC-TESTNET"],
        accountType: "SCA",
      }),
    })

    let challengeId = randomUUID()
    if (initRes.ok) {
      const initJson = (await initRes.json()) as {
        data?: { challengeId?: string }
      }
      if (initJson?.data?.challengeId) challengeId = initJson.data.challengeId
    }

    return NextResponse.json({
      userId,
      challengeId,
      userToken,
      encryptionKey,
      // The user-controlled flow needs the Circle Web SDK to take it from here.
      // Email-OTP-only is not a Circle UCW capability without their hosted UI.
      hint:
        "Open Circle Web SDK with userToken + encryptionKey to complete wallet setup",
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "unknown" }, { status: 500 })
  }
}

export function deriveMockAddress(userId: string): string {
  const hash = createHash("sha256").update(`mock-wallet:${userId}`).digest("hex")
  return `0x${hash.slice(0, 40)}`
}

export { userIdByEmail, mockOtps, isMockMode, circleSessions }
