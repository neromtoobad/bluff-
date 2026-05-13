"use client"

import { usePotTotals } from "./BetTotals"

export default function HypeMeter() {
  const totals = usePotTotals()
  const a = Number(totals?.A.amount ?? 0)
  const b = Number(totals?.B.amount ?? 0)
  const sum = a + b
  const bullPct = sum > 0 ? (a / sum) * 100 : 50
  const bearPct = 100 - bullPct

  return (
    <div className="relative my-4 rounded-md border border-[color:var(--border)] bg-[color:var(--bg-card)]/60 px-4 py-3">
      <p className="absolute -top-2 left-4 px-2 bg-[color:var(--bg)] font-ui-label text-[10px] text-[color:var(--text-mute)]">
        Crowd
      </p>

      {/* Scoreboard percentages */}
      <div className="flex items-center justify-between mb-2">
        <span
          className="font-display tabular-nums leading-none"
          style={{
            color: "var(--bull)",
            fontSize: "clamp(34px, 5vw, 56px)",
            textShadow: "0 0 18px rgba(247,183,49,0.4)",
          }}
        >
          {bullPct.toFixed(0)}%
        </span>
        <span
          className="font-ui-label text-[10px] text-[color:var(--text-mute)]"
          style={{ letterSpacing: "0.3em" }}
        >
          {sum === 0
            ? "EVEN"
            : bullPct > 60
              ? "BULL HEAVY"
              : bearPct > 60
                ? "BEAR HEAVY"
                : "TIGHT"}
        </span>
        <span
          className="font-display tabular-nums leading-none"
          style={{
            color: "var(--bear)",
            fontSize: "clamp(34px, 5vw, 56px)",
            textShadow: "0 0 18px rgba(255,59,59,0.4)",
          }}
        >
          {bearPct.toFixed(0)}%
        </span>
      </div>

      {/* Liquid fill bar */}
      <div className="relative h-3 rounded-full overflow-hidden bg-black/70 border border-[color:var(--border)]">
        <div
          className="absolute inset-y-0 left-0 liquid-bull transition-[width] duration-1000 ease-out"
          style={{ width: `${bullPct}%` }}
        />
        <div
          className="absolute inset-y-0 right-0 liquid-bear transition-[width] duration-1000 ease-out"
          style={{ width: `${bearPct}%` }}
        />
        <div className="absolute inset-y-0 left-1/2 w-px bg-white/30" />
      </div>
    </div>
  )
}
