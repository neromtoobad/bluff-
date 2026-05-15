"use client"

import { useEffect, useState } from "react"

type Stats = {
  played: number
  wins: number
  totalWon: number
  winRate: number
  streak: number
}

type Props = { walletAddress: string | null }

export default function StatsCard({ walletAddress }: Props) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [balance, setBalance] = useState<string>("—")

  useEffect(() => {
    if (!walletAddress) return
    let live = true
    fetch(`/api/stats?walletAddress=${walletAddress}`)
      .then((r) => r.json())
      .then((s) => live && setStats(s))
      .catch(() => {})
    fetch(`/api/balance?walletAddress=${walletAddress}`)
      .then((r) => r.json())
      .then((b) => live && setBalance(b?.balance ?? "0.00"))
      .catch(() => {})
    return () => {
      live = false
    }
  }, [walletAddress])

  const winRatePct =
    stats && stats.played > 0 ? Math.round(stats.winRate * 100) : 0

  return (
    <div className="rounded-2xl border-2 border-[color:var(--border-soft)] bg-[color:var(--surface)]/85 p-5 backdrop-blur"
      style={{ boxShadow: "0 18px 60px -30px rgba(0,0,0,0.7)" }}
    >
      <p className="font-display text-lg tracking-widest text-[color:var(--lime)]">
        ◆ YOUR STATS
      </p>
      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
        <Stat label="Balance" value={`$${balance}`} accent="gold" />
        <Stat
          label="Streak"
          value={
            stats && stats.streak > 0 ? `🔥 ${stats.streak}` : `${stats?.streak ?? 0}`
          }
          accent={
            (stats?.streak ?? 0) >= 10
              ? "rose"
              : (stats?.streak ?? 0) >= 5
                ? "coin"
                : (stats?.streak ?? 0) >= 3
                  ? "gold"
                  : "muted"
          }
        />
        <Stat label="Games" value={`${stats?.played ?? 0}`} accent="muted" />
        <Stat
          label="Total won"
          value={`$${stats?.totalWon?.toFixed(2) ?? "0.00"}`}
          accent="lime"
        />
        <Stat label="Win rate" value={`${winRatePct}%`} accent="lime" />
        <Stat
          label="Wallet"
          value={
            walletAddress
              ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}`
              : "—"
          }
          accent="muted"
        />
      </div>
    </div>
  )
}

type Accent = "gold" | "lime" | "coin" | "rose" | "violet" | "muted"

const accentColor: Record<Accent, string> = {
  gold: "text-[color:var(--gold-1)]",
  lime: "text-[color:var(--lime)]",
  coin: "text-[color:var(--coin-1)]",
  rose: "text-rose-300",
  violet: "text-[color:var(--violet)]",
  muted: "text-[color:var(--text)]",
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent: Accent
}) {
  return (
    <div className="rounded-xl border border-[color:var(--border)] bg-black/30 p-3">
      <p className="font-ui-label text-[9px] tracking-widest text-[color:var(--text-mute)]">
        {label}
      </p>
      <p className={`mt-1 font-display text-2xl tracking-tight ${accentColor[accent]}`}>
        {value}
      </p>
    </div>
  )
}
