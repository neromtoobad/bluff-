import { NextResponse } from "next/server"
import { CIRCLE_API_BASE } from "@/lib/circle-wallets"
import {
  circleSessions,
  deriveMockAddress,
  isMockMode,
  mockOtps,
} from "../init/route"

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
    const session = circleSessions.get(userId)
    if (!session) {
      return NextResponse.json(
        { error: "no Circle session — call /init first" },
        { status: 400 },
      )
    }

    const listRes = await fetch(
      `${CIRCLE_API_BASE}/wallets?userId=${encodeURIComponent(userId)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "X-User-Token": session.userToken,
        },
      },
    )
    if (!listRes.ok) {
      const detail = await listRes.text()
      console.error(
        `[auth/verify] GET /wallets failed status=${listRes.status} body=${detail}`,
      )
      return NextResponse.json(
        {
          error: "Circle wallets list failed",
          status: listRes.status,
          detail,
        },
        { status: 502 },
      )
    }
    const json = (await listRes.json()) as {
      data?: { wallets?: Array<{ address?: string; blockchain?: string }> }
    }
    // Prefer an Arc testnet wallet; otherwise take the first one returned.
    const wallets = json?.data?.wallets ?? []
    const arcWallet = wallets.find((w) => w.blockchain === "ARC-TESTNET")
    const address = arcWallet?.address ?? wallets[0]?.address
    if (!address) {
      return NextResponse.json(
        {
          error:
            "wallet not yet provisioned — complete the Circle Web SDK PIN flow with the userToken from /init, then retry",
        },
        { status: 409 },
      )
    }

    return NextResponse.json({ walletAddress: address })
  } catch (err: any) {
    console.error("[auth/verify] unhandled error:", err?.stack ?? err?.message ?? err)
    return NextResponse.json({ error: err?.message ?? "unknown" }, { status: 500 })
  }
}
