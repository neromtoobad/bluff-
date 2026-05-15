"use client"

import { useEffect, useState } from "react"

type Row = {
  walletAddress: string
  streak: number
  totalWon: number
  played: number
}

type Tab = "streak" | "winnings"

function shortAddr(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`
}

export default function Leaderboard() {
  const [tab, setTab] = useState<Tab>("streak")
  const [byStreak, setByStreak] = useState<Row[]>([])
  const [byWinnings, setByWinnings] = useState<Row[]>([])

  useEffect(() => {
    let live = true
    const load = () =>
      fetch("/api/leaderboard")
        .then((r) => r.json())
        .then((j) => {
          if (!live) return
          setByStreak(j.byStreak ?? [])
          setByWinnings(j.byWinnings ?? [])
        })
        .catch(() => {})
    load()
    const t = setInterval(load, 10_000)
    return () => {
      live = false
      clearInterval(t)
    }
  }, [])

  const rows = tab === "streak" ? byStreak : byWinnings

  return (
    <div className="rounded-2xl border-2 border-[color:var(--border-soft)] bg-[color:var(--surface)]/85 p-5 backdrop-blur">
      <div className="flex items-center justify-between">
        <p className="font-display text-lg tracking-widest text-[color:var(--gold-1)]">
          ◆ LEADERBOARD
        </p>
        <div className="flex rounded-full border border-[color:var(--border)] bg-black/30 p-0.5 text-[10px]">
          <button
            onClick={() => setTab("streak")}
            className={`rounded-full px-3 py-1 font-ui-label tracking-widest transition ${
              tab === "streak"
                ? "bg-[color:var(--gold-2)]/25 text-[color:var(--gold-1)]"
                : "text-[color:var(--text-mute)]"
            }`}
          >
            Streak
          </button>
          <button
            onClick={() => setTab("winnings")}
            className={`rounded-full px-3 py-1 font-ui-label tracking-widest transition ${
              tab === "winnings"
                ? "bg-[color:var(--lime)]/25 text-[color:var(--lime)]"
                : "text-[color:var(--text-mute)]"
            }`}
          >
            Winnings
          </button>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="mt-4 text-center font-ui-label text-[10px] text-[color:var(--text-mute)]">
          No games played yet — be the first.
        </p>
      ) : (
        <ol className="mt-3 space-y-1.5">
          {rows.map((r, i) => (
            <li
              key={r.walletAddress}
              className="flex items-center justify-between rounded-lg border border-[color:var(--border)] bg-black/30 px-3 py-2 font-mono text-xs"
            >
              <span className="flex items-center gap-2">
                <span className={`w-5 text-right font-display text-base ${
                  i === 0 ? "text-[color:var(--gold-1)]" : i === 1 ? "text-[color:var(--text)]" : i === 2 ? "text-[color:var(--coin-1)]" : "text-[color:var(--text-mute)]"
                }`}>
                  {i + 1}
                </span>
                <span>{shortAddr(r.walletAddress)}</span>
              </span>
              {tab === "streak" ? (
                <span className="text-[color:var(--gold-1)]">🔥 {r.streak}</span>
              ) : (
                <span className="text-[color:var(--lime)]">
                  ${r.totalWon.toFixed(2)}
                </span>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
