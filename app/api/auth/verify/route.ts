import { NextResponse } from "next/server"
import { CIRCLE_API_BASE } from "@/lib/circle-wallets"
import { deriveMockAddress, isMockMode, mockOtps } from "../init/route"

export async function POST(req: Request) {
  try {
    const { userId, otp } = (await req.json()) as { userId?: string; otp?: string }
    if (!userId || !otp) {
      return NextResponse.json({ error: "userId and otp required" }, { status: 400 })
    }

    // --- MOCK PATH ---
    if (isMockMode()) {
      const expected = mockOtps.get(userId)
      if (!expected) {
        return NextResponse.json({ error: "no pending OTP for user" }, { status: 401 })
      }
      // Accept either the issued code or the universal demo code 424242.
      if (otp !== expected && otp !== "424242") {
        return NextResponse.json({ error: "invalid OTP" }, { status: 401 })
      }
      mockOtps.delete(userId)
      const walletAddress = deriveMockAddress(userId)
      return NextResponse.json({ walletAddress, mock: true })
    }

    // --- REAL CIRCLE PATH ---
    const apiKey = process.env.CIRCLE_API_KEY!
    const headers = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    }

    const verifyRes = await fetch(`${CIRCLE_API_BASE}/users/email/otp/verify`, {
      method: "POST",
      headers,
      body: JSON.stringify({ userId, otp }),
    })
    if (!verifyRes.ok) {
      const text = await verifyRes.text()
      return NextResponse.json({ error: "OTP verify failed", detail: text }, { status: 401 })
    }

    const walletRes = await fetch(`${CIRCLE_API_BASE}/user/wallets`, {
      method: "POST",
      headers: { ...headers, "X-User-Id": userId },
      body: JSON.stringify({
        idempotencyKey: `wallet-${userId}`,
        blockchains: ["ARC-TESTNET"],
        accountType: "SCA",
      }),
    })

    let walletAddress: string | undefined
    if (walletRes.ok) {
      const json = (await walletRes.json()) as {
        data?: { wallets?: Array<{ address?: string }> }
      }
      walletAddress = json?.data?.wallets?.[0]?.address
    }
    if (!walletAddress) {
      const listRes = await fetch(`${CIRCLE_API_BASE}/user/wallets`, {
        method: "GET",
        headers: { ...headers, "X-User-Id": userId },
      })
      if (listRes.ok) {
        const json = (await listRes.json()) as {
          data?: { wallets?: Array<{ address?: string }> }
        }
        walletAddress = json?.data?.wallets?.[0]?.address
      }
    }

    if (!walletAddress) {
      return NextResponse.json({ error: "wallet not provisioned" }, { status: 502 })
    }

    return NextResponse.json({ walletAddress })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "unknown" }, { status: 500 })
  }
}
