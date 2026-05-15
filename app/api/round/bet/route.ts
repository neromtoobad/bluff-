import { NextResponse } from "next/server"
import { addBet, getRound, type Side } from "@/lib/bluff-state"
import { getKit } from "@/lib/arc"

export const runtime = "nodejs"

const EXPLORER_BASE =
  process.env.NEXT_PUBLIC_ARC_EXPLORER_URL ?? "https://explorer.arc.network"

const explorerLink = (txHash: string) => `${EXPLORER_BASE}/tx/${txHash}`

type SpendResult = {
  txHash?: string
  explorerUrl?: string
  state?: string
}

export async function POST(req: Request) {
  let body: {
    roundId?: string
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

  const { roundId, walletAddress, pick, amount } = body
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

  const round = getRound(roundId)
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

  let txHash = body.txHash
  let explorerUrl = body.explorerUrl

  if (txHash) {
    if (!/^0x[a-fA-F0-9]+$/.test(txHash)) {
      return NextResponse.json({ error: "invalid txHash" }, { status: 400 })
    }
    explorerUrl = explorerUrl ?? explorerLink(txHash)
  } else {
    // Custodial path: treasury escrows on the user's behalf. Email-mode
    // users have no signing key in the browser.
    try {
      const { kit, adapter } = getKit()
      const result = (await kit.send({
        from: { adapter, chain: "Arc_Testnet" },
        to: escrow,
        amount,
        token: "USDC",
      })) as SpendResult
      if (!result?.txHash) {
        return NextResponse.json(
          { error: "onchain transfer produced no txHash", detail: result },
          { status: 502 },
        )
      }
      if (result.state && result.state !== "success") {
        return NextResponse.json(
          { error: `onchain transfer state=${result.state}` },
          { status: 502 },
        )
      }
      txHash = result.txHash
      explorerUrl = result.explorerUrl ?? explorerLink(txHash)
    } catch (err: any) {
      const msg = String(err?.message ?? err)
      const insufficient = /insufficient|balance|exceeds/i.test(msg)
      const networkFail = /network connection|rpc|timeout|econnrefused/i.test(msg)
      return NextResponse.json(
        {
          error: insufficient
            ? "treasury wallet has insufficient USDC — fund it from the Arc faucet"
            : networkFail
              ? "Arc testnet RPC unreachable — try again in a moment"
              : "onchain transfer failed",
          detail: msg,
        },
        { status: insufficient ? 402 : 500 },
      )
    }
  }

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

  return NextResponse.json({
    ok: true,
    bet: {
      walletAddress: walletAddress.toLowerCase(),
      pick,
      amount,
      txHash,
      explorerUrl,
    },
  })
}
