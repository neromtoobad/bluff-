import { NextResponse } from "next/server"
import { bets } from "@/lib/bets"
import {
  addPayout,
  debateState,
  setSettlement,
  updatePayout,
} from "@/lib/debate-state"
import { getKit } from "@/lib/arc"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const EXPLORER_BASE =
  process.env.NEXT_PUBLIC_ARC_EXPLORER_URL ?? "https://explorer.arc.network"

function explorerLink(txHash: string): string {
  return `${EXPLORER_BASE}/tx/${txHash}`
}

type SpendResult = {
  txHash?: string
  explorerUrl?: string
  recipientAddress?: string
  destinationChain?: string
  state?: string
}

// TODO: replace with ERC-8183 contract — payouts should settle out of
// an on-chain escrow contract once it's deployed. For now, the treasury
// wallet doubles as the escrow address and pays winners directly.
export async function POST() {
  const verdict = debateState.verdict
  if (!verdict) {
    return NextResponse.json({ error: "no verdict yet" }, { status: 400 })
  }
  if (debateState.settlement === "running") {
    return NextResponse.json(
      { error: "settlement already running" },
      { status: 409 },
    )
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

  // Pre-record each payout in pending state so the UI shows progress.
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

  let anyFailed = false
  try {
    const { kit, adapter } = getKit()
    for (const p of planned) {
      try {
        // Real on-chain transfer from escrow (= treasury) → winner.
        // Same-chain Arc → Arc uses kit.send (no facilitator).
        const result = (await kit.send({
          from: { adapter, chain: "Arc_Testnet" },
          to: p.bet.walletAddress,
          amount: p.payoutAmount,
          token: "USDC",
        })) as SpendResult

        if (!result?.txHash) {
          anyFailed = true
          updatePayout(p.bet.walletAddress, {
            state: "failed",
            error: "no txHash returned",
          })
          continue
        }
        if (result.state && result.state !== "success") {
          anyFailed = true
          updatePayout(p.bet.walletAddress, {
            state: "failed",
            error: `state=${result.state}`,
            txHash: result.txHash,
            explorerUrl: result.explorerUrl ?? explorerLink(result.txHash),
          })
          continue
        }
        updatePayout(p.bet.walletAddress, {
          state: "success",
          txHash: result.txHash,
          explorerUrl: result.explorerUrl ?? explorerLink(result.txHash),
        })
      } catch (err: any) {
        anyFailed = true
        const msg = String(err?.message ?? err)
        updatePayout(p.bet.walletAddress, {
          state: "failed",
          error: /insufficient|balance|exceeds/i.test(msg)
            ? "escrow has insufficient USDC"
            : msg,
        })
      }
    }
  } catch (err: any) {
    // getKit() failed (missing treasury key) — all pending payouts fail.
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
