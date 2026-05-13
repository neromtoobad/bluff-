"use client"

import { useEffect, useState } from "react"

type Score = { logic: number; evidence: number; persuasiveness: number; total: number }
type Verdict = {
  winner: "A" | "B"
  scores: { A: Score; B: Score }
  summary: string
}
type Payout = {
  walletAddress: string
  bet: string
  share: string
  payout: string
  state: "pending" | "success" | "failed"
  txHash?: string
  explorerUrl?: string
  error?: string
}

type State = {
  status: "idle" | "running" | "judging" | "done" | "error"
  verdict: Verdict | null
  settlement: "idle" | "running" | "done" | "error"
  payouts: Payout[]
}

const POLL_MS = 1500

export default function ScoreBoard() {
  const [state, setState] = useState<State | null>(null)

  useEffect(() => {
    let cancelled = false
    async function tick() {
      try {
        const res = await fetch("/api/debate/state", { cache: "no-store" })
        if (!res.ok) return
        const json = (await res.json()) as State
        if (!cancelled) setState(json)
      } catch {}
    }
    tick()
    const id = setInterval(tick, POLL_MS)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  if (!state || state.status === "idle" || state.status === "running") return null

  if (state.status === "judging" && !state.verdict) {
    return (
      <div className="w-full max-w-4xl rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 text-center">
        <p className="text-sm text-zinc-300">Judge is reviewing the transcript…</p>
      </div>
    )
  }

  const v = state.verdict
  if (!v) return null

  const winnerLabel = v.winner === "A" ? "Agent A — FOR" : "Agent B — AGAINST"
  const banner =
    v.winner === "A"
      ? "border-emerald-700/60 bg-emerald-500/10 text-emerald-100"
      : "border-rose-700/60 bg-rose-500/10 text-rose-100"

  return (
    <div className="w-full max-w-4xl space-y-4">
      <div className={`rounded-2xl border ${banner} p-5 text-center`}>
        <p className="text-xs uppercase tracking-widest text-zinc-300">Winner</p>
        <p className="mt-1 text-2xl font-bold">{winnerLabel}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ScoreCard label="Agent A — FOR" tint="emerald" score={v.scores.A} winner={v.winner === "A"} />
        <ScoreCard label="Agent B — AGAINST" tint="rose" score={v.scores.B} winner={v.winner === "B"} />
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
        <p className="text-xs uppercase tracking-wider text-zinc-400 mb-2">Judge's verdict</p>
        <p className="text-sm leading-relaxed text-zinc-200">{v.summary}</p>
      </div>

      <SettlementPanel
        settlement={state.settlement}
        payouts={state.payouts ?? []}
      />
    </div>
  )
}

function shortAddr(a: string) {
  return a.length > 12 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a
}

function SettlementPanel({
  settlement,
  payouts,
}: {
  settlement: State["settlement"]
  payouts: Payout[]
}) {
  if (settlement === "idle") return null

  const label =
    settlement === "running"
      ? "Settling winners on Arc Testnet…"
      : settlement === "done"
        ? "Payouts settled"
        : "Settlement error"

  const labelTint =
    settlement === "done"
      ? "text-emerald-300"
      : settlement === "error"
        ? "text-rose-300"
        : "text-zinc-300"

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs uppercase tracking-wider text-zinc-400">
          USDC payout
        </p>
        <p className={`text-xs ${labelTint}`}>{label}</p>
      </div>

      {payouts.length === 0 ? (
        <p className="text-xs text-zinc-500 italic">
          {settlement === "running"
            ? "Computing winner shares…"
            : "No winning bets to pay."}
        </p>
      ) : (
        <div className="divide-y divide-zinc-800 rounded-xl border border-zinc-800 bg-zinc-950/60">
          {payouts.map((p) => (
            <div
              key={p.walletAddress}
              className="px-4 py-3 text-xs flex flex-wrap items-center gap-3"
            >
              <span className="font-mono text-zinc-200">
                {shortAddr(p.walletAddress)}
              </span>
              <span className="text-zinc-400">
                bet ${p.bet} → <span className="text-zinc-100">${p.payout}</span>
              </span>
              <span className="text-zinc-500">({Math.round(Number(p.share) * 100)}% share)</span>
              <span className="ml-auto">
                {p.state === "pending" && (
                  <span className="text-zinc-400">pending…</span>
                )}
                {p.state === "success" && p.explorerUrl && (
                  <a
                    href={p.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-300 hover:text-emerald-200 underline"
                  >
                    {p.txHash ? `${p.txHash.slice(0, 10)}…` : "view tx"}
                  </a>
                )}
                {p.state === "failed" && (
                  <span className="text-rose-400" title={p.error ?? ""}>
                    failed
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ScoreCard({
  label,
  score,
  tint,
  winner,
}: {
  label: string
  score: Score
  tint: "emerald" | "rose"
  winner: boolean
}) {
  const accent =
    tint === "emerald" ? "border-emerald-700/50" : "border-rose-700/50"
  return (
    <div
      className={`rounded-2xl border ${accent} bg-zinc-950/60 p-5 ${
        winner ? "ring-2 ring-offset-2 ring-offset-zinc-950 ring-zinc-200/30" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-zinc-200">{label}</p>
        <span className="text-xs font-mono text-zinc-400">total {score.total}/30</span>
      </div>
      <ScoreRow label="Logic" value={score.logic} />
      <ScoreRow label="Evidence" value={score.evidence} />
      <ScoreRow label="Persuasiveness" value={score.persuasiveness} />
    </div>
  )
}

function ScoreRow({ label, value }: { label: string; value: number }) {
  const pct = Math.max(0, Math.min(10, value)) * 10
  return (
    <div className="mb-2">
      <div className="flex items-baseline justify-between text-xs text-zinc-300">
        <span>{label}</span>
        <span className="font-mono">{value}/10</span>
      </div>
      <div className="mt-1 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
        <div
          className="h-full bg-zinc-200/80"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
