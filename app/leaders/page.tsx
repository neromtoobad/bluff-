"use client"

import { useEffect, useState } from "react"
import TopNav from "@/components/bluff/TopNav"
import { ChestMascot, OracleMascot } from "@/components/bluff/Mascots"
import WinnersTicker from "@/components/bluff/WinnersTicker"

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

const podiumColor = (rank: number) =>
  rank === 0
    ? "text-[color:var(--gold-1)]"
    : rank === 1
      ? "text-[color:var(--text)]"
      : rank === 2
        ? "text-[color:var(--coin-1)]"
        : "text-[color:var(--text-mute)]"

export default function LeadersPage() {
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
    const t = setInterval(load, 5000)
    return () => {
      live = false
      clearInterval(t)
    }
  }, [])

  const rows = tab === "streak" ? byStreak : byWinnings

  return (
    <main className="relative min-h-screen pb-32">
      <div className="rays-bg" />
      <div className="forest-ridge" />
      <TopNav compact />

      <section className="relative z-10 mx-auto max-w-4xl px-4 pt-6 sm:px-6 sm:pt-8">
        <p className="font-ui-label text-[10px] tracking-widest text-[color:var(--lime)] sm:text-[11px]">
          ◆ HALL OF DEGENS
        </p>
        <h1 className="jackpot-title font-display text-5xl leading-tight sm:text-7xl md:text-8xl">
          LEADERS
        </h1>
        <p className="mt-1 font-ui-label text-[10px] tracking-widest text-[color:var(--gold-1)] sm:text-[11px]">
          Top spotters by streak and total USDC won. Updates every 5s.
        </p>

        <div className="mt-6 flex flex-col rounded-2xl border-2 border-[color:var(--border-soft)] bg-[color:var(--surface)]/85 p-1 text-[11px] backdrop-blur sm:flex-row sm:rounded-full">
          <button
            onClick={() => setTab("streak")}
            className={`flex-1 rounded-xl px-4 py-2 font-display text-base tracking-wide transition sm:rounded-full ${
              tab === "streak"
                ? "bg-[color:var(--gold-2)]/25 text-[color:var(--gold-1)]"
                : "text-[color:var(--text-mute)] hover:text-[color:var(--text)]"
            }`}
          >
            🔥 HOTTEST STREAKS
          </button>
          <button
            onClick={() => setTab("winnings")}
            className={`flex-1 rounded-xl px-4 py-2 font-display text-base tracking-wide transition sm:rounded-full ${
              tab === "winnings"
                ? "bg-[color:var(--lime)]/25 text-[color:var(--lime)]"
                : "text-[color:var(--text-mute)] hover:text-[color:var(--text)]"
            }`}
          >
            💰 TOP WINNINGS
          </button>
        </div>

        {rows.length === 0 ? (
          <p className="mt-10 text-center font-ui-label text-[12px] tracking-widest text-[color:var(--text-mute)]">
            No degens on the board yet. Be the first.
          </p>
        ) : (
          <ol className="mt-6 space-y-2">
            {rows.map((r, i) => (
              <li
                key={r.walletAddress}
                className={`flex items-center justify-between rounded-2xl border-2 border-[color:var(--border-soft)] bg-[color:var(--surface)]/80 px-5 py-4 backdrop-blur transition hover:border-[color:var(--lime)]/60 ${
                  i === 0 ? "ring-2 ring-[color:var(--gold-2)]/60" : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`w-8 text-right font-display text-3xl ${podiumColor(i)}`}>
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-mono text-sm text-[color:var(--text)]">
                      {shortAddr(r.walletAddress)}
                    </p>
                    <p className="font-ui-label text-[9px] tracking-widest text-[color:var(--text-mute)]">
                      {r.played} games played
                    </p>
                  </div>
                </div>
                {tab === "streak" ? (
                  <span className="font-display text-3xl text-[color:var(--gold-1)]">
                    🔥 {r.streak}
                  </span>
                ) : (
                  <span className="font-display text-3xl text-[color:var(--lime)]">
                    ${r.totalWon.toFixed(2)}
                  </span>
                )}
              </li>
            ))}
          </ol>
        )}
      </section>

      <ChestMascot />
      <OracleMascot />
      <WinnersTicker />
    </main>
  )
}
