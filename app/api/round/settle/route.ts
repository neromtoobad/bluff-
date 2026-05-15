import { NextResponse } from "next/server"
import { getRound, type SettleReceipt } from "@/lib/bluff-state"
import { applyResult, multiplierFor } from "@/lib/streaks"
import { recordRound } from "@/lib/stats"
import { pushEvent } from "@/lib/feed"
import { generateTell } from "@/lib/bluff-claude"
import { sendUSDCFromEscrow } from "@/lib/arc-viem"
import { arcExplorerTx } from "@/lib/chains"
import type { Address } from "viem"

export const runtime = "nodejs"

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
    return NextResponse.json({
      ok: true,
      receipts: round.receipts,
      tell: round.tell,
      alreadySettled: true,
    })
  }

  const receipts: SettleReceipt[] = []

  for (const bet of round.bets) {
    // bet.pick is the agent the user thinks is TELLING THE TRUTH.
    // They win iff they did NOT pick the liar.
    const won = bet.pick !== round.liar
    const streakAfter = applyResult(bet.walletAddress, won)

    if (!won) {
      recordRound(bet.walletAddress, false, 0)
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
    let payoutError: string | undefined
    try {
      const hash = await sendUSDCFromEscrow(bet.walletAddress as Address, payout)
      txHash = hash
      explorerUrl = arcExplorerTx(hash)
    } catch (err: any) {
      payoutError = err?.shortMessage ?? err?.message ?? "payout failed"
      console.warn(
        `[settle] payout failed for ${bet.walletAddress} ($${payout}):`,
        payoutError,
      )
    }

    recordRound(bet.walletAddress, true, Number(payout))
    pushEvent({
      walletAddress: bet.walletAddress,
      amountUSDC: Number(payout),
      streak: streakAfter,
      multiplier: mult,
    })

    receipts.push({
      walletAddress: bet.walletAddress,
      won: true,
      payout,
      multiplier: mult,
      streakAfter,
      txHash,
      explorerUrl,
      ...(payoutError ? { error: payoutError } : {}),
    } as SettleReceipt & { error?: string })
  }

  round.settledAt = Date.now()
  round.receipts = receipts
  try {
    round.tell = await generateTell(
      round.topic,
      round.liar === "A" ? round.claimB : round.claimA,
      round.liar === "A" ? round.claimA : round.claimB,
      round.liar,
    )
  } catch {}

  return NextResponse.json({ ok: true, receipts, tell: round.tell })
}
