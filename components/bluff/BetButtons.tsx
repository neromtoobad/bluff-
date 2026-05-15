"use client"

import { useState } from "react"

export type Pick = "A" | "B"

type Props = {
  enabled: boolean
  onBet: (pick: Pick, amount: number) => void
  placed: { pick: Pick; amount: number } | null
}

const QUICK = [0.1, 0.5, 1, 5]

export default function BetButtons({ enabled, onBet, placed }: Props) {
  const [amount, setAmount] = useState<number>(0.5)

  if (placed) {
    return (
      <div className="rounded-md border border-emerald-400/40 bg-emerald-400/10 p-4 text-center">
        <p className="font-ui-label text-[10px] uppercase tracking-wider text-emerald-300">
          Position locked
        </p>
        <p className="mt-1 font-mono text-sm text-white">
          ${placed.amount.toFixed(2)} on AGENT {placed.pick} IS LYING
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3 rounded-md border border-[color:var(--border-soft)] bg-[color:var(--bg-card)] p-4">
      <div className="flex items-center gap-2">
        <span className="font-ui-label text-[10px] text-[color:var(--text-mute)]">USDC</span>
        <input
          type="number"
          min={0.01}
          step={0.01}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value) || 0)}
          disabled={!enabled}
          className="w-24 rounded-md border border-[color:var(--border-soft)] bg-black/40 px-2 py-1 font-mono text-sm text-white outline-none focus:border-[color:var(--accent)] disabled:opacity-50"
        />
        <div className="flex gap-1">
          {QUICK.map((q) => (
            <button
              key={q}
              type="button"
              disabled={!enabled}
              onClick={() => setAmount(q)}
              className="rounded border border-[color:var(--border-soft)] bg-black/30 px-2 py-1 font-ui-label text-[10px] text-[color:var(--text-mute)] hover:text-white disabled:opacity-50"
            >
              ${q}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={!enabled || amount <= 0}
          onClick={() => onBet("A", amount)}
          className="rounded-md border border-[color:var(--bull)]/40 bg-[color:var(--bull)]/10 py-3 font-ui-label text-xs tracking-wider text-[color:var(--bull)] hover:bg-[color:var(--bull)]/20 disabled:opacity-40"
        >
          BET A IS LYING
        </button>
        <button
          type="button"
          disabled={!enabled || amount <= 0}
          onClick={() => onBet("B", amount)}
          className="rounded-md border border-[color:var(--bear)]/40 bg-[color:var(--bear)]/10 py-3 font-ui-label text-xs tracking-wider text-[color:var(--bear)] hover:bg-[color:var(--bear)]/20 disabled:opacity-40"
        >
          BET B IS LYING
        </button>
      </div>
      {!enabled && (
        <p className="text-center font-ui-label text-[10px] text-[color:var(--text-mute)]">
          Betting opens after both claims finish
        </p>
      )}
    </div>
  )
}
