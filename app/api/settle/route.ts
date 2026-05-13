import { NextResponse } from "next/server"
import { bets } from "@/lib/bets"
import {
  addPayout,
  debateState,
  setSettlement,
  updatePayout,
} from "@/lib/debate-state"
import { getKit, type SendResult } from "@/lib/arc"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// TODO: replace with ERC-8183 contract — payouts should settle out of
// an on-chain escrow once the contract is deployed. For now, the
// treasury wallet pays winners directly via kit.send().
export async function POST() {
  const verdict = debateState.verdict
  if (!verdict) {
    return NextResponse.json({ error: "no verdict yet" }, { status: 400 })
  }
  if (debateState.settlement === "running") {
    return NextResponse.json({ error: "settlement already running" }, { status: 409 })
  }
  if (debateState.settlement === "done") {
    return NextResponse.json({
      ok: true,
      payouts: debateState.payouts,
      reused: true,
    })
  }

  const allBets = Array.from(bets.values())
  const winners = allBets.filter((b) => b.side === verdict.winner)
  if (winners.length === 0) {
    setSettlement("done")
    return NextResponse.json({ ok: true, payouts: [], reason: "no winning bets" })
  }

  const totalPot = allBets.reduce((acc, b) => acc + Number(b.amount), 0)
  const winningStake = winners.reduce((acc, b) => acc + Number(b.amount), 0)

  setSettlement("running")

  // Pre-record each payout in pending state so the UI can show progress.
  const planned = winners.map((b) => {
    const share = Number(b.amount) / winningStake
    const payoutNum = totalPot * share
    const entry = addPayout({
      walletAddress: b.walletAddress,
      bet: Number(b.amount).toFixed(2),
      share: share.toFixed(4),
      payout: payoutNum.toFixed(2),
      state: "pending",
    })
    return { bet: b, entry, payoutAmount: payoutNum.toFixed(2) }
  })

  // TODO: replace with ERC-8183 contract — single settlement call instead
  // of a per-winner kit.send loop.
  let anyFailed = false
  try {
    const { kit, adapter } = getKit()
    for (const p of planned) {
      try {
        const result = (await kit.send({
          from: { adapter, chain: "Arc_Testnet" },
          to: p.bet.walletAddress,
          amount: p.payoutAmount,
          token: "USDC",
        })) as SendResult
        updatePayout(p.bet.walletAddress, {
          state: result.state === "success" ? "success" : "failed",
          txHash: result.txHash,
          explorerUrl: result.explorerUrl,
        })
        if (result.state !== "success") anyFailed = true
      } catch (err: any) {
        anyFailed = true
        updatePayout(p.bet.walletAddress, {
          state: "failed",
          error: err?.message ?? "send failed",
        })
      }
    }
  } catch (err: any) {
    // getKit() failed (missing treasury key, etc.) — mark all pending as failed.
    for (const p of planned) {
      updatePayout(p.bet.walletAddress, {
        state: "failed",
        error: err?.message ?? "kit unavailable",
      })
    }
    setSettlement("error")
    return NextResponse.json(
      { error: err?.message ?? "settlement failed", payouts: debateState.payouts },
      { status: 500 },
    )
  }

  setSettlement(anyFailed ? "error" : "done")
  return NextResponse.json({ ok: !anyFailed, payouts: debateState.payouts })
}
