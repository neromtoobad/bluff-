import { NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { CIRCLE_API_BASE } from "@/lib/circle-wallets"
import {
  circleSessions,
  isMockMode,
  mockOtps,
  userIdByEmail,
} from "@/lib/auth-state"

async function asJson<T = any>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T
  } catch {
    return null
  }
}

export async function POST(req: Request) {
  try {
    const { email } = (await req.json()) as { email?: string }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "valid email required" }, { status: 400 })
    }

    // ---------- MOCK PATH ----------
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

    // ---------- REAL CIRCLE W3S FLOW ----------
    // Three sequential calls, all server-side:
    //   1. POST /v1/w3s/users               — create the user
    //   2. POST /v1/w3s/users/token         — issue session token + encryptionKey
    //   3. POST /v1/w3s/user/initialize     — mint a wallet-init challengeId
    //                                         (requires X-User-Token)
    // The client then drives W3SSdk.execute(challengeId) to complete PIN setup.
    const apiKey = process.env.CIRCLE_API_KEY!
    const headers: Record<string, string> = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    }

    // 1. Create (or re-use) Circle user keyed by our email.
    let userId = userIdByEmail.get(email)
    if (!userId) {
      userId = randomUUID()
      const createRes = await fetch(`${CIRCLE_API_BASE}/users`, {
        method: "POST",
        headers,
        body: JSON.stringify({ userId }),
      })
      if (!createRes.ok && createRes.status !== 409) {
        const detail = await createRes.text()
        console.error(
          `[auth/init] POST /users failed status=${createRes.status} body=${detail}`,
        )
        return NextResponse.json(
          {
            error: "Circle user create failed",
            status: createRes.status,
            detail,
          },
          { status: 502 },
        )
      }
      userIdByEmail.set(email, userId)
    }

    // 2. Issue a session token + encryption key for the Circle Web SDK.
    const tokenRes = await fetch(`${CIRCLE_API_BASE}/users/token`, {
      method: "POST",
      headers,
      body: JSON.stringify({ userId }),
    })
    if (!tokenRes.ok) {
      const detail = await tokenRes.text()
      console.error(
        `[auth/init] POST /users/token failed status=${tokenRes.status} body=${detail}`,
      )
      return NextResponse.json(
        {
          error: "Circle session token failed",
          status: tokenRes.status,
          detail,
        },
        { status: 502 },
      )
    }
    const tokenJson = await asJson<{
      data?: { userToken?: string; encryptionKey?: string }
    }>(tokenRes)
    const userToken = tokenJson?.data?.userToken
    const encryptionKey = tokenJson?.data?.encryptionKey
    if (!userToken || !encryptionKey) {
      return NextResponse.json(
        { error: "Circle did not return userToken / encryptionKey" },
        { status: 502 },
      )
    }
    circleSessions.set(userId, { userId, userToken, encryptionKey })

    // 3. Mint the wallet-init challenge on Arc testnet.
    const initRes = await fetch(`${CIRCLE_API_BASE}/user/initialize`, {
      method: "POST",
      headers: { ...headers, "X-User-Token": userToken },
      body: JSON.stringify({
        idempotencyKey: randomUUID(),
        blockchains: ["ARC-TESTNET"],
        accountType: "SCA",
      }),
    })
    if (!initRes.ok) {
      const detail = await initRes.text()
      // 155106 = "The user had already been initialized." Per Circle's docs,
      // skip the challenge and go straight to listing the user's wallets.
      let code: number | undefined
      try { code = JSON.parse(detail)?.code } catch {}
      if (code === 155106) {
        return NextResponse.json({
          userId,
          userToken,
          encryptionKey,
          alreadyInitialized: true,
          appId: process.env.NEXT_PUBLIC_CIRCLE_APP_ID,
        })
      }
      console.error(
        `[auth/init] POST /user/initialize failed status=${initRes.status} body=${detail}`,
      )
      return NextResponse.json(
        {
          error: "Circle initialize failed",
          status: initRes.status,
          detail,
        },
        { status: 502 },
      )
    }
    const initJson = await asJson<{ data?: { challengeId?: string } }>(initRes)
    const challengeId = initJson?.data?.challengeId
    if (!challengeId) {
      return NextResponse.json(
        { error: "Circle did not return challengeId" },
        { status: 502 },
      )
    }

    return NextResponse.json({
      userId,
      challengeId,
      userToken,
      encryptionKey,
      appId: process.env.NEXT_PUBLIC_CIRCLE_APP_ID,
    })
  } catch (err: any) {
    console.error("[auth/init] unhandled error:", err?.stack ?? err?.message ?? err)
    return NextResponse.json({ error: err?.message ?? "unknown" }, { status: 500 })
  }
}

