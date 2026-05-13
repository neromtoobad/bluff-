"use client"

import { useEffect, useMemo, useState } from "react"
import BetTotals from "@/components/BetTotals"
import BettingPanel from "@/components/BettingPanel"

type Props = {
  topic: string
  walletAddress: string
  countdownSeconds?: number
  onStart: () => void
}

type FighterStats = {
  record: string
  personality: string[]
}

const BULL_STATS: FighterStats = {
  record: "3W-1L",
  personality: ["Aggressive", "Data-driven", "Never folds"],
}

const BEAR_STATS: FighterStats = {
  record: "2W-2L",
  personality: ["Cold", "Surgical", "No mercy"],
}

export default function Lobby({
  topic,
  walletAddress,
  countdownSeconds = 15,
  onStart,
}: Props) {
  const [secs, setSecs] = useState(countdownSeconds)

  // Stable random spectator count for the session.
  const spectators = useMemo(() => 8 + Math.floor(Math.random() * 33), [])

  useEffect(() => {
    if (secs <= 0) {
      onStart()
      return
    }
    const id = setTimeout(() => setSecs((s) => s - 1), 1000)
    return () => clearTimeout(id)
  }, [secs, onStart])

  const urgent = secs <= 3

  return (
    <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-6 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
      <section className="space-y-5">
        {/* Topic banner */}
        <div className="text-center">
          <p className="font-ui-label text-[10px] text-[color:var(--text-mute)]">
            Tonight's debate
          </p>
          <h1
            className="mt-2 font-mono italic underline underline-offset-8 decoration-[color:var(--text-mute)]/40 leading-snug"
            style={{ fontSize: "clamp(22px, 3.4vw, 36px)" }}
          >
            {topic}
          </h1>
        </div>

        {/* Live status row */}
        <div className="flex items-center justify-center gap-4 text-[11px]">
          <span className="rounded-md border border-[color:var(--accent)]/40 bg-[color:var(--accent-soft)] px-3 py-1.5 font-black uppercase tracking-[0.3em] text-[color:var(--accent)] neon-blink">
            Betting is open
          </span>
          <span className="rounded-md border border-[color:var(--border)] bg-[color:var(--bg-card)] px-3 py-1.5 text-zinc-300">
            👁 {spectators} spectators
          </span>
        </div>

        {/* Fighter cards */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 items-stretch">
          <FighterCard team="bull" name="BULL" emoji="🐂" stats={BULL_STATS} />
          <div className="flex items-center justify-center">
            <span className="text-3xl font-black text-zinc-600 tracking-tighter">
              VS
            </span>
          </div>
          <FighterCard team="bear" name="BEAR" emoji="🐻" stats={BEAR_STATS} />
        </div>

        {/* Countdown */}
        <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-card)] p-6 text-center">
          <p className="font-ui-label text-[10px] text-zinc-500">
            Place your bet — debate starts in
          </p>
          <p
            className="mt-1 font-display tabular-nums leading-none"
            style={{
              fontSize: "clamp(48px, 8vw, 96px)",
              color: urgent ? "var(--bear)" : "var(--accent)",
              textShadow: urgent
                ? "0 0 28px rgba(255, 59, 59, 0.45)"
                : "0 0 28px rgba(247, 183, 49, 0.45)",
            }}
          >
            {secs}s
          </p>
          <p className="mt-2 font-ui-label text-[10px] text-zinc-600">
            {urgent ? "Get your bets in" : "seconds"}
          </p>
        </div>
      </section>

      <aside className="space-y-3">
        <BetTotals variant="panel" />
        <BettingPanel
          walletAddress={walletAddress}
          countdownSeconds={secs}
        />
      </aside>
    </main>
  )
}

function FighterCard({
  team,
  name,
  emoji,
  stats,
}: {
  team: "bull" | "bear"
  name: string
  emoji: string
  stats: FighterStats
}) {
  const color = team === "bull" ? "var(--bull)" : "var(--bear)"
  const soft = team === "bull" ? "var(--bull-soft)" : "var(--bear-soft)"
  return (
    <div
      className="flex flex-col rounded-2xl border bg-[color:var(--bg-card)] overflow-hidden"
      style={{ borderColor: color }}
    >
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "var(--border)", background: soft }}
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl leading-none">{emoji}</span>
          <div>
            <div
              className="text-base font-black tracking-widest leading-none"
              style={{ color }}
            >
              AGENT {name}
            </div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-500 mt-1">
              {team === "bull" ? "Argues FOR" : "Argues AGAINST"}
            </div>
          </div>
        </div>
        <span
          className="rounded border px-2 py-0.5 text-[10px] font-mono tracking-wider"
          style={{ borderColor: "var(--border-soft)", color }}
        >
          {stats.record}
        </span>
      </div>
      <div className="px-4 py-3 space-y-2">
        <div className="text-[10px] uppercase tracking-widest text-zinc-500">
          Style
        </div>
        <div className="flex flex-wrap gap-1.5">
          {stats.personality.map((p) => (
            <span
              key={p}
              className="rounded-full border bg-black/40 px-2 py-0.5 text-[11px] font-medium"
              style={{ borderColor: "var(--border-soft)", color }}
            >
              {p}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
