"use client"

import { useEffect, useState } from "react"
import { usePotTotals } from "./BetTotals"

type Side = "A" | "B"

type Props = {
  walletAddress: string
}

type Placed = { side: Side; amount: string }

const QUICK_AMOUNTS = ["1", "5", "10", "25"]

function odds(side: number, total: number): string {
  if (side <= 0 || total <= 0) return "—"
  const o = total / side
  if (!isFinite(o)) return "—"
  return o.toFixed(2)
}

export default function BettingPanel({ walletAddress }: Props) {
  const totals = usePotTotals()
  const [side, setSide] = useState<Side | null>(null)
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [placed, setPlaced] = useState<Placed | null>(null)

  // Check if this wallet already has an existing bet (e.g., on hot reload).
  useEffect(() => {
    let cancelled = false
    fetch(`/api/bet?walletAddress=${encodeURIComponent(walletAddress)}`)
      .then((r) => r.json())
      .then((j: { bet?: Placed | null }) => {
        if (!cancelled && j?.bet) setPlaced({ side: j.bet.side, amount: j.bet.amount })
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [walletAddress])

  const aAmount = Number(totals?.A.amount ?? 0)
  const bAmount = Number(totals?.B.amount ?? 0)
  const pot = Number(totals?.pot ?? 0)
  const bullOdds = odds(aAmount, pot)
  const bearOdds = odds(bAmount, pot)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!side) {
      setError("Pick a fighter")
      return
    }
    if (!amount || Number(amount) <= 0) {
      setError("Enter a stake")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/bet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress, side, amount }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "bet failed")
      setPlaced({ side, amount })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (placed) {
    const sideName = placed.side === "A" ? "BULL" : "BEAR"
    const sideColor =
      placed.side === "A"
        ? "border-[color:var(--bull)]/40 bg-[color:var(--bull-soft)] text-[color:var(--bull)]"
        : "border-[color:var(--bear)]/40 bg-[color:var(--bear-soft)] text-[color:var(--bear)]"
    const sideAmount = placed.side === "A" ? aAmount : bAmount
    const oddsNow = odds(sideAmount, pot)
    const payout = (Number(placed.amount) * Number(oddsNow || 0)).toFixed(2)

    return (
      <div className={`rounded-lg border p-4 ${sideColor}`}>
        <div className="text-[10px] uppercase tracking-widest opacity-80">
          Bet placed
        </div>
        <div className="mt-1 text-2xl font-black">
          ${placed.amount} on {sideName}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded border border-current/20 bg-black/30 px-2 py-1.5">
            <div className="opacity-60 text-[10px] uppercase">Odds</div>
            <div className="font-mono text-base font-bold">{oddsNow}x</div>
          </div>
          <div className="rounded border border-current/20 bg-black/30 px-2 py-1.5">
            <div className="opacity-60 text-[10px] uppercase">Win</div>
            <div className="font-mono text-base font-bold">${payout}</div>
          </div>
        </div>
        <p className="mt-3 text-[11px] opacity-60">
          Locked in. Payout after round 4.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-[color:var(--border)] bg-[color:var(--bg-card)] p-3 space-y-3"
    >
      <div className="flex items-baseline justify-between">
        <h3 className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          Bet slip
        </h3>
        <span className="text-[10px] text-zinc-500">USDC</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <FighterButton
          team="bull"
          label="Back Bull"
          odds={bullOdds}
          selected={side === "A"}
          onClick={() => setSide("A")}
        />
        <FighterButton
          team="bear"
          label="Back Bear"
          odds={bearOdds}
          selected={side === "B"}
          onClick={() => setSide("B")}
        />
      </div>

      <div>
        <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
          Stake
        </label>
        <div className="flex items-center rounded-md border border-[color:var(--border-soft)] bg-black/40 px-2">
          <span className="text-zinc-500 text-sm pr-1">$</span>
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-transparent py-2 text-base font-mono outline-none placeholder:text-zinc-700"
          />
        </div>
        <div className="mt-2 grid grid-cols-4 gap-1">
          {QUICK_AMOUNTS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setAmount(q)}
              className="rounded border border-[color:var(--border-soft)] bg-black/30 py-1 text-[11px] text-zinc-300 hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
            >
              ${q}
            </button>
          ))}
        </div>
      </div>

      {amount && side && (
        <div className="rounded-md border border-[color:var(--border-soft)] bg-black/40 px-3 py-2 text-xs flex items-center justify-between">
          <span className="text-zinc-500 uppercase tracking-wider text-[10px]">
            Potential win
          </span>
          <span className="font-mono font-bold text-[color:var(--accent)]">
            $
            {(
              Number(amount) *
              Number(side === "A" ? bullOdds : bearOdds || "0")
            ).toFixed(2)}
          </span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !side || !amount}
        className="w-full rounded-md bg-[color:var(--accent)] py-2.5 text-sm font-black tracking-wider uppercase text-black hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        {loading ? "Placing…" : "Place bet"}
      </button>

      {error && (
        <p className="text-xs text-[color:var(--bear)]" role="alert">
          {error}
        </p>
      )}
    </form>
  )
}

function FighterButton({
  team,
  label,
  odds,
  selected,
  onClick,
}: {
  team: "bull" | "bear"
  label: string
  odds: string
  selected: boolean
  onClick: () => void
}) {
  const color = team === "bull" ? "var(--bull)" : "var(--bear)"
  const soft = team === "bull" ? "var(--bull-soft)" : "var(--bear-soft)"
  const emoji = team === "bull" ? "🐂" : "🐻"
  return (
    <button
      type="button"
      onClick={onClick}
      style={
        selected
          ? { borderColor: color, background: soft, color }
          : { borderColor: "var(--border-soft)" }
      }
      className="group flex flex-col items-start rounded-md border bg-black/40 px-3 py-2.5 text-left transition hover:border-current"
    >
      <span className="flex items-center gap-1.5">
        <span className="text-lg leading-none">{emoji}</span>
        <span
          className="text-xs font-black uppercase tracking-wider"
          style={!selected ? { color } : undefined}
        >
          {label}
        </span>
      </span>
      <span className="mt-1 font-mono text-lg font-bold tabular-nums">
        {odds === "—" ? "—" : `${odds}x`}
      </span>
    </button>
  )
}
