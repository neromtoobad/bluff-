// Shared in-memory bet store. Replace with a DB later.
export type Side = "A" | "B"

export type Bet = {
  walletAddress: string
  side: Side
  amount: string // USDC as string, e.g. "1.00"
  placedAt: number
  txHash?: string // present when bet was funded onchain (browser wallet)
  explorerUrl?: string
}

// Module-level singleton survives across route invocations in dev.
const g = globalThis as unknown as { __bets?: Map<string, Bet> }
export const bets: Map<string, Bet> = g.__bets ?? new Map<string, Bet>()
if (!g.__bets) g.__bets = bets

export function totalsBySide(): {
  A: { amount: number; bettors: number }
  B: { amount: number; bettors: number }
} {
  const out = { A: { amount: 0, bettors: 0 }, B: { amount: 0, bettors: 0 } }
  for (const b of bets.values()) {
    out[b.side].amount += Number(b.amount)
    out[b.side].bettors += 1
  }
  return out
}
