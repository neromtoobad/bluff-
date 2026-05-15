import { NextResponse } from "next/server"
import { DAILY_AMOUNT, hasClaimedToday, markClaimed } from "@/lib/daily"
import { sendUSDCFromEscrow } from "@/lib/arc-viem"
import { arcExplorerTx } from "@/lib/chains"
import type { Address } from "viem"

export const runtime = "nodejs"

export async function POST(req: Request) {
  let body: { walletAddress?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 })
  }
  const { walletAddress } = body
  if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
    return NextResponse.json({ error: "valid walletAddress required" }, { status: 400 })
  }
  if (hasClaimedToday(walletAddress)) {
    return NextResponse.json({ error: "already claimed today" }, { status: 409 })
  }

  try {
    const hash = await sendUSDCFromEscrow(walletAddress as Address, DAILY_AMOUNT)
    markClaimed(walletAddress)
    return NextResponse.json({
      ok: true,
      amount: DAILY_AMOUNT,
      txHash: hash,
      explorerUrl: arcExplorerTx(hash),
    })
  } catch (err: any) {
    return NextResponse.json(
      {
        error: "daily payout failed",
        detail: err?.shortMessage ?? err?.message ?? String(err),
      },
      { status: 500 },
    )
  }
}
