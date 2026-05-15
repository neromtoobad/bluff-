import { NextResponse } from "next/server"
import { CIRCLE_API_BASE } from "@/lib/circle-wallets"
import { circleSessions } from "../../auth/init/route"

// Return a fresh userToken + encryptionKey for the Web SDK to authenticate
// against a contract-execution challenge. We never put these in
// sessionStorage (they're 60-min secrets) — the client fetches them on
// demand right before sdk.execute.
//
// Body: { userId }
// Returns: { userToken, encryptionKey }

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const { userId } = (await req.json()) as { userId?: string }
    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }
    const apiKey = process.env.CIRCLE_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "CIRCLE_API_KEY not set" }, { status: 500 })
    }

    // Always issue a fresh pair; userTokens expire after 60 min and the
    // encryptionKey is rotated with each token.
    const res = await fetch(`${CIRCLE_API_BASE}/users/token`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    })
    if (!res.ok) {
      const detail = await res.text()
      console.error(
        `[circle/session] POST /users/token failed status=${res.status} body=${detail}`,
      )
      return NextResponse.json(
        { error: "Circle token refresh failed", detail },
        { status: 502 },
      )
    }
    const json = await res.json()
    const userToken = json?.data?.userToken
    const encryptionKey = json?.data?.encryptionKey
    if (!userToken || !encryptionKey) {
      return NextResponse.json(
        { error: "Circle did not return userToken / encryptionKey" },
        { status: 502 },
      )
    }
    circleSessions.set(userId, { userId, userToken, encryptionKey })
    return NextResponse.json({ userToken, encryptionKey })
  } catch (err: any) {
    console.error("[circle/session] unhandled:", err?.stack ?? err?.message ?? err)
    return NextResponse.json({ error: err?.message ?? "unknown" }, { status: 500 })
  }
}
