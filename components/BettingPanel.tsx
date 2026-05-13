"use client"

import { useState } from "react"

type Side = "A" | "B"

type Props = {
  walletAddress: string
}

type Placed = { side: Side; amount: string }

export default function BettingPanel({ walletAddress }: Props) {
  const [side, setSide] = useState<Side | null>(null)
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [placed, setPlaced] = useState<Placed | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!side) {
      setError("Pick a side")
      return
    }
    if (!amount || Number(amount) <= 0) {
      setError("Enter a USDC amount")
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
    return (
      <div className="w-full max-w-sm rounded-2xl border border-emerald-700/50 bg-emerald-500/10 p-6 text-center">
        <p className="text-sm text-emerald-300">
          Bet placed:{" "}
          <span className="font-semibold text-emerald-100">
            ${placed.amount} on Agent {placed.side}
          </span>
        </p>
        <p className="mt-2 text-xs text-zinc-400">
          You're locked in. Settle up after round 4.
        </p>
      </div>
    )
  }

  const sideBtn = (s: Side, label: string) => {
    const selected = side === s
    return (
      <button
        type="button"
        onClick={() => setSide(s)}
        className={`flex-1 rounded-lg border px-4 py-3 text-sm font-semibold transition ${
          selected
            ? "border-emerald-500 bg-emerald-500/15 text-emerald-200"
            : "border-zinc-700 bg-zinc-950 text-zinc-200 hover:border-zinc-500"
        }`}
      >
        {label}
      </button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-xl space-y-4"
    >
      <div>
        <h2 className="text-lg font-semibold">Place your bet</h2>
        <p className="text-sm text-zinc-400">Pick a side and an amount in USDC.</p>
      </div>

      <div className="flex gap-3">
        {sideBtn("A", "Agent A")}
        {sideBtn("B", "Agent B")}
      </div>

      <div>
        <label className="block text-xs text-zinc-400 mb-1">Amount (USDC)</label>
        <input
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="1.00"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm font-mono outline-none focus:border-emerald-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 disabled:opacity-50"
      >
        {loading ? "Placing…" : "Place Bet"}
      </button>

      {error && (
        <p className="text-sm text-rose-400" role="alert">
          {error}
        </p>
      )}
    </form>
  )
}
