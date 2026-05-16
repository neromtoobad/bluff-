import { NextResponse } from "next/server"
import { addBet, getRound, saveRound, type Side } from "@/lib/bluff-state"
import { verifyUSDCTransfer } from "@/lib/arc-viem"
import { arcExplorerTx } from "@/lib/chains"
import { verifyRound } from "@/lib/round-token"
import type { Address, Hex } from "viem"

export const runtime = "nodejs"

export async function POST(req: Request) {
  let body: {
    roundId?: string
    roundToken?: string
    walletAddress?: string
    pick?: Side
    amount?: string
    txHash?: string
    explorerUrl?: string
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 })
  }

  const { roundId, walletAddress, pick, amount, txHash } = body
  if (!roundId) return NextResponse.json({ error: "roundId required" }, { status: 400 })
  if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
    return NextResponse.json({ error: "valid walletAddress required" }, { status: 400 })
  }
  if (pick !== "A" && pick !== "B") {
    return NextResponse.json({ error: "pick must be 'A' or 'B'" }, { status: 400 })
  }
  if (!amount || !/^\d+(\.\d{1,6})?$/.test(amount) || Number(amount) <= 0) {
    return NextResponse.json({ error: "amount must be positive USDC string" }, { status: 400 })
  }
  if (!txHash || !/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
    return NextResponse.json(
      { error: "txHash (32-byte hex) required — bets must be on-chain" },
      { status: 400 },
    )
  }

  // Memory first; hydrate from signed token if this lambda didn't run /start.
  let round = getRound(roundId)
  if (!round && body.roundToken) {
    try {
      const decoded = verifyRound(body.roundToken)
      if (decoded.id !== roundId) {
        return NextResponse.json({ error: "round token / id mismatch" }, { status: 400 })
      }
      // Materialize into the in-memory store so settle (likely same lambda
      // if user clicks fast) can find it without round-token round-trip.
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
  if (Date.now() > round.bettingDeadline) {
    return NextResponse.json({ error: "betting closed" }, { status: 409 })
  }

  const escrow = process.env.NEXT_PUBLIC_ARENA_ESCROW_ADDRESS
  if (!escrow || !/^0x[a-fA-F0-9]{40}$/.test(escrow)) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_ARENA_ESCROW_ADDRESS not set" },
      { status: 500 },
    )
  }

  // Verify the USDC Transfer on-chain. Trusting only what we can confirm.
  const verification = await verifyUSDCTransfer({
    hash: txHash as Hex,
    from: walletAddress as Address,
    to: escrow as Address,
    expectedAmountUSDC: amount,
  })
  if (!verification.ok) {
    return NextResponse.json(
      { error: `on-chain verification failed: ${verification.reason}` },
      { status: 402 },
    )
  }

  const explorerUrl = arcExplorerTx(txHash)

  const { round: r, error } = addBet(roundId, {
    walletAddress,
    pick,
    amount,
    placedAt: Date.now(),
    txHash,
    explorerUrl,
  })
  if (error || !r) {
    return NextResponse.json({ error: error ?? "bet rejected" }, { status: 409 })
  }

  // Single-player demo flow: once the bet is in, there's no reason to keep
  // the betting window open. Collapse the deadline so the SSE wait wakes
  // up immediately and the reveal fires.
  r.bettingDeadline = Date.now()
  r.revealAt = r.bettingDeadline

  return NextResponse.json({
    ok: true,
    bet: {
      walletAddress: walletAddress.toLowerCase(),
      pick,
      amount,
      txHash,
      explorerUrl,
    },
    // Include reveal payload so the client can short-circuit the SSE wait
    // and show the answer immediately. The roundToken/in-memory round is
    // already authenticated; trust its liar/truth.
    reveal: {
      liar: round.liar,
      truth: round.truth,
      source: round.source,
    },
  })
}
