"use client"

import { useEffect, useState } from "react"

type ResearchRow = {
  agent: "A" | "B"
  round: number
  cost: string
  insight: string
  at: number
  service?: string
  txHash?: string
}

type State = {
  status: "idle" | "running" | "done" | "error"
  starting: string
  balances: { A: string; B: string }
  research: ResearchRow[]
}

const POLL_MS = 1000

type Props = { variant?: "panel" | "bar" }

export default function ResearchTicker({ variant = "panel" }: Props = {}) {
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

  const starting = state?.starting ?? "1.000"
  const a = state?.balances.A ?? starting
  const b = state?.balances.B ?? starting
  const rows = state?.research ?? []

  if (variant === "bar") {
    return (
      <div className="w-full overflow-hidden border-t border-[color:var(--border)] bg-black/85 backdrop-blur">
        <div className="flex items-center gap-4 px-3 py-1.5 text-[11px]">
          <div className="shrink-0 flex items-center gap-3 font-mono">
            <span className="flex items-center gap-1">
              <span>🐂</span>
              <span className="text-[color:var(--bull)]">${a}</span>
            </span>
            <span className="text-zinc-700">|</span>
            <span className="flex items-center gap-1">
              <span>🐻</span>
              <span className="text-[color:var(--bear)]">${b}</span>
            </span>
          </div>
          <div className="flex-1 overflow-hidden relative">
            {rows.length === 0 ? (
              <p className="text-zinc-600 italic">
                x402 research wire… waiting for first spend
              </p>
            ) : (
              <div className="flex gap-6 ticker-track whitespace-nowrap">
                {[...rows, ...rows].map((r, i) => {
                  const isA = r.agent === "A"
                  const teamLabel = isA ? "BULL" : "BEAR"
                  const service = r.service ?? "research"
                  return (
                    <span key={i} className="inline-flex items-center gap-2">
                      <span className="text-base leading-none">
                        {isA ? "🐂" : "🐻"}
                      </span>
                      <span
                        className="text-[10px] font-mono"
                        style={{
                          color: isA ? "var(--bull)" : "var(--bear)",
                        }}
                      >
                        R{r.round}
                      </span>
                      <span
                        className="font-ui-label text-[10px]"
                        style={{
                          color: isA ? "var(--bull)" : "var(--bear)",
                        }}
                      >
                        {teamLabel} paid
                      </span>
                      <span className="font-mono text-zinc-200">
                        ${r.cost}
                      </span>
                      <span className="text-zinc-500">→</span>
                      <span className="text-zinc-100 font-semibold">
                        {service}
                      </span>
                      <span className="text-zinc-500">
                        via Circle Gateway
                      </span>
                      {r.txHash && (
                        <span className="font-mono text-[color:var(--accent)]">
                          {r.txHash.slice(0, 8)}…
                        </span>
                      )}
                      <span className="text-zinc-600">·</span>
                      <span className="text-zinc-400 italic">
                        {r.insight}
                      </span>
                      <span className="text-zinc-700">▪</span>
                    </span>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Panel variant (retained for any non-arena usage).
  return (
    <div className="w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--bg-card)] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs uppercase tracking-widest text-zinc-500">
          Research spend
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded border border-[color:var(--border-soft)] bg-black/40 px-3 py-2">
          <p className="text-[10px] uppercase text-zinc-500">🐂 Bull</p>
          <p className="font-mono text-base">${a}</p>
        </div>
        <div className="rounded border border-[color:var(--border-soft)] bg-black/40 px-3 py-2">
          <p className="text-[10px] uppercase text-zinc-500">🐻 Bear</p>
          <p className="font-mono text-base">${b}</p>
        </div>
      </div>
      <div className="max-h-40 overflow-y-auto rounded border border-[color:var(--border-soft)] bg-black/40 divide-y divide-zinc-900">
        {rows.length === 0 ? (
          <p className="px-3 py-2 text-xs italic text-zinc-600">No calls yet</p>
        ) : (
          rows
            .slice()
            .reverse()
            .map((r, i) => (
              <div key={i} className="px-3 py-1.5 text-xs flex gap-2">
                <span>{r.agent === "A" ? "🐂" : "🐻"}</span>
                <span className="font-mono text-zinc-500">R{r.round}</span>
                <span className="font-mono text-zinc-500">−${r.cost}</span>
                <span className="text-zinc-300 truncate">{r.insight}</span>
              </div>
            ))
        )}
      </div>
    </div>
  )
}
