"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import StatsCard from "@/components/bluff/StatsCard"
import Leaderboard from "@/components/bluff/Leaderboard"
import WinnersTicker from "@/components/bluff/WinnersTicker"

type DailyStatus = { claimed: boolean; amount: string }
type ClaimResult = {
  ok?: boolean
  amount?: string
  txHash?: string
  explorerUrl?: string
  error?: string
}

export default function LobbyPage() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [status, setStatus] = useState<DailyStatus | null>(null)
  const [claiming, setClaiming] = useState(false)
  const [result, setResult] = useState<ClaimResult | null>(null)

  useEffect(() => {
    try {
      const addr = sessionStorage.getItem("arc:walletAddress")
      if (!addr) return
      setWalletAddress(addr)
      fetch(`/api/daily/status?walletAddress=${addr}`)
        .then((r) => r.json())
        .then(setStatus)
        .catch(() => {})
    } catch {}
  }, [])

  const claim = async () => {
    if (!walletAddress || claiming) return
    setClaiming(true)
    try {
      const res = await fetch("/api/daily/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress }),
      })
      const json = (await res.json()) as ClaimResult
      setResult(json)
      if (res.ok) setStatus({ claimed: true, amount: json.amount ?? "0.10" })
    } catch (err: any) {
      setResult({ error: err?.message ?? "claim failed" })
    } finally {
      setClaiming(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-6 pb-24 pt-10">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-5xl tracking-tight">
          <span className="text-[color:var(--amber)]">B</span>
          <span className="text-[color:var(--magenta)]">L</span>
          <span className="text-[color:var(--cyan)]">U</span>
          <span className="text-[color:var(--green)]">F</span>
          <span className="text-[color:var(--amber)]">F</span>
        </h1>
        <Link
          href="/"
          className="font-ui-label text-[10px] tracking-widest text-[color:var(--text-mute)] hover:text-[color:var(--text)]"
        >
          ← Home
        </Link>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <StatsCard walletAddress={walletAddress} />

          {/* Daily bonus */}
          <div className="bluff-card bluff-card-a">
            <div className="bluff-card-inner">
              <div className="flex items-center justify-between">
                <p className="font-ui-label text-[11px] tracking-widest text-[color:var(--cyan)]">
                  ◆ DAILY BONUS
                </p>
                <p className="font-ui-label text-[10px] text-[color:var(--text-mute)]">
                  resets at UTC midnight
                </p>
              </div>
              {!walletAddress ? (
                <p className="mt-3 font-ui-label text-xs text-[color:var(--amber)]/80">
                  Sign in to claim your $0.10.{" "}
                  <Link href="/" className="underline">
                    Go home
                  </Link>
                </p>
              ) : status?.claimed ? (
                <button
                  disabled
                  className="mt-3 w-full cursor-not-allowed rounded-md border border-[color:var(--border)] bg-black/40 px-6 py-3 font-ui-label text-sm text-[color:var(--text-mute)]"
                >
                  Come back tomorrow
                </button>
              ) : (
                <button
                  onClick={claim}
                  disabled={claiming || status == null}
                  className="mt-3 w-full rounded-md border border-[color:var(--green)]/50 bg-[color:var(--green)]/15 px-6 py-3 font-display text-xl tracking-tight text-[color:var(--green)] hover:bg-[color:var(--green)]/25 disabled:opacity-50"
                >
                  {claiming ? "Sending…" : "CLAIM $0.10 DAILY BONUS"}
                </button>
              )}
              {result?.ok && result.explorerUrl && (
                <p className="mt-2 font-ui-label text-[10px] text-[color:var(--green)]">
                  Paid ${result.amount} ·{" "}
                  <a
                    href={result.explorerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    view on Arc explorer
                  </a>
                </p>
              )}
              {result?.error && (
                <p className="mt-2 font-ui-label text-[10px] text-rose-300">
                  {result.error}
                </p>
              )}
            </div>
          </div>

          {/* Huge PLAY NOW */}
          <Link
            href="/play?auto=1"
            className="play-cta block w-full rounded-2xl px-10 py-10 text-center font-display text-6xl tracking-tight transition hover:scale-[1.01]"
          >
            PLAY NOW
          </Link>
          <p className="text-center font-ui-label text-[10px] tracking-widest text-[color:var(--text-mute)]">
            Spot the bluff · Win up to 5× · One minute per round
          </p>
        </div>

        <aside>
          <Leaderboard />
        </aside>
      </div>

      <WinnersTicker />
    </main>
  )
}
