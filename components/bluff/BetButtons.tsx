"use client"

export type Pick = "A" | "B"

type Props = {
  enabled: boolean
  amount: number
  onAmountChange: (n: number) => void
  placed: { pick: Pick; amount: number } | null
}

const QUICK = [0.1, 0.25, 0.5, 1, 2, 5]

// Bet placement now happens by clicking an Agent card. This component is
// just the amount picker + locked-position readout.
export default function BetButtons({ enabled, amount, onAmountChange, placed }: Props) {
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
            AGENT {placed.pick} IS TELLING THE TRUTH
          </span>
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
        {QUICK.map((q) => (
          <button
            key={q}
            type="button"
            disabled={!enabled}
            aria-pressed={amount === q}
            onClick={() => onAmountChange(q)}
            className="gold-pill rounded-xl px-3 py-3 font-display text-lg tracking-wide disabled:opacity-40"
          >
            ${q}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-center gap-3 rounded-xl border border-[color:var(--border)] bg-black/30 px-4 py-2 backdrop-blur">
        <span className="font-ui-label text-[10px] tracking-widest text-[color:var(--text-mute)]">
          Choose Stake
        </span>
        <input
          type="number"
          min={0.01}
          step={0.01}
          value={amount}
          onChange={(e) => onAmountChange(Number(e.target.value) || 0)}
          disabled={!enabled}
          className="w-24 rounded-md border border-[color:var(--border-soft)] bg-black/40 px-3 py-1.5 font-mono text-sm text-white outline-none focus:border-[color:var(--lime)] disabled:opacity-50"
        />
        <span className="font-ui-label text-[10px] tracking-widest text-[color:var(--gold-1)]">
          USDC
        </span>
      </div>

      <p className="text-center font-ui-label text-[10px] tracking-widest text-[color:var(--text-mute)]">
        {enabled
          ? "Tap an agent card to lock your bet"
          : "Betting opens after both claims finish"}
      </p>
    </div>
  )
}
