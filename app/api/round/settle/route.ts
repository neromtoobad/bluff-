import { NextResponse } from "next/server"
import {
  getRound,
  saveRound,
  type Bet,
  type SettleReceipt,
} from "@/lib/bluff-state"
import { applyResult, multiplierFor } from "@/lib/streaks"
import { recordRound } from "@/lib/stats"
import { pushEvent } from "@/lib/feed"
import { generateTell } from "@/lib/bluff-claude"
import { sendUSDCFromEscrow } from "@/lib/arc-viem"
import { arcExplorerTx } from "@/lib/chains"
import { verifyRound } from "@/lib/round-token"
import type { Address } from "viem"

export const runtime = "nodejs"
export const maxDuration = 60

type UserBetInput = {
  walletAddress: string
  pick: "A" | "B"
  amount: string
  txHash?: string
  explorerUrl?: string
}

export async function POST(req: Request) {
  let body: {
    roundId?: string
    roundToken?: string
    // Solo-play fallback: when this lambda has no in-memory bet record
    // (because /bet ran on a different lambda on Vercel), the client passes
    // its own bet info and we settle from that.
    userBet?: UserBetInput
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 })
  }
  const { roundId, roundToken, userBet } = body
  if (!roundId) return NextResponse.json({ error: "roundId required" }, { status: 400 })

  // Hydrate round from memory or signed token.
  let round = getRound(roundId)
  if (!round && roundToken) {
    try {
      const decoded = verifyRound(roundToken)
      if (decoded.id !== roundId) {
        return NextResponse.json({ error: "round token / id mismatch" }, { status: 400 })
      }
      saveRound({
        id: decoded.id,
        topic: decoded.topic,
        topicSource: decoded.topicSource,
        topicUrl: decoded.topicUrl ?? undefined,
        liar: decoded.liar,
        truth: decoded.truth,
        source: decoded.source,
        claimA: decoded.claimA,
        claimB: decoded.claimB,
        createdAt: Date.now(),
        streamingDoneAt: 0,
        bettingDeadline: decoded.bettingDeadline,
        revealAt: decoded.bettingDeadline,
        bets: [],
      })
      round = getRound(roundId)
    } catch (e: any) {
      return NextResponse.json(
        { error: `invalid round token: ${e?.message ?? e}` },
        { status: 400 },
      )
    }
  }
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

  // If memory has zero bets (likely on Vercel cross-lambda case), trust the
  // client's userBet — it's only useful for settling their own outcome, and
  // the verifyUSDCTransfer step in /api/round/bet already authenticated
  // walletAddress + amount + txHash on-chain before we got here.
  let bets: Bet[] = round.bets
  if (bets.length === 0 && userBet?.walletAddress && userBet?.pick && userBet?.amount) {
    if (!/^0x[a-fA-F0-9]{40}$/.test(userBet.walletAddress)) {
      return NextResponse.json({ error: "invalid userBet.walletAddress" }, { status: 400 })
    }
    if (userBet.pick !== "A" && userBet.pick !== "B") {
      return NextResponse.json({ error: "invalid userBet.pick" }, { status: 400 })
    }
    if (!/^\d+(\.\d{1,6})?$/.test(userBet.amount) || Number(userBet.amount) <= 0) {
      return NextResponse.json({ error: "invalid userBet.amount" }, { status: 400 })
    }
    bets = [
      {
        walletAddress: userBet.walletAddress.toLowerCase(),
        pick: userBet.pick,
        amount: userBet.amount,
        placedAt: Date.now(),
        txHash: userBet.txHash,
        explorerUrl: userBet.explorerUrl,
      },
    ]
  }

  const receipts: SettleReceipt[] = []

  for (const bet of bets) {
    // bet.pick = agent the user thinks is TELLING THE TRUTH.
    // Win iff they did NOT pick the liar.
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
