// Shared in-memory snapshot of the live debate. The /api/debate stream
// writes into this as it runs; /api/debate/state reads from it.

import { AGENT_STARTING_BALANCE_USDC } from "@/lib/x402"
import type { Turn } from "@/lib/agents"

export type Verdict = {
  winner: "A" | "B"
  scores: {
    A: { logic: number; evidence: number; persuasiveness: number; total: number }
    B: { logic: number; evidence: number; persuasiveness: number; total: number }
  }
  summary: string
}

export type ResearchEntry = {
  agent: "A" | "B"
  round: number
  cost: number
  insight: string
  at: number
  service?: string
  txHash?: string
}

export type Payout = {
  walletAddress: string
  bet: string
  share: string
  payout: string
  state: "pending" | "success" | "failed"
  txHash?: string
  explorerUrl?: string
  error?: string
  at: number
}

export type DebateSnapshot = {
  topic: string | null
  round: number
  status: "idle" | "running" | "judging" | "done" | "error"
  balances: { A: number; B: number }
  starting: number
  research: ResearchEntry[]
  transcript: Turn[]
  verdict: Verdict | null
  settlement: "idle" | "running" | "done" | "error"
  payouts: Payout[]
  startedAt: number | null
  updatedAt: number
}

const g = globalThis as unknown as { __debate?: DebateSnapshot }

function fresh(): DebateSnapshot {
  return {
    topic: null,
    round: 0,
    status: "idle",
    balances: { A: AGENT_STARTING_BALANCE_USDC, B: AGENT_STARTING_BALANCE_USDC },
    starting: AGENT_STARTING_BALANCE_USDC,
    research: [],
    transcript: [],
    verdict: null,
    settlement: "idle",
    payouts: [],
    startedAt: null,
    updatedAt: Date.now(),
  }
}

export const debateState: DebateSnapshot = g.__debate ?? fresh()
if (!g.__debate) g.__debate = debateState

export function resetDebate(topic: string): void {
  const s = debateState
  s.topic = topic
  s.round = 0
  s.status = "running"
  s.balances = { A: AGENT_STARTING_BALANCE_USDC, B: AGENT_STARTING_BALANCE_USDC }
  s.research = []
  s.transcript = []
  s.verdict = null
  s.settlement = "idle"
  s.payouts = []
  s.startedAt = Date.now()
  s.updatedAt = Date.now()
}

export function setRound(round: number): void {
  debateState.round = round
  debateState.updatedAt = Date.now()
}

export function recordResearch(entry: Omit<ResearchEntry, "at">): void {
  debateState.research.push({ ...entry, at: Date.now() })
  debateState.balances[entry.agent] = Math.max(
    0,
    debateState.balances[entry.agent] - entry.cost,
  )
  debateState.updatedAt = Date.now()
}

export function recordTurn(turn: Turn): void {
  debateState.transcript.push(turn)
  debateState.updatedAt = Date.now()
}

export function setStatus(status: DebateSnapshot["status"]): void {
  debateState.status = status
  debateState.updatedAt = Date.now()
}

export function setVerdict(v: Verdict): void {
  debateState.verdict = v
  debateState.status = "done"
  debateState.updatedAt = Date.now()
}

export function setSettlement(status: DebateSnapshot["settlement"]): void {
  debateState.settlement = status
  debateState.updatedAt = Date.now()
}

export function addPayout(p: Omit<Payout, "at">): Payout {
  const entry: Payout = { ...p, at: Date.now() }
  debateState.payouts.push(entry)
  debateState.updatedAt = Date.now()
  return entry
}

export function updatePayout(
  walletAddress: string,
  patch: Partial<Payout>,
): void {
  const p = debateState.payouts.find(
    (x) => x.walletAddress.toLowerCase() === walletAddress.toLowerCase(),
  )
  if (!p) return
  Object.assign(p, patch)
  debateState.updatedAt = Date.now()
}

export function finishDebate(status: "done" | "error" = "done"): void {
  debateState.status = status
  debateState.updatedAt = Date.now()
}
