import { NextResponse } from "next/server"
import { CIRCLE_API_BASE } from "@/lib/circle-wallets"
import {
  circleSessions,
  deriveMockAddress,
  isMockMode,
  mockOtps,
} from "@/lib/auth-state"

export const runtime = "nodejs"
// /verify retries up to ~12s waiting for Circle to index the new wallet,
// so the lambda needs a generous timeout. Pro tier honors 60s; Hobby caps
// at 60s for Node routes anyway.
export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      userId?: string
      otp?: string
      // The client SDK may report the provisioned wallet directly.
      walletAddress?: string
    }
    const { userId, otp, walletAddress: clientWallet } = body
    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }

    // ---------- MOCK PATH ----------
    if (isMockMode()) {
      if (!otp) {
        return NextResponse.json({ error: "otp required" }, { status: 400 })
      }
      const expected = mockOtps.get(userId)
      if (!expected) {
        return NextResponse.json(
          { error: "no pending OTP for user" },
          { status: 401 },
        )
      }
      if (otp !== expected && otp !== "424242") {
        return NextResponse.json({ error: "invalid OTP" }, { status: 401 })
      }
      mockOtps.delete(userId)
      return NextResponse.json({
        walletAddress: deriveMockAddress(userId),
        mock: true,
      })
    }

    // ---------- REAL CIRCLE W3S FLOW ----------
    // Two acceptable inputs:
    //  a) the client SDK already provisioned the wallet and is telling us
    //     the address — accept and return.
    //  b) we have to ask Circle for the user's wallet list ourselves.
    if (clientWallet && /^0x[a-fA-F0-9]{40}$/.test(clientWallet)) {
      return NextResponse.json({ walletAddress: clientWallet })
    }

    const apiKey = process.env.CIRCLE_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "CIRCLE_API_KEY not set" },
        { status: 500 },
      )
    }
    // Try in-memory session map first; on Vercel, /init may have landed on
    // a different lambda than /verify — in that case mint a fresh userToken
    // from Circle (same pattern as /api/circle/bet's fallback).
    let session = circleSessions.get(userId)
    if (!session) {
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
        console.error(
          `[auth/verify] token refresh failed status=${tokenRes.status} body=${detail}`,
        )
        return NextResponse.json(
          { error: "Circle token refresh failed", detail },
          { status: 502 },
        )
      }
      const tj = await tokenRes.json()
      const userToken = tj?.data?.userToken
      const encryptionKey = tj?.data?.encryptionKey
      if (!userToken || !encryptionKey) {
        return NextResponse.json(
          { error: "Circle did not return userToken / encryptionKey" },
          { status: 502 },
        )
      }
      session = { userId, userToken, encryptionKey }
      circleSessions.set(userId, session)
    }

    // Circle's /wallets index lags ~3-10s after PIN setup completes. Retry
    // with backoff so we don't fail just because Circle hasn't indexed yet.
    // User-controlled /wallets infers the user from X-User-Token and rejects
    // any `userId` query param.
    const MAX_ATTEMPTS = 8
    const DELAY_MS = 1500
    let picked:
      | { id?: string; address?: string; blockchain?: string }
      | undefined
    let lastErrorDetail = ""

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const listRes = await fetch(`${CIRCLE_API_BASE}/wallets`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "X-User-Token": session.userToken,
        },
      })
      if (!listRes.ok) {
        lastErrorDetail = await listRes.text()
        console.error(
          `[auth/verify] GET /wallets attempt=${attempt} failed status=${listRes.status} body=${lastErrorDetail}`,
        )
        return NextResponse.json(
          {
            error: "Circle wallets list failed",
            status: listRes.status,
            detail: lastErrorDetail,
          },
          { status: 502 },
        )
      }
      const json = (await listRes.json()) as {
        data?: {
          wallets?: Array<{
            id?: string
            address?: string
            blockchain?: string
          }>
        }
      }
      const wallets = json?.data?.wallets ?? []
      const arcWallet = wallets.find((w) => w.blockchain === "ARC-TESTNET")
      picked = arcWallet ?? wallets[0]
      if (picked?.address) break

      if (attempt < MAX_ATTEMPTS) {
        await new Promise((r) => setTimeout(r, DELAY_MS))
      }
    }

    if (!picked?.address) {
      console.warn(
        `[auth/verify] no wallet after ${MAX_ATTEMPTS} attempts for userId=${userId}`,
      )
      return NextResponse.json(
        {
          error:
            "wallet not yet provisioned by Circle — wait a few seconds and try again",
        },
        { status: 409 },
      )
    }

    return NextResponse.json({
      walletAddress: picked.address,
      walletId: picked.id,
      blockchain: picked.blockchain,
    })
  } catch (err: any) {
    console.error("[auth/verify] unhandled error:", err?.stack ?? err?.message ?? err)
    return NextResponse.json({ error: err?.message ?? "unknown" }, { status: 500 })
  }
}
