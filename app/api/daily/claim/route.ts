import { NextResponse } from "next/server"
import { DAILY_AMOUNT, hasClaimedToday, markClaimed } from "@/lib/daily"
import { getKit } from "@/lib/arc"

export const runtime = "nodejs"

const EXPLORER_BASE =
  process.env.NEXT_PUBLIC_ARC_EXPLORER_URL ?? "https://explorer.arc.network"
const explorerLink = (txHash: string) => `${EXPLORER_BASE}/tx/${txHash}`

type SpendResult = { txHash?: string; explorerUrl?: string; state?: string }

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
    const { kit, adapter } = getKit()
    const result = (await kit.send({
      from: { adapter, chain: "Arc_Testnet" },
      to: walletAddress,
      amount: DAILY_AMOUNT,
      token: "USDC",
    })) as SpendResult

    if (!result?.txHash) {
      return NextResponse.json(
        { error: "daily payout produced no txHash" },
        { status: 502 },
      )
    }
    markClaimed(walletAddress)
    return NextResponse.json({
      ok: true,
      amount: DAILY_AMOUNT,
      txHash: result.txHash,
      explorerUrl: result.explorerUrl ?? explorerLink(result.txHash),
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: "daily payout failed", detail: String(err?.message ?? err) },
      { status: 500 },
    )
  }
}
