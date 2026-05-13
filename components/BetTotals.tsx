"use client"

import { useEffect, useState } from "react"

type Totals = {
  A: { amount: string; bettors: number }
  B: { amount: string; bettors: number }
  pot: string
}

const POLL_MS = 3000

export default function BetTotals() {
  const [totals, setTotals] = useState<Totals | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function tick() {
      try {
        const res = await fetch("/api/bet/totals", { cache: "no-store" })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = (await res.json()) as Totals
        if (!cancelled) {
          setTotals(json)
          setError(null)
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message ?? "poll failed")
      }
    }

    tick()
    const id = setInterval(tick, POLL_MS)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  const a = totals?.A
  const b = totals?.B

  return (
    <div className="w-full max-w-4xl rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Live bets</h2>
        <span className="text-xs text-zinc-400">
          Pot: <span className="font-mono text-zinc-100">${totals?.pot ?? "0.00"}</span>
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <SideCard
          label="Agent A — FOR"
          tint="emerald"
          amount={a?.amount ?? "0.00"}
          bettors={a?.bettors ?? 0}
        />
        <SideCard
          label="Agent B — AGAINST"
          tint="rose"
          amount={b?.amount ?? "0.00"}
          bettors={b?.bettors ?? 0}
        />
      </div>

      {error && (
        <p className="mt-3 text-xs text-rose-400" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

function SideCard({
  label,
  amount,
  bettors,
  tint,
}: {
  label: string
  amount: string
  bettors: number
  tint: "emerald" | "rose"
}) {
  const accent =
    tint === "emerald"
      ? "border-emerald-700/50 text-emerald-200"
      : "border-rose-700/50 text-rose-200"
  return (
    <div className={`rounded-xl border ${accent} bg-zinc-950/60 p-4`}>
      <p className="text-xs uppercase tracking-wider text-zinc-400">{label}</p>
      <p className="mt-2 text-2xl font-bold font-mono">${amount}</p>
      <p className="mt-1 text-xs text-zinc-400">
        {bettors} {bettors === 1 ? "bettor" : "bettors"}
      </p>
    </div>
  )
}
