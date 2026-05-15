import { NextResponse } from "next/server"
import { getRound, type SettleReceipt } from "@/lib/bluff-state"
import { applyResult, multiplierFor } from "@/lib/streaks"
import { getKit } from "@/lib/arc"

export const runtime = "nodejs"

const EXPLORER_BASE =
  process.env.NEXT_PUBLIC_ARC_EXPLORER_URL ?? "https://explorer.arc.network"
const explorerLink = (txHash: string) => `${EXPLORER_BASE}/tx/${txHash}`

type SpendResult = { txHash?: string; explorerUrl?: string; state?: string }

export async function POST(req: Request) {
  let body: { roundId?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 })
  }
  const { roundId } = body
  if (!roundId) return NextResponse.json({ error: "roundId required" }, { status: 400 })

  const round = getRound(roundId)
  if (!round) return NextResponse.json({ error: "round not found" }, { status: 404 })
  if (Date.now() < round.bettingDeadline) {
    return NextResponse.json({ error: "round not ready to settle" }, { status: 409 })
  }

  if (round.settledAt && round.receipts) {
    return NextResponse.json({ ok: true, receipts: round.receipts, alreadySettled: true })
  }

  const receipts: SettleReceipt[] = []

  for (const bet of round.bets) {
    const won = bet.pick === round.liar
    const streakAfter = applyResult(bet.walletAddress, won)

    if (!won) {
      receipts.push({
        walletAddress: bet.walletAddress,
        won: false,
        payout: "0.00",
        multiplier: 0,
        streakAfter,
      })
      continue
    }

    const mult = multiplierFor(streakAfter)
    const payout = (Number(bet.amount) * mult).toFixed(2)

    let txHash: string | undefined
    let explorerUrl: string | undefined
    try {
      const { kit, adapter } = getKit()
      const result = (await kit.send({
        from: { adapter, chain: "Arc_Testnet" },
        to: bet.walletAddress,
        amount: payout,
        token: "USDC",
      })) as SpendResult
      txHash = result?.txHash
      explorerUrl = result?.explorerUrl ?? (txHash ? explorerLink(txHash) : undefined)
    } catch (err: any) {
      // Payout failed — record without txHash so it can be retried manually.
      receipts.push({
        walletAddress: bet.walletAddress,
        won: true,
        payout,
        multiplier: mult,
        streakAfter,
      })
      continue
    }

    receipts.push({
      walletAddress: bet.walletAddress,
      won: true,
      payout,
      multiplier: mult,
      streakAfter,
      txHash,
      explorerUrl,
    })
  }

  round.settledAt = Date.now()
  round.receipts = receipts

  return NextResponse.json({ ok: true, receipts })
}
