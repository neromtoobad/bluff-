"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import StatsCard from "@/components/bluff/StatsCard"
import Leaderboard from "@/components/bluff/Leaderboard"
import WinnersTicker from "@/components/bluff/WinnersTicker"
import { ChestMascot, OracleMascot } from "@/components/bluff/Mascots"

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
    <main className="relative mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-6 pb-32 pt-10">
      <div className="rays-bg" />
      <div className="forest-ridge" />

      <header className="relative z-10 flex items-center justify-between">
        <Link href="/" className="font-display text-2xl tracking-widest text-[color:var(--gold-1)]">
          BL<span className="text-[color:var(--lime)]">◯</span>FF
        </Link>
        <nav className="hidden gap-6 md:flex">
          <span className="font-ui-label text-[11px] tracking-widest text-[color:var(--lime)]">
            ◆ Lobby
          </span>
          <Link href="/play?auto=1" className="font-ui-label text-[11px] tracking-widest text-[color:var(--text-mute)] hover:text-white">
            Play
          </Link>
        </nav>
        <Link
          href="/play?auto=1"
          className="lime-cta rounded-lg px-4 py-2 font-ui-label text-[11px] tracking-widest"
        >
          {walletAddress ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}` : "Select Wallet"}
        </Link>
      </header>

      <div className="relative z-10 text-center">
        <p className="font-ui-label text-[11px] tracking-widest text-[color:var(--lime)]">
          ◆ JACKPOT TONIGHT
        </p>
        <h1 className="jackpot-title font-display text-7xl leading-tight md:text-8xl">
          $5.00 × MULTI
        </h1>
        <p className="mt-1 font-ui-label text-[11px] tracking-widest text-[color:var(--gold-1)]">
          Hit a 10-streak to unlock max payout
        </p>
      </div>

      <div className="relative z-10 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <StatsCard walletAddress={walletAddress} />

          {/* Daily bonus */}
          <div className="rounded-2xl border-2 border-[color:var(--border-soft)] bg-[color:var(--surface)]/85 p-5 backdrop-blur">
            <div className="flex items-center justify-between">
              <p className="font-display text-lg tracking-widest text-[color:var(--gold-1)]">
                ◆ DAILY BONUS
              </p>
              <p className="font-ui-label text-[10px] tracking-widest text-[color:var(--text-mute)]">
                resets at UTC midnight
              </p>
            </div>
            {!walletAddress ? (
              <p className="mt-3 font-ui-label text-xs text-[color:var(--gold-1)]/80">
                Sign in to claim your $0.10.{" "}
                <Link href="/" className="underline">
                  Go home
                </Link>
              </p>
            ) : status?.claimed ? (
              <button
                disabled
                className="mt-3 w-full cursor-not-allowed rounded-xl border border-[color:var(--border)] bg-black/40 px-6 py-3 font-ui-label text-sm text-[color:var(--text-mute)]"
              >
                Come back tomorrow
              </button>
            ) : (
              <button
                onClick={claim}
                disabled={claiming || status == null}
                className="lime-cta mt-3 w-full rounded-xl px-6 py-3 font-display text-xl tracking-tight disabled:opacity-50"
              >
                {claiming ? "Sending…" : "CLAIM $0.10 DAILY BONUS"}
              </button>
            )}
            {result?.ok && result.explorerUrl && (
              <p className="mt-2 font-ui-label text-[10px] text-[color:var(--lime)]">
                Paid ${result.amount} ·{" "}
                <a href={result.explorerUrl} target="_blank" rel="noreferrer" className="underline">
                  view on Arc explorer
                </a>
              </p>
            )}
            {result?.error && (
              <p className="mt-2 font-ui-label text-[10px] text-rose-300">{result.error}</p>
            )}
          </div>

          {/* PLAY NOW chunky lime CTA */}
          <Link
            href="/play?auto=1"
            className="lime-cta block w-full rounded-2xl px-10 py-8 text-center font-display text-5xl tracking-wide"
          >
            PLAY NOW
          </Link>
          <p className="text-center font-ui-label text-[10px] tracking-widest text-[color:var(--text-mute)]">
            One round · 60 seconds · 1% fee on payouts
          </p>
        </div>

        <aside>
          <Leaderboard />
        </aside>
      </div>

      <ChestMascot />
      <OracleMascot />
      <WinnersTicker />
    </main>
  )
}
