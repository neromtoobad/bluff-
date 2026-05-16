import { NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { CIRCLE_API_BASE } from "@/lib/circle-wallets"
import { USDC_ADDRESS, USDC_DECIMALS } from "@/lib/chains"
import { parseUnits } from "viem"
import { circleSessions } from "@/lib/auth-state"

// Create a Circle contract-execution challenge for the user's SCA to send
// `amount` USDC to `escrow`. The browser then drives sdk.execute(challengeId)
// to prompt the user's PIN, after which Circle submits the tx on-chain.
//
// Body: { userId, walletId, escrow, amount }   amount is USDC string ("0.50")
// Returns: { challengeId, transactionId? }

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      userId?: string
      walletId?: string
      escrow?: string
      amount?: string
    }
    const { userId, walletId, escrow, amount } = body
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })
    if (!walletId) return NextResponse.json({ error: "walletId required" }, { status: 400 })
    if (!escrow || !/^0x[a-fA-F0-9]{40}$/.test(escrow)) {
      return NextResponse.json({ error: "escrow address required" }, { status: 400 })
    }
    if (!amount || !/^\d+(\.\d{1,6})?$/.test(amount) || Number(amount) <= 0) {
      return NextResponse.json({ error: "positive USDC amount required" }, { status: 400 })
    }

    const apiKey = process.env.CIRCLE_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "CIRCLE_API_KEY not set" }, { status: 500 })
    }

    // Re-use the userToken from /api/auth/init if we still have it; otherwise
    // mint a fresh one. Tokens last 60 minutes, sessions can outlive that.
    let userToken: string | undefined = circleSessions.get(userId)?.userToken
    if (!userToken) {
      const tokenRes = await fetch(`${CIRCLE_API_BASE}/users/token`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      })
      if (!tokenRes.ok) {
        const detail = await tokenRes.text()
        console.error(`[circle/bet] token refresh failed status=${tokenRes.status} body=${detail}`)
        return NextResponse.json(
          { error: "Circle token refresh failed", detail },
          { status: 502 },
        )
      }
      const tokenJson = await tokenRes.json()
      userToken = tokenJson?.data?.userToken
      const encryptionKey = tokenJson?.data?.encryptionKey
      if (!userToken || !encryptionKey) {
        return NextResponse.json(
          { error: "Circle did not return userToken / encryptionKey" },
          { status: 502 },
        )
      }
      circleSessions.set(userId, { userId, userToken, encryptionKey })
    }

    const valueSmallestUnit = parseUnits(amount, USDC_DECIMALS).toString()

    // Circle's REST API takes feeLevel as a flat top-level field; the SDK
    // wraps it in `{ fee: { type: "level", config: { feeLevel } } }` but the
    // raw API rejects that shape with "'gasPrice' field may not be empty".
    const reqBody = {
      idempotencyKey: randomUUID(),
      walletId,
      contractAddress: USDC_ADDRESS,
      abiFunctionSignature: "transfer(address,uint256)",
      abiParameters: [escrow, valueSmallestUnit],
      feeLevel: "MEDIUM",
    }

    const res = await fetch(
      `${CIRCLE_API_BASE}/user/transactions/contractExecution`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "X-User-Token": userToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reqBody),
      },
    )
    if (!res.ok) {
      const detail = await res.text()
      console.error(
        `[circle/bet] contractExecution failed status=${res.status} body=${detail}`,
      )
      return NextResponse.json(
        { error: "Circle contractExecution failed", status: res.status, detail },
        { status: 502 },
      )
    }
    const json = (await res.json()) as {
      data?: { challengeId?: string; id?: string; transactionId?: string }
    }
    const challengeId = json?.data?.challengeId
    // Circle's contractExecution response only includes challengeId per docs,
    // but some envs include id/transactionId — capture if present, otherwise
    // the client falls back to /api/circle/latest-tx after sdk.execute.
    const transactionId = json?.data?.id ?? json?.data?.transactionId
    if (!challengeId) {
      console.error(
        `[circle/bet] no challengeId in response body=${JSON.stringify(json)}`,
      )
      return NextResponse.json(
        { error: "Circle did not return challengeId" },
        { status: 502 },
      )
    }
    return NextResponse.json({ challengeId, transactionId })
  } catch (err: any) {
    console.error("[circle/bet] unhandled:", err?.stack ?? err?.message ?? err)
    return NextResponse.json({ error: err?.message ?? "unknown" }, { status: 500 })
  }
}
