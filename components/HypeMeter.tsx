"use client"

import { usePotTotals } from "./BetTotals"

export default function HypeMeter() {
  const totals = usePotTotals()
  const a = Number(totals?.A.amount ?? 0)
  const b = Number(totals?.B.amount ?? 0)
  const sum = a + b
  // 50/50 split when nothing is bet yet.
  const bullPct = sum > 0 ? (a / sum) * 100 : 50
  const bearPct = 100 - bullPct
  const tilt =
    sum === 0
      ? "even"
      : bullPct > 60
        ? "bull"
        : bearPct > 60
          ? "bear"
          : "even"

  return (
    <div className="my-3">
      <div className="flex items-baseline justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">
            Crowd
          </span>
          {tilt === "bull" && (
            <span
              className="text-[10px] uppercase tracking-widest font-bold"
              style={{ color: "var(--bull)" }}
            >
              🐂 tilting bull
            </span>
          )}
          {tilt === "bear" && (
            <span
              className="text-[10px] uppercase tracking-widest font-bold"
              style={{ color: "var(--bear)" }}
            >
              🐻 tilting bear
            </span>
          )}
          {tilt === "even" && sum > 0 && (
            <span className="text-[10px] uppercase tracking-widest text-zinc-500">
              dead split
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span style={{ color: "var(--bull)" }}>
            {bullPct.toFixed(0)}%
          </span>
          <span className="text-zinc-700">|</span>
          <span style={{ color: "var(--bear)" }}>
            {bearPct.toFixed(0)}%
          </span>
        </div>
      </div>
      <div className="relative h-2 rounded-full overflow-hidden bg-black/60 border border-[color:var(--border)]">
        {/* Bull fill — anchors left */}
        <div
          className="absolute inset-y-0 left-0 transition-[width] duration-700 ease-out"
          style={{
            width: `${bullPct}%`,
            background:
              "linear-gradient(90deg, var(--bull) 0%, rgba(0,255,136,0.6) 100%)",
            boxShadow: "0 0 12px rgba(0, 255, 136, 0.35)",
          }}
        />
        {/* Bear fill — anchors right */}
        <div
          className="absolute inset-y-0 right-0 transition-[width] duration-700 ease-out"
          style={{
            width: `${bearPct}%`,
            background:
              "linear-gradient(270deg, var(--bear) 0%, rgba(255,51,85,0.6) 100%)",
            boxShadow: "0 0 12px rgba(255, 51, 85, 0.35)",
          }}
        />
        {/* Center seam */}
        <div className="absolute inset-y-0 left-1/2 w-px bg-zinc-700/60" />
      </div>
    </div>
  )
}
