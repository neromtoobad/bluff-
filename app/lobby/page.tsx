"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import StreakBadge from "@/components/bluff/StreakBadge"

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
  const [streak, setStreak] = useState<number>(0)
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
      fetch(`/api/streak?walletAddress=${addr}`)
        .then((r) => r.json())
        .then((j) => setStreak(j.streak ?? 0))
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
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-10 bg-[color:var(--bg)]">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-4xl tracking-tight">Lobby</h1>
        <div className="flex items-center gap-3">
          <StreakBadge streak={streak} />
          <Link
            href="/play"
            className="rounded-md border border-[color:var(--accent)]/40 bg-[color:var(--accent-soft)] px-3 py-1.5 font-ui-label text-[11px] text-[color:var(--accent)] hover:bg-[color:var(--accent)]/20"
          >
            Play
          </Link>
        </div>
      </header>

      <section className="rounded-lg border border-[color:var(--border-soft)] bg-[color:var(--bg-card)] p-6">
        <p className="font-ui-label text-[10px] uppercase tracking-wider text-[color:var(--text-mute)]">
          Daily bonus
        </p>
        <p className="mt-2 font-display text-3xl">
          $0.10 USDC · once per UTC day
        </p>

        {!walletAddress ? (
          <p className="mt-4 font-ui-label text-xs text-amber-300/80">
            Sign in or connect a wallet to claim.{" "}
            <Link href="/" className="underline">
              Go home
            </Link>
          </p>
        ) : status?.claimed ? (
          <button
            disabled
            className="mt-4 w-full cursor-not-allowed rounded-md border border-[color:var(--border-soft)] bg-black/40 px-6 py-4 font-ui-label text-sm text-[color:var(--text-mute)]"
          >
            Come back tomorrow
          </button>
        ) : (
          <button
            onClick={claim}
            disabled={claiming || status == null}
            className="mt-4 w-full rounded-md border border-emerald-400/50 bg-emerald-400/15 px-6 py-4 font-display text-xl tracking-tight text-emerald-200 hover:bg-emerald-400/25 disabled:opacity-50"
          >
            {claiming ? "Sending…" : "CLAIM $0.10 DAILY BONUS"}
          </button>
        )}

        {result?.ok && result.explorerUrl && (
          <p className="mt-3 font-ui-label text-[10px] text-emerald-300">
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
          <p className="mt-3 font-ui-label text-[10px] text-rose-300">{result.error}</p>
        )}
      </section>

      <section className="rounded-lg border border-[color:var(--border-soft)] bg-[color:var(--bg-card)] p-6">
        <p className="font-ui-label text-[10px] uppercase tracking-wider text-[color:var(--text-mute)]">
          Multipliers
        </p>
        <ul className="mt-3 grid grid-cols-2 gap-2 font-mono text-sm md:grid-cols-4">
          <li className="rounded border border-[color:var(--border-soft)] p-2">0–2 → 1.9×</li>
          <li className="rounded border border-amber-400/40 p-2 text-amber-300">3–4 → 2.5×</li>
          <li className="rounded border border-orange-500/50 p-2 text-orange-300">5–9 → 3×</li>
          <li className="rounded border border-rose-500/60 p-2 text-rose-300">10+ → 5×</li>
        </ul>
      </section>
    </main>
  )
}
