import { NextResponse } from "next/server"
import { bets, type Side } from "@/lib/bets"
import { getKit } from "@/lib/arc"

export const runtime = "nodejs"

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

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      walletAddress?: string
      side?: Side
      amount?: string
      txHash?: string
      explorerUrl?: string
    }
    const { walletAddress, side, amount } = body

    if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return NextResponse.json(
        { error: "valid walletAddress required" },
        { status: 400 },
      )
    }
    if (side !== "A" && side !== "B") {
      return NextResponse.json(
        { error: "side must be 'A' or 'B'" },
        { status: 400 },
      )
    }
    if (!amount || !/^\d+(\.\d{1,6})?$/.test(amount) || Number(amount) <= 0) {
      return NextResponse.json(
        { error: "amount must be positive USDC string" },
        { status: 400 },
      )
    }

    const escrow = process.env.NEXT_PUBLIC_ARENA_ESCROW_ADDRESS
    if (!escrow || !/^0x[a-fA-F0-9]{40}$/.test(escrow)) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_ARENA_ESCROW_ADDRESS not set" },
        { status: 500 },
      )
    }

    const key = walletAddress.toLowerCase()
    if (bets.has(key)) {
      return NextResponse.json(
        { error: "wallet already placed a bet" },
        { status: 409 },
      )
    }

    let txHash = body.txHash
    let explorerUrl = body.explorerUrl

    if (txHash) {
      // Browser-wallet (non-custodial) path: client already executed the
      // unifiedBalance.spend from the user's wallet → escrow and forwarded
      // the receipt. Trust the hash and record.
      if (!/^0x[a-fA-F0-9]+$/.test(txHash)) {
        return NextResponse.json(
          { error: "invalid txHash" },
          { status: 400 },
        )
      }
      explorerUrl = explorerUrl ?? explorerLink(txHash)
    } else {
      // Custodial path (email-mode users have no signing wallet of their
      // own): the treasury executes a real onchain unifiedBalance.spend
      // → escrow on the user's behalf. Treasury must have testnet USDC.
      try {
        const { kit, adapter } = getKit()
        const result = (await kit.unifiedBalance.spend({
          amount,
          from: { adapter },
          to: {
            adapter,
            chain: "Arc_Testnet",
            recipientAddress: escrow,
          },
        })) as SpendResult

        if (!result?.txHash) {
          return NextResponse.json(
            {
              error: "onchain spend produced no txHash",
              detail: result,
            },
            { status: 502 },
          )
        }
        if (result.state && result.state !== "success") {
          return NextResponse.json(
            { error: `onchain spend state=${result.state}` },
            { status: 502 },
          )
        }
        txHash = result.txHash
        explorerUrl = result.explorerUrl ?? explorerLink(txHash)
      } catch (err: any) {
        const msg = String(err?.message ?? err)
        const insufficient =
          /insufficient|balance|exceeds/i.test(msg)
        return NextResponse.json(
          {
            error: insufficient
              ? "treasury wallet has insufficient USDC — fund it from the Arc faucet"
              : "onchain spend failed",
            detail: msg,
          },
          { status: insufficient ? 402 : 500 },
        )
      }
    }

    const bet = {
      walletAddress,
      side,
      amount,
      placedAt: Date.now(),
      txHash: txHash!,
      explorerUrl: explorerUrl!,
    }
    bets.set(key, bet)

    return NextResponse.json({ ok: true, bet })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "unknown" },
      { status: 500 },
    )
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const addr = searchParams.get("walletAddress")
  if (!addr) {
    return NextResponse.json(
      { error: "walletAddress required" },
      { status: 400 },
    )
  }
  const bet = bets.get(addr.toLowerCase()) ?? null
  return NextResponse.json({ bet })
}
