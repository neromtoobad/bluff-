"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import EmailLogin from "@/components/EmailLogin"
import WalletBadge from "@/components/WalletBadge"
import BetTotals from "@/components/BetTotals"
import BettingPanel from "@/components/BettingPanel"
import AgentFeed from "@/components/AgentFeed"
import ResearchTicker from "@/components/ResearchTicker"
import RoundIntro from "@/components/RoundIntro"
import ScoreBoard from "@/components/ScoreBoard"

type ArenaState = {
  status: "idle" | "running" | "judging" | "done" | "error"
  round: number
  topic: string | null
  verdict: unknown | null
}

const TOTAL_ROUNDS = 4

export default function ArenaPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams()
  const queryTopic = searchParams.get("topic")
  const [wallet, setWallet] = useState<string | null>(null)
  const [arena, setArena] = useState<ArenaState | null>(null)
  const [introRound, setIntroRound] = useState<number | null>(null)

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
          <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">
            Arena #{params.id}
          </p>
          <h1 className="mt-1 text-3xl font-black tracking-tight">
            AGENT BATTLE ARENA
          </h1>
          <p className="mt-2 text-xs text-zinc-500 uppercase tracking-wider">
            Sign in to bet
          </p>
        </header>
        <EmailLogin onWallet={setWallet} />
      </main>
    )
  }

  const verdictReady = arena?.verdict != null
  const roundLabel =
    arena?.status === "done"
      ? "FINAL"
      : arena?.status === "judging"
        ? "JUDGING"
        : arena?.round && arena.round > 0
          ? `R${arena.round}/${TOTAL_ROUNDS}`
          : "PRE-FIGHT"
  const live = arena?.status === "running"

  return (
    <div className="min-h-screen flex flex-col bg-[color:var(--bg)] overflow-hidden">
      {/* MATCHUP BANNER */}
      <header className="border-b border-[color:var(--border)] bg-black/60">
        <div className="mx-auto max-w-7xl px-3 py-2 flex items-center gap-3">
          {/* Left: arena + wallet */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">
              Arena
            </span>
            <span className="font-mono text-[11px] text-zinc-400">
              #{params.id}
            </span>
            <WalletBadge address={wallet} />
          </div>

          {/* Center: BULL vs BEAR */}
          <div className="flex-1 flex items-center justify-center gap-4">
            <Fighter team="bull" name="BULL" emoji="🐂" align="right" />
            <div className="flex flex-col items-center">
              <span
                className="text-[10px] uppercase tracking-[0.3em] font-bold"
                style={{
                  color: live ? "var(--accent)" : "var(--text-mute)",
                }}
              >
                {live && (
                  <span
                    className="inline-block h-1.5 w-1.5 rounded-full mr-1 align-middle dot-pulse"
                    style={{ background: "var(--accent)" }}
                  />
                )}
                {roundLabel}
              </span>
              <span className="text-2xl font-black text-zinc-600 leading-none tracking-tighter">
                VS
              </span>
            </div>
            <Fighter team="bear" name="BEAR" emoji="🐻" align="left" />
          </div>

          {/* Right: pot */}
          <div className="shrink-0">
            <BetTotals variant="compact" />
          </div>
        </div>

        {/* Topic strip */}
        {(queryTopic || arena?.topic) && (
          <div className="border-t border-[color:var(--border)] bg-black/40">
            <div className="mx-auto max-w-7xl px-3 py-1.5 text-center">
              <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 mr-2">
                Topic
              </span>
              <span className="text-xs font-bold text-zinc-100">
                {queryTopic ?? arena?.topic}
              </span>
            </div>
          </div>
        )}
      </header>

      {/* MAIN */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-3 py-3 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-3">
        <section className="min-w-0">
          <AgentFeed
            topic={queryTopic ?? undefined}
            onRoundChange={(r) => setIntroRound(r)}
          />
        </section>

        <aside className="space-y-3">
          <BetTotals variant="panel" />
          <BettingPanel walletAddress={wallet} />
        </aside>
      </main>

      {/* TICKER */}
      <footer className="sticky bottom-0 z-20">
        <ResearchTicker variant="bar" />
      </footer>

      {/* ROUND INTRO */}
      <RoundIntro
        round={introRound}
        totalRounds={TOTAL_ROUNDS}
        onDone={() => setIntroRound(null)}
      />

      {/* VERDICT OVERLAY */}
      {verdictReady && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/85 backdrop-blur-md p-6 overflow-y-auto">
          <div className="w-full max-w-4xl my-8">
            <ScoreBoard />
          </div>
        </div>
      )}
    </div>
  )
}

function Fighter({
  team,
  name,
  emoji,
  align,
}: {
  team: "bull" | "bear"
  name: string
  emoji: string
  align: "left" | "right"
}) {
  const color = team === "bull" ? "var(--bull)" : "var(--bear)"
  return (
    <div
      className={`flex items-center gap-2 ${align === "right" ? "flex-row-reverse text-right" : ""}`}
    >
      <span className="text-2xl leading-none">{emoji}</span>
      <div>
        <div
          className="text-base font-black tracking-widest leading-none"
          style={{ color }}
        >
          {name}
        </div>
        <div className="text-[9px] uppercase tracking-[0.25em] text-zinc-600">
          Agent {team === "bull" ? "A" : "B"}
        </div>
      </div>
    </div>
  )
}
