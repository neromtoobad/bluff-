"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import EmailLogin from "@/components/EmailLogin"
import WalletConnect from "@/components/WalletConnect"
import WalletBadge from "@/components/WalletBadge"
import BetTotals from "@/components/BetTotals"
import BettingPanel from "@/components/BettingPanel"
import AgentFeed from "@/components/AgentFeed"
import Lobby from "@/components/Lobby"
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
  // 'lobby' → countdown + open betting; 'live' → debate streams + arena UI.
  // If the server already has a debate running/done when we land, skip lobby.
  const [phase, setPhase] = useState<"lobby" | "live">("lobby")
  const [phaseDecided, setPhaseDecided] = useState(false)
  // Lobby countdown lifted up to the arena page so the BettingPanel can
  // stay mounted across the lobby → live transition (which fixes
  // disappearing bets when the user clicks Place Bet near the boundary).
  const [lobbyCountdown, setLobbyCountdown] = useState<number | null>(null)
  const [verdictDismissed, setVerdictDismissed] = useState(false)

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

  // Decide lobby vs live once we have the first server snapshot. If a
  // debate is already running/judging/done, skip the lobby.
  useEffect(() => {
    if (phaseDecided || !arena) return
    if (arena.status !== "idle") setPhase("live")
    setPhaseDecided(true)
  }, [arena, phaseDecided])

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
        <div className="flex flex-col md:flex-row items-stretch gap-4">
          <EmailLogin onWallet={setWallet} />
          <div className="flex items-center justify-center text-[10px] uppercase tracking-[0.3em] text-zinc-600">
            or
          </div>
          <WalletConnect onConnect={setWallet} />
        </div>
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

  const topicValue = queryTopic ?? arena?.topic ?? null

  return (
    <div className="min-h-screen flex flex-col bg-[color:var(--bg)] overflow-hidden">
      {/* MATCHUP BANNER */}
      <header className="scanlines border-b border-[color:var(--border)] bg-[color:var(--bg-deep)]/85">
        {/* Top utility row */}
        <div className="mx-auto max-w-7xl px-4 pt-3 pb-2 flex items-center gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-ui-label text-[10px] text-[color:var(--text-mute)]">
              Arena
            </span>
            <span className="font-mono text-[11px] text-zinc-400">
              #{params.id}
            </span>
            <WalletBadge address={wallet} />
          </div>
          <div className="flex-1" />
          <div className="shrink-0 flex items-center gap-3">
            <span
              className="font-ui-label text-[10px]"
              style={{
                color: live ? "var(--accent)" : "var(--text-mute)",
              }}
            >
              {live && (
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full mr-1.5 align-middle dot-pulse"
                  style={{ background: "var(--accent)" }}
                />
              )}
              {roundLabel}
            </span>
            <BetTotals variant="compact" />
          </div>
        </div>

        {/* Topic display */}
        {topicValue && (
          <div className="mx-auto max-w-7xl px-4 text-center">
            <p className="font-ui-label text-[10px] text-[color:var(--text-mute)]">
              Tonight's debate
            </p>
            <p className="mt-0.5 font-mono italic text-sm sm:text-base text-zinc-100 underline underline-offset-4 decoration-[color:var(--text-mute)]/40">
              {topicValue}
            </p>
          </div>
        )}

        {/* Massive matchup headline */}
        <div className="mx-auto max-w-7xl px-4 pt-2 pb-3 flex items-center justify-center">
          <h1 className="font-display text-5xl sm:text-7xl md:text-8xl leading-[0.92] tracking-tight flex items-baseline gap-3 sm:gap-5">
            <span
              style={{
                color: "var(--bull)",
                textShadow:
                  "0 0 14px rgba(247,183,49,0.4), 0 0 42px rgba(247,183,49,0.2)",
              }}
            >
              AGENT BULL
            </span>
            <span
              className="inline-flex items-center justify-center text-3xl sm:text-5xl md:text-6xl"
              style={{
                background:
                  "linear-gradient(90deg, var(--bull) 0%, #ffffff 50%, var(--bear) 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                filter:
                  "drop-shadow(0 0 14px rgba(255,255,255,0.25))",
              }}
            >
              🆚
            </span>
            <span
              style={{
                color: "var(--bear)",
                textShadow:
                  "0 0 14px rgba(255,59,59,0.4), 0 0 42px rgba(255,59,59,0.2)",
              }}
            >
              AGENT BEAR
            </span>
          </h1>
        </div>
      </header>

      {/* MAIN — BettingPanel + BetTotals stay mounted across both phases
          so a bet placed near the countdown boundary doesn't get eaten by
          a remount. The left column swaps Lobby ↔ AgentFeed on phase. */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-3 py-3 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-3">
        <section className="min-w-0">
          {phase === "lobby" ? (
            <Lobby
              topic={queryTopic ?? arena?.topic ?? "TBD"}
              onTick={(s) => setLobbyCountdown(s)}
              onStart={() => {
                setLobbyCountdown(null)
                setPhase("live")
              }}
            />
          ) : (
            <AgentFeed
              topic={queryTopic ?? undefined}
              onRoundChange={(r) => setIntroRound(r)}
            />
          )}
        </section>

        <aside className="space-y-3">
          <BetTotals variant="panel" />
          <BettingPanel
            walletAddress={wallet}
            countdownSeconds={phase === "lobby" ? lobbyCountdown : null}
          />
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

      {/* VERDICT OVERLAY — dismissable now, has START NEW FIGHT exit */}
      {verdictReady && !verdictDismissed && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/85 backdrop-blur-md p-6 overflow-y-auto">
          <div className="w-full max-w-4xl my-8 relative">
            <button
              type="button"
              onClick={() => setVerdictDismissed(true)}
              aria-label="Close verdict"
              className="absolute -top-2 -right-2 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-zinc-100"
            >
              ✕
            </button>
            <ScoreBoard onClose={() => setVerdictDismissed(true)} />
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
