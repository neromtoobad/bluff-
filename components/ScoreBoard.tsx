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
      <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--bg-card)] p-6 text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">
          Judge
        </p>
        <p className="mt-2 text-sm text-zinc-200">
          Reviewing the transcript…
        </p>
      </div>
    )
  }

  const v = state.verdict
  if (!v) return null

  const winnerTeam: "bull" | "bear" = v.winner === "A" ? "bull" : "bear"
  const winnerName = winnerTeam === "bull" ? "BULL" : "BEAR"
  const winnerEmoji = winnerTeam === "bull" ? "🐂" : "🐻"
  const winnerColor =
    winnerTeam === "bull" ? "var(--bull)" : "var(--bear)"

  return (
    <div className="space-y-3">
      {/* Winner banner */}
      <div
        className="rounded-lg border p-5 text-center bubble-pop"
        style={{
          borderColor: winnerColor,
          background:
            winnerTeam === "bull" ? "var(--bull-soft)" : "var(--bear-soft)",
        }}
      >
        <p
          className="text-[10px] uppercase tracking-[0.4em]"
          style={{ color: winnerColor }}
        >
          Winner by decision
        </p>
        <p className="mt-2 text-4xl font-black tracking-wider flex items-center justify-center gap-3">
          <span className="text-3xl">{winnerEmoji}</span>
          <span style={{ color: winnerColor }}>AGENT {winnerName}</span>
        </p>
      </div>

      {/* Scorecards */}
      <div className="grid grid-cols-2 gap-3">
        <ScoreCard
          team="bull"
          name="BULL"
          score={v.scores.A}
          winner={v.winner === "A"}
        />
        <ScoreCard
          team="bear"
          name="BEAR"
          score={v.scores.B}
          winner={v.winner === "B"}
        />
      </div>

      {/* Verdict text */}
      <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--bg-card)] p-4">
        <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-2">
          Judge's verdict
        </p>
        <p className="text-sm leading-relaxed text-zinc-200">{v.summary}</p>
      </div>

      <SettlementPanel
        settlement={state.settlement}
        payouts={state.payouts ?? []}
      />
    </div>
  )
}

function ScoreCard({
  team,
  name,
  score,
  winner,
}: {
  team: "bull" | "bear"
  name: string
  score: Score
  winner: boolean
}) {
  const color = team === "bull" ? "var(--bull)" : "var(--bear)"
  const emoji = team === "bull" ? "🐂" : "🐻"
  return (
    <div
      className="rounded-lg border bg-[color:var(--bg-card)] p-4"
      style={{
        borderColor: winner ? color : "var(--border)",
        boxShadow: winner ? `0 0 0 1px ${color}33` : "none",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{emoji}</span>
          <span
            className="text-sm font-black tracking-widest"
            style={{ color }}
          >
            {name}
          </span>
        </div>
        <span className="font-mono text-xs text-zinc-400">
          {score.total}/30
        </span>
      </div>
      <ScoreRow label="Logic" value={score.logic} color={color} />
      <ScoreRow label="Evidence" value={score.evidence} color={color} />
      <ScoreRow label="Persuasion" value={score.persuasiveness} color={color} />
    </div>
  )
}

function ScoreRow({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  const pct = Math.max(0, Math.min(10, value)) * 10
  return (
    <div className="mb-2 last:mb-0">
      <div className="flex items-baseline justify-between text-[11px]">
        <span className="text-zinc-400 uppercase tracking-wider">{label}</span>
        <span className="font-mono text-zinc-200">{value}/10</span>
      </div>
      <div className="mt-1 h-1 rounded-full bg-black/60 overflow-hidden">
        <div
          className="h-full transition-[width] duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
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
  const labelColor =
    settlement === "done"
      ? "var(--bull)"
      : settlement === "error"
        ? "var(--bear)"
        : "var(--text-mute)"

  return (
    <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--bg-card)] p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">
          USDC payout
        </p>
        <p
          className="text-[10px] uppercase tracking-widest"
          style={{ color: labelColor }}
        >
          {label}
        </p>
      </div>

      {payouts.length === 0 ? (
        <p className="text-xs text-zinc-600 italic">
          {settlement === "running"
            ? "Computing winner shares…"
            : "No winning bets to pay."}
        </p>
      ) : (
        <div className="divide-y divide-[color:var(--border)] rounded border border-[color:var(--border-soft)] bg-black/40">
          {payouts.map((p) => (
            <div
              key={p.walletAddress}
              className="px-3 py-2 text-[11px] flex flex-wrap items-center gap-3"
            >
              <span className="font-mono text-zinc-200">
                {shortAddr(p.walletAddress)}
              </span>
              <span className="text-zinc-500">
                ${p.bet} →{" "}
                <span className="text-zinc-100 font-mono">${p.payout}</span>
              </span>
              <span className="text-zinc-600">
                ({Math.round(Number(p.share) * 100)}%)
              </span>
              <span className="ml-auto">
                {p.state === "pending" && (
                  <span className="text-zinc-500">pending…</span>
                )}
                {p.state === "success" && p.explorerUrl && (
                  <a
                    href={p.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono underline"
                    style={{ color: "var(--accent)" }}
                  >
                    {p.txHash ? `${p.txHash.slice(0, 10)}…` : "view tx"}
                  </a>
                )}
                {p.state === "failed" && (
                  <span
                    style={{ color: "var(--bear)" }}
                    title={p.error ?? ""}
                  >
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
