"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import AgentCard from "@/components/bluff/AgentCard"
import ClaimDisplay from "@/components/bluff/ClaimDisplay"
import BetButtons, { type Pick } from "@/components/bluff/BetButtons"
import Reveal from "@/components/bluff/Reveal"
import StreakBadge from "@/components/bluff/StreakBadge"
import FullscreenFlash from "@/components/bluff/FullscreenFlash"
import Confetti from "@/components/bluff/Confetti"
import { ChestMascot, OracleMascot } from "@/components/bluff/Mascots"
import Link from "next/link"
import * as audio from "@/lib/audio"

type Phase = "idle" | "loading" | "streaming" | "betting" | "revealed"

type RevealData = { liar: "A" | "B"; truth: string; source: string }

type PlacedBet = {
  pick: Pick
  amount: number
  txHash?: string
  explorerUrl?: string
  pending?: boolean
  error?: string
}

type SettleReceipt = {
  walletAddress: string
  won: boolean
  payout: string
  multiplier: number
  streakAfter: number
  txHash?: string
  explorerUrl?: string
}

const NEXT_ROUND_DELAY_SEC = 10

export default function PlayPage() {
  const [autoStart, setAutoStart] = useState(false)
  const [phase, setPhase] = useState<Phase>("idle")
  const [topic, setTopic] = useState<string>("")
  const [claimA, setClaimA] = useState("")
  const [claimB, setClaimB] = useState("")
  const [speaking, setSpeaking] = useState<"A" | "B" | null>(null)
  const [deadline, setDeadline] = useState<number>(0)
  const [now, setNow] = useState<number>(Date.now())
  const [bet, setBet] = useState<PlacedBet | null>(null)
  const [reveal, setReveal] = useState<RevealData | null>(null)
  const [tell, setTell] = useState<string | null>(null)
  const [streak, setStreak] = useState<number>(0)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [settleReceipt, setSettleReceipt] = useState<SettleReceipt | null>(null)
  const [flash, setFlash] = useState<
    | { tone: "win" | "loss"; title: string; subtitle?: string }
    | null
  >(null)
  const [confetti, setConfetti] = useState(false)
  const [nextIn, setNextIn] = useState<number | null>(null)
  const [topicUrl, setTopicUrl] = useState<string | null>(null)
  const roundIdRef = useRef<string | null>(null)
  const esRef = useRef<EventSource | null>(null)
  const autoStartedRef = useRef(false)

  // Read ?auto=1 once on mount (client-only — avoids Suspense boundary).
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      if (params.get("auto") === "1") setAutoStart(true)
    } catch {}
  }, [])

  // Wallet + streak.
  useEffect(() => {
    try {
      const addr = sessionStorage.getItem("arc:walletAddress")
      if (addr) {
        setWalletAddress(addr)
        fetch(`/api/streak?walletAddress=${addr}`)
          .then((r) => r.json())
          .then((j) => setStreak(j.streak ?? 0))
          .catch(() => {})
      }
    } catch {}
  }, [])

  // Countdown tick.
  useEffect(() => {
    if (phase !== "streaming" && phase !== "betting") return
    const t = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(t)
  }, [phase])

  useEffect(() => () => esRef.current?.close(), [])

  const settle = useCallback(
    async (roundId: string, currentBet: PlacedBet | null, liar: "A" | "B") => {
      try {
        const res = await fetch("/api/round/settle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roundId }),
        })
        const json = await res.json()
        if (json?.tell) setTell(json.tell)
        const receipts = (json?.receipts ?? []) as SettleReceipt[]
        const mine = walletAddress
          ? receipts.find(
              (r) => r.walletAddress.toLowerCase() === walletAddress.toLowerCase(),
            )
          : null
        if (mine) {
          setSettleReceipt(mine)
          setStreak(mine.streakAfter)
          if (mine.won) {
            setConfetti(true)
            try { audio.winnerReveal() } catch {}
            setFlash({
              tone: "win",
              title: "HOT STREAK",
              subtitle: `×${mine.multiplier} — PAYOUT $${mine.payout}`,
            })
          } else if (currentBet) {
            const priorStreak = streak
            if (priorStreak >= 3) {
              setFlash({ tone: "loss", title: "STREAK BROKEN" })
            } else {
              setFlash({ tone: "loss", title: "BLUFF MISSED" })
            }
            try { audio.roundEnd() } catch {}
          }
        } else if (currentBet) {
          // No wallet — local outcome. User picks the TRUTH-teller now,
          // so they win iff they did NOT pick the liar.
          const won = currentBet.pick !== liar
          if (won) {
            setStreak((s) => s + 1)
            setConfetti(true)
            try { audio.winnerReveal() } catch {}
            setFlash({ tone: "win", title: "YOU WIN" })
          } else {
            if (streak >= 3) setFlash({ tone: "loss", title: "STREAK BROKEN" })
            else setFlash({ tone: "loss", title: "BLUFF MISSED" })
            try { audio.roundEnd() } catch {}
            setStreak(0)
          }
        }
      } catch {}
    },
    [walletAddress, streak],
  )

  const startRound = useCallback(async () => {
    setPhase("loading")
    setClaimA("")
    setClaimB("")
    setBet(null)
    setReveal(null)
    setSettleReceipt(null)
    setSpeaking(null)
    setTell(null)
    setConfetti(false)
    setNextIn(null)

    try { audio.roundBell() } catch {}
    try { audio.startCrowdAmbience(0.04) } catch {}

    const res = await fetch("/api/round/start", { method: "POST" })
    if (!res.ok) {
      setPhase("idle")
      return
    }
    const { roundId, topic: t, topicUrl: tu, liarRevealedAt } = await res.json()
    roundIdRef.current = roundId
    setTopic(t)
    setTopicUrl(tu ?? null)
    setDeadline(liarRevealedAt)
    setPhase("streaming")

    const es = new EventSource(`/api/round/stream?roundId=${roundId}`)
    esRef.current = es

    es.addEventListener("agent_start", (e) => {
      const { agent } = JSON.parse((e as MessageEvent).data)
      setSpeaking(agent)
    })
    es.addEventListener("agent_token", (e) => {
      const { agent, token } = JSON.parse((e as MessageEvent).data)
      if (agent === "A") setClaimA((s) => s + token)
      else setClaimB((s) => s + token)
    })
    es.addEventListener("agent_done", () => setSpeaking(null))
    es.addEventListener("betting_open", (e) => {
      const { deadline: d } = JSON.parse((e as MessageEvent).data)
      setDeadline(d)
      setPhase("betting")
    })
    es.addEventListener("reveal", (e) => {
      const data = JSON.parse((e as MessageEvent).data) as RevealData
      setReveal(data)
      setPhase("revealed")
      es.close()
      setTimeout(() => {
        setBet((current) => {
          settle(roundId, current, data.liar)
          return current
        })
      }, 50)
    })
    es.onerror = () => es.close()
  }, [settle])

  // Auto-start when navigated from /lobby?auto=1.
  useEffect(() => {
    if (autoStart && !autoStartedRef.current && phase === "idle") {
      autoStartedRef.current = true
      startRound()
    }
  }, [autoStart, phase, startRound])

  // Continuous play: 10-second countdown after reveal → next round.
  useEffect(() => {
    if (phase !== "revealed") return
    setNextIn(NEXT_ROUND_DELAY_SEC)
    const t = setInterval(() => {
      setNextIn((n) => {
        if (n == null) return n
        if (n <= 1) {
          clearInterval(t)
          startRound()
          return null
        }
        return n - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [phase, startRound])

  const placeBet = async (pick: Pick, amount: number) => {
    if (phase !== "betting") return
    const roundId = roundIdRef.current
    if (!roundId) return

    if (!walletAddress) {
      setBet({ pick, amount, error: "no wallet — simulated bet only" })
      return
    }

    setBet({ pick, amount, pending: true })
    try {
      let txHash: string | undefined
      let explorerUrl: string | undefined
      const mode = sessionStorage.getItem("arc:walletMode")
      const escrow = process.env.NEXT_PUBLIC_ARENA_ESCROW_ADDRESS as
        | string
        | undefined
      if (mode === "browser" && escrow && (window as any).ethereum) {
        const { getBrowserKit } = await import("@/lib/arc")
        const { kit, adapter } = await getBrowserKit((window as any).ethereum)
        const result = await kit.send({
          from: { adapter, chain: "Arc_Testnet" },
          to: escrow,
          amount: amount.toFixed(2),
          token: "USDC",
        })
        if (result.state !== "success") throw new Error("transfer not finalized")
        txHash = result.txHash
        explorerUrl = result.explorerUrl
      }

      const res = await fetch("/api/round/bet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roundId,
          walletAddress,
          pick,
          amount: amount.toFixed(2),
          ...(txHash ? { txHash, explorerUrl } : {}),
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error ?? "bet rejected")
      setBet({
        pick,
        amount,
        txHash: json.bet?.txHash,
        explorerUrl: json.bet?.explorerUrl,
      })
    } catch (err: any) {
      setBet({ pick, amount, error: err?.message ?? "bet failed" })
    }
  }

  const playAgainNow = () => {
    setNextIn(null)
    startRound()
  }

  const secondsLeft = Math.max(0, Math.ceil((deadline - now) / 1000))

  return (
    <main className="relative mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-6 pb-24 pt-6">
      <div className="rays-bg" />
      <div className="forest-ridge" />
      <FullscreenFlash
        show={flash != null}
        tone={flash?.tone ?? "win"}
        title={flash?.title ?? ""}
        subtitle={flash?.subtitle}
        onDone={() => setFlash(null)}
      />
      <Confetti show={confetti} />

      <header className="relative z-10 flex items-center justify-between">
        <Link href="/lobby" className="font-display text-2xl tracking-widest text-[color:var(--gold-1)]">
          BL<span className="text-[color:var(--lime)]">◯</span>FF
        </Link>
        <div className="flex items-center gap-3">
          <StreakBadge streak={streak} />
          {(phase === "streaming" || phase === "betting") && (
            <span className="rounded-full border border-[color:var(--gold-2)]/50 bg-[color:var(--gold-2)]/10 px-3 py-1 font-display text-lg text-[color:var(--gold-1)]">
              {secondsLeft}s
            </span>
          )}
        </div>
      </header>

      {phase === "idle" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <p className="max-w-md text-center font-ui-label text-xs tracking-widest text-[color:var(--text-mute)]">
            Two agents make a claim. One is lying. Spot the bluff.
          </p>
          {!walletAddress && (
            <p className="text-center font-ui-label text-[10px] text-[color:var(--amber)]/80">
              No wallet connected — bets run in mock mode.{" "}
              <a href="/" className="underline">
                sign in
              </a>
            </p>
          )}
          <button onClick={startRound} className="lime-cta rounded-2xl px-14 py-6 font-display text-4xl tracking-tight">
            DEAL ME IN
          </button>
        </div>
      )}

      {phase === "loading" && (
        <div className="flex flex-1 items-center justify-center font-ui-label text-xs tracking-widest text-[color:var(--gold-1)]">
          ◆ SHUFFLING THE DECK…
        </div>
      )}

      {phase !== "idle" && phase !== "loading" && (
        <>
          <section className="relative z-10 rounded-2xl border-2 border-[color:var(--border-soft)] bg-[color:var(--surface)]/85 p-4 backdrop-blur">
            <p className="font-ui-label text-[10px] uppercase tracking-widest text-[color:var(--lime)]">
              ◆ CLAIM UNDER DEBATE
            </p>
            <p className="mt-1 font-display text-2xl leading-snug">{topic}</p>
          </section>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <AgentCard
              agent="A"
              isSpeaking={speaking === "A"}
              flipped={phase === "revealed" && reveal?.liar === "A"}
              highlight={
                phase === "revealed" && reveal
                  ? reveal.liar === "A"
                    ? "loser"
                    : "winner"
                  : null
              }
            >
              <ClaimDisplay text={claimA} active={speaking === "A"} agent="A" />
            </AgentCard>
            <AgentCard
              agent="B"
              isSpeaking={speaking === "B"}
              flipped={phase === "revealed" && reveal?.liar === "B"}
              highlight={
                phase === "revealed" && reveal
                  ? reveal.liar === "B"
                    ? "loser"
                    : "winner"
                  : null
              }
            >
              <ClaimDisplay text={claimB} active={speaking === "B"} agent="B" />
            </AgentCard>
          </section>

          {phase !== "revealed" && (
            <div className="space-y-2">
              <BetButtons
                enabled={phase === "betting" && !bet}
                onBet={placeBet}
                placed={
                  bet && !bet.error
                    ? { pick: bet.pick, amount: bet.amount }
                    : null
                }
              />
              {bet?.pending && (
                <p className="text-center font-ui-label text-[10px] text-[color:var(--text-mute)]">
                  Escrowing your USDC on Arc…
                </p>
              )}
              {bet?.error && (
                <p className="text-center font-ui-label text-[10px] text-rose-300">
                  {bet.error}
                </p>
              )}
              {bet && !bet.pending && !bet.error && (
                <p className="text-center font-ui-label text-[10px] text-[color:var(--green)]">
                  Bet locked ✓{" "}
                  {bet.explorerUrl && (
                    <a
                      href={bet.explorerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="underline"
                    >
                      view on Arc explorer
                    </a>
                  )}
                </p>
              )}
            </div>
          )}

          {phase === "revealed" && reveal && (
            <>
              <Reveal
                liar={reveal.liar}
                truth={reveal.truth}
                source={reveal.source}
                topicUrl={topicUrl}
                userPick={bet?.pick ?? null}
                userAmount={bet?.amount ?? 0}
                tell={tell}
                nextInSeconds={nextIn}
                onNext={playAgainNow}
              />
              {settleReceipt?.won && settleReceipt.explorerUrl && (
                <p className="text-center font-ui-label text-[10px] text-[color:var(--green)]">
                  Payout sent ·{" "}
                  <a
                    href={settleReceipt.explorerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    view on Arc explorer
                  </a>
                </p>
              )}
            </>
          )}
        </>
      )}

      <ChestMascot />
      <OracleMascot />
    </main>
  )
}
