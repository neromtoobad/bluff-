import { NextResponse } from "next/server"
import { CIRCLE_API_BASE } from "@/lib/circle-wallets"

export async function POST(req: Request) {
  try {
    const { userId, otp } = (await req.json()) as { userId?: string; otp?: string }
    if (!userId || !otp) {
      return NextResponse.json({ error: "userId and otp required" }, { status: 400 })
    }

    const apiKey = process.env.CIRCLE_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "CIRCLE_API_KEY not set" }, { status: 500 })
    }

    const headers = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    }

    // 1. Verify OTP.
    const verifyRes = await fetch(`${CIRCLE_API_BASE}/users/email/otp/verify`, {
      method: "POST",
      headers,
      body: JSON.stringify({ userId, otp }),
    })
    if (!verifyRes.ok) {
      const text = await verifyRes.text()
      return NextResponse.json({ error: "OTP verify failed", detail: text }, { status: 401 })
    }

    // 2. Ensure a wallet exists for this user on Arc testnet, then return its address.
    //    Circle will no-op if the wallet already exists for this idempotency key.
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

    // Fallback: list existing wallets if create returned no address.
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
