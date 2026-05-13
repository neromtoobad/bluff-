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
      // When using the real Circle UCW flow, the client SDK provisions the
      // wallet and reports the address back here.
      walletAddress?: string
    }
    const { userId, otp, walletAddress: clientWallet } = body
    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }

    // --- MOCK PATH ---
    if (isMockMode()) {
      if (!otp) {
        return NextResponse.json({ error: "otp required" }, { status: 400 })
      }
      const expected = mockOtps.get(userId)
      if (!expected) {
        return NextResponse.json({ error: "no pending OTP for user" }, { status: 401 })
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

    // --- REAL CIRCLE PATH ---
    const apiKey = process.env.CIRCLE_API_KEY!
    const session = circleSessions.get(userId)

    // The client SDK is the source of truth for the provisioned wallet
    // address in UCW. If the client already finished SDK setup and
    // reported the address, persist it.
    if (clientWallet && /^0x[a-fA-F0-9]{40}$/.test(clientWallet)) {
      return NextResponse.json({ walletAddress: clientWallet })
    }

    if (!session) {
      return NextResponse.json(
        { error: "no Circle session — call /init first" },
        { status: 400 },
      )
    }

    // Try to list any wallets already provisioned for this user.
    const listRes = await fetch(`${CIRCLE_API_BASE}/wallets`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "X-User-Token": session.userToken,
      },
    })
    if (listRes.ok) {
      const json = (await listRes.json()) as {
        data?: { wallets?: Array<{ address?: string }> }
      }
      const address = json?.data?.wallets?.[0]?.address
      if (address) return NextResponse.json({ walletAddress: address })
    }

    return NextResponse.json(
      {
        error:
          "wallet not yet provisioned — complete the Circle Web SDK flow with the userToken from /init, then POST { userId, walletAddress } here",
      },
      { status: 409 },
    )
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "unknown" }, { status: 500 })
  }
}
