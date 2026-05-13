// Shared in-memory bet store. Replace with a DB later.
export type Side = "A" | "B"

export type Bet = {
  walletAddress: string
  side: Side
  amount: string // USDC as string, e.g. "1.00"
  placedAt: number
}

// Module-level singleton survives across route invocations in dev.
const g = globalThis as unknown as { __bets?: Map<string, Bet> }
export const bets: Map<string, Bet> = g.__bets ?? new Map<string, Bet>()
if (!g.__bets) g.__bets = bets

export function totalsBySide(): { A: number; B: number } {
  let A = 0
  let B = 0
  for (const b of bets.values()) {
    const n = Number(b.amount)
    if (b.side === "A") A += n
    else B += n
  }
  return { A, B }
}
