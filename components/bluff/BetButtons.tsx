"use client"

import { useState } from "react"
import * as audio from "@/lib/audio"

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
      <div className="bluff-card bluff-card-a">
        <div className="bluff-card-inner text-center">
          <p className="font-ui-label text-[10px] uppercase tracking-widest text-[color:var(--cyan)]">
            ◆ POSITION LOCKED
          </p>
          <p className="mt-1 font-display text-3xl text-[color:var(--green)]">
            ${placed.amount.toFixed(2)}{" "}
            <span className="text-[color:var(--text-mute)]">on</span>{" "}
            <span
              style={{
                color: placed.pick === "A" ? "var(--amber)" : "var(--magenta)",
              }}
            >
              AGENT {placed.pick} IS LYING
            </span>
          </p>
        </div>
      </div>
    )
  }

  const handleBet = (pick: Pick) => {
    try { audio.betConfirm() } catch {}
    onBet(pick, amount)
  }

  return (
    <div className="bluff-card bluff-card-a">
      <div className="bluff-card-inner space-y-4">
        <div className="flex items-center gap-3">
          <span className="font-ui-label text-[10px] tracking-widest text-[color:var(--text-mute)]">
            USDC
          </span>
          <input
            type="number"
            min={0.01}
            step={0.01}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value) || 0)}
            disabled={!enabled}
            className="w-28 rounded-md border border-[color:var(--border)] bg-black/40 px-3 py-2 font-mono text-base text-white outline-none focus:border-[color:var(--cyan)] disabled:opacity-50"
          />
          <div className="flex gap-1.5">
            {QUICK.map((q) => (
              <button
                key={q}
                type="button"
                disabled={!enabled}
                onClick={() => setAmount(q)}
                className="rounded border border-[color:var(--border)] bg-black/30 px-2.5 py-1.5 font-ui-label text-[10px] text-[color:var(--text-mute)] transition hover:border-[color:var(--cyan)]/60 hover:text-[color:var(--cyan)] disabled:opacity-40"
              >
                ${q}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={!enabled || amount <= 0}
            onClick={() => handleBet("A")}
            className="rounded-xl border-2 border-[color:var(--amber)]/60 bg-[color:var(--amber)]/15 px-6 py-5 font-display text-2xl tracking-tight text-[color:var(--amber)] transition hover:bg-[color:var(--amber)]/30 hover:shadow-[0_0_30px_rgba(255,184,0,0.4)] disabled:opacity-40"
          >
            BET A IS LYING
          </button>
          <button
            type="button"
            disabled={!enabled || amount <= 0}
            onClick={() => handleBet("B")}
            className="rounded-xl border-2 border-[color:var(--magenta)]/60 bg-[color:var(--magenta)]/15 px-6 py-5 font-display text-2xl tracking-tight text-[color:var(--magenta)] transition hover:bg-[color:var(--magenta)]/30 hover:shadow-[0_0_30px_rgba(255,45,167,0.4)] disabled:opacity-40"
          >
            BET B IS LYING
          </button>
        </div>

        {!enabled && (
          <p className="text-center font-ui-label text-[10px] tracking-widest text-[color:var(--text-mute)]">
            Betting opens after both claims finish
          </p>
        )}
      </div>
    </div>
  )
}
