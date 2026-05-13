"use client"

import { useEffect, useState } from "react"
import { usePotTotals } from "./BetTotals"
import { ARC_FAUCET_URL } from "@/lib/arc-config"

type Side = "A" | "B"

type Props = {
  walletAddress: string
  // When the betting panel is rendered inside the Lobby, the host passes
  // its countdown so the panel can show "debate starts in N…". Once the
  // countdown hits 0 the host transitions to live and the debate stream
  // flips server status off "idle" — the panel switches to the LOCKED
  // view automatically via the existing /api/debate/state poll.
  countdownSeconds?: number | null
}

type Placed = { side: Side; amount: string; oddsAtLock?: string }

type Verdict = {
  winner: "A" | "B"
}

type DebateState = {
  status: "idle" | "running" | "judging" | "done" | "error"
  round: number
  verdict: Verdict | null
}

const QUICK_AMOUNTS = ["1", "5", "10", "25"]

function odds(side: number, total: number): string {
  if (side <= 0 || total <= 0) return "—"
  const o = total / side
  if (!isFinite(o)) return "—"
  return o.toFixed(2)
}

function useDebateRound(): DebateState | null {
  const [s, setS] = useState<DebateState | null>(null)
  useEffect(() => {
    let cancelled = false
    async function tick() {
      try {
        const res = await fetch("/api/debate/state", { cache: "no-store" })
        if (!res.ok) return
        const json = (await res.json()) as DebateState
        if (!cancelled) setS(json)
      } catch {}
    }
    tick()
    const id = setInterval(tick, 1500)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])
  return s
}

export default function BettingPanel({
  walletAddress,
  countdownSeconds,
}: Props) {
  const totals = usePotTotals()
  const debate = useDebateRound()
  const [side, setSide] = useState<Side | null>(null)
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [placed, setPlaced] = useState<Placed | null>(null)
  const [justPlaced, setJustPlaced] = useState(false)

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

  const verdict = debate?.verdict ?? null
  const status = debate?.status ?? "idle"
  // Betting is open ONLY in lobby/idle state. The moment the debate stream
  // resetDebate()s the server status to 'running' (or anything past), the
  // panel locks.
  const bettingLocked = status !== "idle"

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (bettingLocked) {
      setError("Betting closed — the debate has started")
      return
    }
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
      let txHash: string | undefined
      let explorerUrl: string | undefined

      // If the user came in via "Connect Wallet" (browser EOA), try to
      // settle the bet onchain via Arc App Kit. The treasury address is
      // the recipient. Mock / email-mode users skip this and record-only.
      const mode =
        typeof window !== "undefined"
          ? sessionStorage.getItem("arc:walletMode")
          : null
      const treasury =
        typeof window !== "undefined"
          ? (window as any).__ARC_TREASURY__ ??
            process.env.NEXT_PUBLIC_ARC_TREASURY_ADDRESS
          : null

      if (mode === "browser" && treasury && (window as any).ethereum) {
        try {
          const { getBrowserKit } = await import("@/lib/arc")
          const { kit, adapter } = await getBrowserKit(
            (window as any).ethereum,
          )
          const result = await kit.send({
            from: { adapter, chain: "Arc_Testnet" },
            to: treasury,
            amount,
            token: "USDC",
          })
          if (result.state !== "success") {
            throw new Error("transfer not finalized — check wallet")
          }
          txHash = result.txHash
          explorerUrl = result.explorerUrl
        } catch (err: any) {
          const msg = (err?.message ?? "").toLowerCase()
          if (
            msg.includes("insufficient") ||
            msg.includes("balance") ||
            msg.includes("exceeds")
          ) {
            throw new Error("INSUFFICIENT_BALANCE")
          }
          throw err
        }
      }

      const res = await fetch("/api/bet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress,
          side,
          amount,
          ...(txHash ? { txHash, explorerUrl } : {}),
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "bet failed")
      const oddsAtLock = side === "A" ? bullOdds : bearOdds
      setPlaced({ side, amount, oddsAtLock })
      setJustPlaced(true)
      setTimeout(() => setJustPlaced(false), 1200)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // --- VERDICT RESULT (after winner declared) ---
  if (placed && verdict) {
    const won = verdict.winner === placed.side
    const oddsNow = placed.side === "A" ? bullOdds : bearOdds
    const payout = (Number(placed.amount) * Number(oddsNow || 0)).toFixed(2)
    const sideName = placed.side === "A" ? "BULL" : "BEAR"
    return (
      <div
        className={`rounded-lg border p-4 ${
          won
            ? "border-[color:var(--bull)] bg-[color:var(--bull-soft)]"
            : "border-[color:var(--bear)]/60 bg-[color:var(--bear-soft)]"
        }`}
      >
        <div
          className="text-[10px] uppercase tracking-[0.3em]"
          style={{ color: won ? "var(--bull)" : "var(--bear)" }}
        >
          {won ? "You won" : "You lost"}
        </div>
        {won ? (
          <>
            <div
              className="mt-1 text-2xl font-black tabular-nums"
              style={{ color: "var(--bull)" }}
            >
              You won ${payout}
            </div>
            <p className="mt-2 text-[11px] text-zinc-300">
              ${placed.amount} on {sideName} @ {oddsNow}x · payout sent to your
              wallet
            </p>
          </>
        ) : (
          <>
            <div className="mt-1 text-xl font-black text-zinc-100">
              Better luck next fight.
            </div>
            <p className="mt-2 text-[11px] text-zinc-400">
              ${placed.amount} on {sideName} · the other side took it
            </p>
          </>
        )}
      </div>
    )
  }

  // --- BET LOCKED IN (placed, no verdict yet) ---
  if (placed) {
    const sideName = placed.side === "A" ? "BULL" : "BEAR"
    const sideEmoji = placed.side === "A" ? "🐂" : "🐻"
    const sideTeam = placed.side === "A" ? "bull" : "bear"
    const sideColor =
      placed.side === "A"
        ? "border-[color:var(--bull)] bg-[color:var(--bull-soft)] text-[color:var(--bull)]"
        : "border-[color:var(--bear)] bg-[color:var(--bear-soft)] text-[color:var(--bear)]"
    const sideAmount = placed.side === "A" ? aAmount : bAmount
    const oddsNow = odds(sideAmount, pot)
    const oddsForPayout = placed.oddsAtLock ?? oddsNow
    const payout = (Number(placed.amount) * Number(oddsForPayout || 0)).toFixed(2)

    return (
      <div
        className={`relative rounded-lg border p-4 ${sideColor} ${
          justPlaced ? (sideTeam === "bull" ? "flash-bull" : "flash-bear") : ""
        }`}
      >
        <div className="text-[10px] uppercase tracking-[0.3em] opacity-80">
          Bet locked in
        </div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-2xl leading-none">{sideEmoji}</span>
          <span className="text-2xl font-black">
            ${placed.amount} on {sideName}
          </span>
        </div>
        <div className="mt-3 rounded border border-current/30 bg-black/40 px-3 py-2">
          <div className="text-[10px] uppercase tracking-widest opacity-70">
            Potential win
          </div>
          <div className="font-mono text-2xl font-black tabular-nums">
            ${payout}
          </div>
          <div className="text-[10px] opacity-60 mt-0.5">
            at {oddsForPayout}x odds
          </div>
        </div>
        <p className="mt-3 text-[10px] uppercase tracking-widest opacity-60">
          Settlement after round 4
        </p>
      </div>
    )
  }

  // --- BETTING CLOSED (debate has started) ---
  if (bettingLocked) {
    return (
      <div className="relative rounded-lg border border-[color:var(--border)] bg-[color:var(--bg-card)] p-4">
        {/* "BETTING CLOSED" diagonal overlay */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <span
            className="font-display text-3xl tracking-[0.15em] opacity-25"
            style={{
              color: "var(--bear)",
              transform: "rotate(-10deg)",
              textShadow: "0 0 18px rgba(255,59,59,0.45)",
            }}
          >
            BETTING CLOSED
          </span>
        </div>
        <div className="relative flex items-center justify-between">
          <span className="font-ui-label text-[10px] text-zinc-500">
            Betting
          </span>
          <span
            className="rounded border px-2 py-0.5 text-[9px] font-black tracking-[0.2em] uppercase"
            style={{
              borderColor: "var(--bear)",
              color: "var(--bear)",
              background: "rgba(255, 59, 59, 0.08)",
            }}
          >
            LOCKED
          </span>
        </div>
        <p className="relative mt-3 text-sm font-bold text-zinc-100">
          Watch only — betting closed
        </p>
        <p className="relative mt-1 text-xs text-zinc-400">
          The debate is live. Lines are locked until settlement.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded border border-[color:var(--border-soft)] bg-black/40 px-2 py-1.5">
            <div className="text-[color:var(--bull)] font-bold flex items-center gap-1">
              🐂 BULL
            </div>
            <div className="font-mono">{bullOdds}x</div>
          </div>
          <div className="rounded border border-[color:var(--border-soft)] bg-black/40 px-2 py-1.5">
            <div className="text-[color:var(--bear)] font-bold flex items-center gap-1">
              🐻 BEAR
            </div>
            <div className="font-mono">{bearOdds}x</div>
          </div>
        </div>
      </div>
    )
  }

  // --- BET FORM ---
  return (
    <form
      onSubmit={handleSubmit}
      className="bet-slip p-4 pt-5 space-y-3"
    >
      <div className="flex items-baseline justify-between">
        <h3 className="font-display text-2xl leading-none text-[color:var(--accent)]">
          BET SLIP
        </h3>
        <span className="font-ui-label text-[10px] text-[color:var(--text-mute)]">
          USDC
        </span>
      </div>

      {/* Lobby countdown — only shown while the host (Lobby) is ticking */}
      {typeof countdownSeconds === "number" && countdownSeconds > 0 && (
        <div
          className={`rounded-md border px-3 py-2 flex items-center justify-between gap-3 ${
            countdownSeconds <= 5
              ? "border-[color:var(--bear)]/50 bg-[color:var(--bear)]/10"
              : "border-[color:var(--accent)]/50 bg-[color:var(--accent-soft)]"
          }`}
        >
          <div>
            <p className="font-ui-label text-[10px] text-zinc-200">
              Place your bet
            </p>
            <p className="text-[11px] text-zinc-400">
              Debate starts in
            </p>
          </div>
          <span
            className="font-display text-3xl tabular-nums leading-none"
            style={{
              color:
                countdownSeconds <= 5
                  ? "var(--bear)"
                  : "var(--accent)",
              textShadow:
                countdownSeconds <= 5
                  ? "0 0 14px rgba(255,59,59,0.4)"
                  : "0 0 14px rgba(247,183,49,0.4)",
            }}
          >
            {countdownSeconds}s
          </span>
        </div>
      )}

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
        <div className="mt-2">
          <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
            Quick bet
          </div>
          <div className="grid grid-cols-4 gap-1">
            {QUICK_AMOUNTS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setAmount(q)}
                className={`rounded border py-1 text-[11px] transition ${
                  amount === q
                    ? "border-[color:var(--accent)] bg-[color:var(--accent-soft)] text-[color:var(--accent)]"
                    : "border-[color:var(--border-soft)] bg-black/30 text-zinc-300 hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
                }`}
              >
                ${q}
              </button>
            ))}
          </div>
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
        className="cta-glow w-full rounded-md bg-[color:var(--accent)] py-3 font-display text-xl tracking-[0.08em] text-black transition hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed"
        style={{ letterSpacing: "0.08em" }}
      >
        {loading ? "PLACING…" : "PLACE BET"}
      </button>

      {error && (
        error === "INSUFFICIENT_BALANCE" ? (
          <div
            className="rounded-md border border-[color:var(--bear)]/40 bg-[color:var(--bear)]/10 px-3 py-2 text-xs"
            role="alert"
          >
            <p className="font-semibold text-[color:var(--bear)]">
              Insufficient balance
            </p>
            <p className="mt-1 text-zinc-300">
              Your wallet doesn&apos;t have enough Arc testnet USDC.
            </p>
            <a
              href={ARC_FAUCET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block font-mono underline text-[color:var(--accent)]"
            >
              Get test USDC from the Arc faucet →
            </a>
          </div>
        ) : (
          <p className="text-xs text-[color:var(--bear)]" role="alert">
            {error}
          </p>
        )
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
      <span
        className="mt-1 font-display text-2xl leading-none tabular-nums"
        style={{
          color: team === "bull" ? "var(--bull)" : "var(--bear)",
          textShadow:
            team === "bull"
              ? "0 0 12px rgba(247,183,49,0.45)"
              : "0 0 12px rgba(255,59,59,0.45)",
        }}
      >
        {odds === "—" ? "—" : `${odds}x`}
      </span>
    </button>
  )
}
