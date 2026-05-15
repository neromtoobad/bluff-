"use client"

import { useState } from "react"
import * as audio from "@/lib/audio"

export type Pick = "A" | "B"

type Props = {
  enabled: boolean
  onBet: (pick: Pick, amount: number) => void
  placed: { pick: Pick; amount: number } | null
}

const QUICK = [0.1, 0.25, 0.5, 1, 2, 5]

export default function BetButtons({ enabled, onBet, placed }: Props) {
  const [amount, setAmount] = useState<number>(0.5)

  if (placed) {
    return (
      <div className="rounded-2xl border border-[color:var(--border)] bg-black/30 p-5 text-center backdrop-blur">
        <p className="font-ui-label text-[11px] uppercase tracking-widest text-[color:var(--lime)]">
          ◆ POSITION LOCKED
        </p>
        <p className="mt-2 font-display text-3xl text-[color:var(--gold-1)]">
          ${placed.amount.toFixed(2)}{" "}
          <span className="text-[color:var(--text-mute)]">on</span>{" "}
          <span style={{ color: placed.pick === "A" ? "var(--gold-2)" : "var(--violet)" }}>
            AGENT {placed.pick} IS LYING
          </span>
        </p>
      </div>
    )
  }

  const handleBet = (pick: Pick) => {
    try { audio.betConfirm() } catch {}
    onBet(pick, amount)
  }

  return (
    <div className="space-y-4">
      {/* Amount pills — golden jackpot vibe */}
      <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
        {QUICK.map((q) => (
          <button
            key={q}
            type="button"
            disabled={!enabled}
            aria-pressed={amount === q}
            onClick={() => setAmount(q)}
            className="gold-pill rounded-xl px-3 py-3 font-display text-lg tracking-wide disabled:opacity-40"
          >
            ${q}
          </button>
        ))}
      </div>

      {/* Custom amount + token row */}
      <div className="flex items-center justify-center gap-3 rounded-xl border border-[color:var(--border)] bg-black/30 px-4 py-2 backdrop-blur">
        <span className="font-ui-label text-[10px] tracking-widest text-[color:var(--text-mute)]">
          Choose Stake
        </span>
        <input
          type="number"
          min={0.01}
          step={0.01}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value) || 0)}
          disabled={!enabled}
          className="w-24 rounded-md border border-[color:var(--border-soft)] bg-black/40 px-3 py-1.5 font-mono text-sm text-white outline-none focus:border-[color:var(--lime)] disabled:opacity-50"
        />
        <span className="font-ui-label text-[10px] tracking-widest text-[color:var(--gold-1)]">
          USDC
        </span>
      </div>

      {/* Big coin-chip bet buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          disabled={!enabled || amount <= 0}
          onClick={() => handleBet("A")}
          className="group flex flex-col items-center gap-3 rounded-2xl border border-[color:var(--border)] bg-black/30 px-4 py-5 backdrop-blur transition hover:bg-black/40 disabled:opacity-40"
        >
          <span className="coin-chip">
            <span className="font-display text-3xl text-[#3a1d00]">A</span>
          </span>
          <span className="font-display text-xl tracking-wide text-[color:var(--gold-1)]">
            BET A IS LYING
          </span>
        </button>
        <button
          type="button"
          disabled={!enabled || amount <= 0}
          onClick={() => handleBet("B")}
          className="group flex flex-col items-center gap-3 rounded-2xl border border-[color:var(--border)] bg-black/30 px-4 py-5 backdrop-blur transition hover:bg-black/40 disabled:opacity-40"
        >
          <span className="coin-chip coin-chip-b">
            <span className="font-display text-3xl text-[#1a0d3a]">B</span>
          </span>
          <span className="font-display text-xl tracking-wide" style={{ color: "var(--violet)" }}>
            BET B IS LYING
          </span>
        </button>
      </div>

      {!enabled && (
        <p className="text-center font-ui-label text-[10px] tracking-widest text-[color:var(--text-mute)]">
          Betting opens after both claims finish
        </p>
      )}
    </div>
  )
}
