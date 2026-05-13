"use client"

import { useEffect, useState } from "react"
import EmailLogin from "@/components/EmailLogin"
import WalletBadge from "@/components/WalletBadge"
import BetTotals from "@/components/BetTotals"
import BettingPanel from "@/components/BettingPanel"
import AgentFeed from "@/components/AgentFeed"
import ResearchTicker from "@/components/ResearchTicker"
import ScoreBoard from "@/components/ScoreBoard"

type ArenaState = {
  status: "idle" | "running" | "judging" | "done" | "error"
  round: number
  topic: string | null
  verdict: unknown | null
}

const TOTAL_ROUNDS = 4

export default function ArenaPage({ params }: { params: { id: string } }) {
  const [wallet, setWallet] = useState<string | null>(null)
  const [arena, setArena] = useState<ArenaState | null>(null)

  useEffect(() => {
    let cancelled = false
    async function tick() {
      try {
        const res = await fetch("/api/debate/state", { cache: "no-store" })
        if (!res.ok) return
        const json = (await res.json()) as ArenaState
        if (!cancelled) setArena(json)
      } catch {}
    }
    tick()
    const id = setInterval(tick, 1500)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  if (!wallet) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-6">
        <header className="text-center">
          <p className="text-xs uppercase tracking-widest text-zinc-500">
            Arena #{params.id}
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            Agent Battle Arena
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Sign in to bet on the debate.
          </p>
        </header>
        <EmailLogin onWallet={setWallet} />
      </main>
    )
  }

  const verdictReady = arena?.verdict != null
  const roundLabel =
    arena?.status === "done"
      ? "Finished"
      : arena?.status === "judging"
        ? "Judging"
        : arena?.round && arena.round > 0
          ? `Round ${arena.round} of ${TOTAL_ROUNDS}`
          : "Warming up"

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950">
      {/* TOP BAR */}
      <header className="sticky top-0 z-20 border-b border-zinc-800 bg-zinc-950/85 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs uppercase tracking-widest text-zinc-500">
              Arena
            </span>
            <span className="font-mono text-xs text-zinc-400">#{params.id}</span>
            <WalletBadge address={wallet} />
          </div>

          <div className="flex-1 flex justify-center">
            <div className="rounded-full border border-zinc-700 bg-zinc-900 px-4 py-1.5 text-xs text-zinc-200">
              {roundLabel}
            </div>
          </div>

          <div className="shrink-0 w-[360px]">
            <BetTotals />
          </div>
        </div>
      </header>

      {/* MAIN */}
      <div className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <section className="min-w-0">
          {arena?.topic && (
            <p className="mb-4 text-sm text-zinc-400">
              Topic: <span className="text-zinc-100">{arena.topic}</span>
            </p>
          )}
          <AgentFeed />
        </section>

        <aside className="space-y-4">
          <BettingPanel walletAddress={wallet} />
        </aside>
      </div>

      {/* BOTTOM BAR */}
      <footer className="sticky bottom-0 z-20">
        <ResearchTicker variant="bar" />
      </footer>

      {/* OVERLAY */}
      {verdictReady && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-6 overflow-y-auto">
          <div className="w-full max-w-4xl my-8">
            <ScoreBoard />
          </div>
        </div>
      )}
    </div>
  )
}
