export type Side = "A" | "B"

export type Bet = {
  walletAddress: string // lowercased
  pick: Side // which agent the user thinks is LYING
  amount: string // USDC as string, e.g. "1.00"
  placedAt: number
  txHash?: string // escrow funding tx (browser wallet) or treasury custodial transfer
  explorerUrl?: string
}

export type SettleReceipt = {
  walletAddress: string
  won: boolean
  payout: string // USDC string ("0.00" when lost)
  multiplier: number // applied at payout time
  streakAfter: number
  txHash?: string
  explorerUrl?: string
}

export type Round = {
  id: string
  topic: string
  topicSource?: "twitter" | "trends" | "pool"
  topicUrl?: string
  liar: Side
  truth: string
  source: string
  claimA: string
  claimB: string
  createdAt: number
  streamingDoneAt: number
  bettingDeadline: number
  revealAt: number
  bets: Bet[]
  settledAt?: number
  receipts?: SettleReceipt[]
  tell?: string
}

// Module-level singleton so dev HMR / multiple route invocations share state.
const g = globalThis as unknown as { __bluffRounds?: Map<string, Round> }
const rounds: Map<string, Round> = g.__bluffRounds ?? new Map<string, Round>()
if (!g.__bluffRounds) g.__bluffRounds = rounds

export function saveRound(r: Round) {
  rounds.set(r.id, r)
}

export function getRound(id: string): Round | undefined {
  return rounds.get(id)
}

export function addBet(
  roundId: string,
  bet: Bet,
): { round?: Round; error?: string } {
  const r = rounds.get(roundId)
  if (!r) return { error: "round not found" }
  if (Date.now() > r.bettingDeadline) return { error: "betting closed" }
  const key = bet.walletAddress.toLowerCase()
  if (r.bets.some((b) => b.walletAddress === key)) {
    return { error: "wallet already placed a bet on this round" }
  }
  r.bets.push({ ...bet, walletAddress: key })
  return { round: r }
}

export function totals(roundId: string): { A: number; B: number; pot: number } {
  const r = rounds.get(roundId)
  if (!r) return { A: 0, B: 0, pot: 0 }
  let A = 0
  let B = 0
  for (const b of r.bets) {
    const n = Number(b.amount)
    if (b.pick === "A") A += n
    else B += n
  }
  return { A, B, pot: A + B }
}
