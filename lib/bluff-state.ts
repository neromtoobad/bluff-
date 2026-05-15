export type Side = "A" | "B"

export type Bet = {
  userId: string
  pick: Side // which agent the user thinks is LYING
  amount: number
  placedAt: number
}

export type Round = {
  id: string
  topic: string
  liar: Side
  truth: string // the verifiable truth
  source: string // citation URL or label
  claimA: string // 3-sentence claim from Agent A
  claimB: string // 3-sentence claim from Agent B
  createdAt: number
  streamingDoneAt: number // when both claims have finished streaming
  bettingDeadline: number // unix ms — bets close at this point
  revealAt: number // same as bettingDeadline
  bets: Bet[]
}

const rounds = new Map<string, Round>()

export function saveRound(r: Round) {
  rounds.set(r.id, r)
}

export function getRound(id: string): Round | undefined {
  return rounds.get(id)
}

export function addBet(roundId: string, bet: Bet): Round | undefined {
  const r = rounds.get(roundId)
  if (!r) return undefined
  if (Date.now() > r.bettingDeadline) return r
  // one bet per user per round
  if (r.bets.some((b) => b.userId === bet.userId)) return r
  r.bets.push(bet)
  return r
}

export function totals(roundId: string): { A: number; B: number; pot: number } {
  const r = rounds.get(roundId)
  if (!r) return { A: 0, B: 0, pot: 0 }
  let A = 0
  let B = 0
  for (const b of r.bets) {
    if (b.pick === "A") A += b.amount
    else B += b.amount
  }
  return { A, B, pot: A + B }
}
