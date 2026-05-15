"use client"

import { useEffect, useState } from "react"

type Stats = {
  played: number
  wins: number
  totalWon: number
  winRate: number
  streak: number
}

type Props = {
  walletAddress: string | null
}

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
    <div className="bluff-card bluff-card-b">
      <div className="bluff-card-inner">
        <p className="font-ui-label text-[11px] tracking-widest text-[color:var(--cyan)]">
          ◆ YOUR STATS
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
          <Stat label="Balance" value={`$${balance}`} accent="amber" />
          <Stat
            label="Streak"
            value={
              stats && stats.streak > 0 ? `🔥 ${stats.streak}` : `${stats?.streak ?? 0}`
            }
            accent={
              (stats?.streak ?? 0) >= 10
                ? "rose"
                : (stats?.streak ?? 0) >= 5
                  ? "orange"
                  : (stats?.streak ?? 0) >= 3
                    ? "amber"
                    : "muted"
            }
          />
          <Stat label="Games" value={`${stats?.played ?? 0}`} accent="muted" />
          <Stat
            label="Total won"
            value={`$${stats?.totalWon?.toFixed(2) ?? "0.00"}`}
            accent="green"
          />
          <Stat label="Win rate" value={`${winRatePct}%`} accent="cyan" />
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
    </div>
  )
}

type Accent = "amber" | "magenta" | "cyan" | "green" | "rose" | "orange" | "muted"

const accentColor: Record<Accent, string> = {
  amber: "text-[color:var(--amber)]",
  magenta: "text-[color:var(--magenta)]",
  cyan: "text-[color:var(--cyan)]",
  green: "text-[color:var(--green)]",
  rose: "text-rose-300",
  orange: "text-orange-300",
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
    <div className="rounded-lg border border-[color:var(--border)] bg-black/30 p-3">
      <p className="font-ui-label text-[9px] tracking-widest text-[color:var(--text-mute)]">
        {label}
      </p>
      <p className={`mt-1 font-display text-2xl tracking-tight ${accentColor[accent]}`}>
        {value}
      </p>
    </div>
  )
}
