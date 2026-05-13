"use client"

import { useEffect, useState } from "react"

type ResearchRow = {
  agent: "A" | "B"
  round: number
  cost: string
  insight: string
  at: number
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
      } catch {
        // swallow — poll loop keeps going
      }
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
      <div className="w-full overflow-hidden border-t border-zinc-800 bg-zinc-950/80 backdrop-blur">
        <div className="flex items-center gap-6 px-4 py-2 text-xs">
          <span className="shrink-0 font-mono text-zinc-400">
            A <span className="text-emerald-300">${a}</span>
            <span className="mx-2 text-zinc-700">|</span>
            B <span className="text-rose-300">${b}</span>
          </span>
          <div className="flex-1 overflow-hidden">
            {rows.length === 0 ? (
              <p className="text-zinc-600 italic">Awaiting research calls…</p>
            ) : (
              <div className="flex gap-4 animate-[marquee_40s_linear_infinite] whitespace-nowrap">
                {[...rows, ...rows].map((r, i) => (
                  <span key={i} className="inline-flex items-center gap-2 text-zinc-300">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                        r.agent === "A"
                          ? "border-emerald-700/50 bg-emerald-500/10 text-emerald-200"
                          : "border-rose-700/50 bg-rose-500/10 text-rose-200"
                      }`}
                    >
                      {r.agent}·R{r.round}
                    </span>
                    <span className="font-mono text-zinc-400">−${r.cost}</span>
                    <span className="text-zinc-400">{r.insight}</span>
                    <span className="text-zinc-700">•</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <style jsx>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Agent research spend</h2>
        <span className="text-xs text-zinc-400">
          {state?.status === "running" && <span className="text-emerald-400">● live</span>}
          {state?.status === "done" && <span>finished</span>}
          {state?.status === "idle" && <span>waiting</span>}
          {state?.status === "error" && <span className="text-rose-400">error</span>}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <WalletCard label="Agent A wallet" tint="emerald" starting={starting} balance={a} />
        <WalletCard label="Agent B wallet" tint="rose" starting={starting} balance={b} />
      </div>

      <div>
        <p className="text-xs uppercase tracking-wider text-zinc-400 mb-2">
          Research log ({rows.length})
        </p>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 max-h-56 overflow-y-auto divide-y divide-zinc-800">
          {rows.length === 0 ? (
            <p className="px-4 py-3 text-xs text-zinc-500 italic">
              No research calls yet…
            </p>
          ) : (
            rows
              .slice()
              .reverse()
              .map((r, i) => <LogRow key={`${r.at}-${i}`} row={r} />)
          )}
        </div>
      </div>
    </div>
  )
}

function WalletCard({
  label,
  starting,
  balance,
  tint,
}: {
  label: string
  starting: string
  balance: string
  tint: "emerald" | "rose"
}) {
  const accent =
    tint === "emerald"
      ? "border-emerald-700/50 text-emerald-200"
      : "border-rose-700/50 text-rose-200"
  const spent = (Number(starting) - Number(balance)).toFixed(3)
  return (
    <div className={`rounded-xl border ${accent} bg-zinc-950/60 p-4`}>
      <p className="text-xs uppercase tracking-wider text-zinc-400">{label}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold font-mono">${balance}</span>
        <span className="text-xs text-zinc-500">
          / ${Number(starting).toFixed(2)} start
        </span>
      </div>
      <p className="mt-1 text-xs text-zinc-400">Spent ${spent}</p>
    </div>
  )
}

function LogRow({ row }: { row: ResearchRow }) {
  const pill =
    row.agent === "A"
      ? "bg-emerald-500/15 text-emerald-200 border-emerald-700/50"
      : "bg-rose-500/15 text-rose-200 border-rose-700/50"
  return (
    <div className="px-4 py-2 text-xs flex gap-3 items-start">
      <span
        className={`shrink-0 rounded-full border px-2 py-0.5 font-semibold ${pill}`}
      >
        {row.agent} · R{row.round}
      </span>
      <span className="shrink-0 font-mono text-zinc-300">−${row.cost}</span>
      <span className="text-zinc-300 line-clamp-2">{row.insight}</span>
    </div>
  )
}
