"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import StatsCard from "@/components/bluff/StatsCard"
import Leaderboard from "@/components/bluff/Leaderboard"
import LiveActivity from "@/components/bluff/LiveActivity"
import WinnersTicker from "@/components/bluff/WinnersTicker"
import { ChestMascot, OracleMascot } from "@/components/bluff/Mascots"
import TopNav from "@/components/bluff/TopNav"

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
    <main className="relative min-h-screen pb-32">
      <div className="rays-bg" />
      <div className="forest-ridge" />
      <TopNav compact />

      <section className="relative z-10 mx-auto max-w-6xl px-4 pt-2 text-center sm:px-6">
        <p className="font-ui-label text-[10px] tracking-widest text-[color:var(--lime)] sm:text-[11px]">
          ◆ JACKPOT TONIGHT
        </p>
        <h1 className="jackpot-title font-display text-5xl leading-tight sm:text-7xl md:text-9xl">
          $5.00 × MULTI
        </h1>
        <p className="mt-1 font-ui-label text-[10px] tracking-widest text-[color:var(--gold-1)] sm:text-[11px]">
          Hit a 10-streak to unlock max payout
        </p>
      </section>

      <section className="relative z-10 mx-auto mt-6 grid max-w-6xl grid-cols-1 gap-5 px-4 sm:px-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <StatsCard walletAddress={walletAddress} />

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
                Connect a wallet to claim your $0.10.
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

          <Link
            href="/play?auto=1"
            className="lime-cta block w-full rounded-2xl px-6 py-6 text-center font-display text-4xl tracking-wide sm:px-10 sm:py-8 sm:text-5xl"
          >
            PLAY NOW
          </Link>
          <p className="text-center font-ui-label text-[10px] tracking-widest text-[color:var(--text-mute)]">
            One round · 60 seconds · 1% fee on payouts
          </p>

          <Leaderboard />
        </div>

        <aside className="space-y-5">
          <LiveActivity />
        </aside>
      </section>

      <ChestMascot />
      <OracleMascot />
      <WinnersTicker />
    </main>
  )
}
