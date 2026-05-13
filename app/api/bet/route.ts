import { NextResponse } from "next/server"
import { bets, type Side } from "@/lib/bets"

export async function POST(req: Request) {
  try {
    const { walletAddress, side, amount, txHash, explorerUrl } =
      (await req.json()) as {
        walletAddress?: string
        side?: Side
        amount?: string
        txHash?: string
        explorerUrl?: string
      }

    if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return NextResponse.json({ error: "valid walletAddress required" }, { status: 400 })
    }
    if (side !== "A" && side !== "B") {
      return NextResponse.json({ error: "side must be 'A' or 'B'" }, { status: 400 })
    }
    if (!amount || !/^\d+(\.\d{1,6})?$/.test(amount) || Number(amount) <= 0) {
      return NextResponse.json({ error: "amount must be positive USDC string" }, { status: 400 })
    }

    const key = walletAddress.toLowerCase()
    if (bets.has(key)) {
      return NextResponse.json({ error: "wallet already placed a bet" }, { status: 409 })
    }

    const bet = {
      walletAddress,
      side,
      amount,
      placedAt: Date.now(),
      ...(txHash ? { txHash } : {}),
      ...(explorerUrl ? { explorerUrl } : {}),
    }
    bets.set(key, bet)

    return NextResponse.json({ ok: true, bet })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "unknown" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const addr = searchParams.get("walletAddress")
  if (!addr) {
    return NextResponse.json({ error: "walletAddress required" }, { status: 400 })
  }
  const bet = bets.get(addr.toLowerCase()) ?? null
  return NextResponse.json({ bet })
}
