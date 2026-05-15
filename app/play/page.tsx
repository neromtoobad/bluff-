"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import AgentCard from "@/components/bluff/AgentCard"
import ClaimDisplay from "@/components/bluff/ClaimDisplay"
import BetButtons, { type Pick } from "@/components/bluff/BetButtons"
import Reveal from "@/components/bluff/Reveal"
import StreakBadge from "@/components/bluff/StreakBadge"

type Phase = "idle" | "loading" | "streaming" | "betting" | "revealed"

type RevealData = { liar: "A" | "B"; truth: string; source: string }

export default function PlayPage() {
  const [phase, setPhase] = useState<Phase>("idle")
  const [topic, setTopic] = useState<string>("")
  const [claimA, setClaimA] = useState("")
  const [claimB, setClaimB] = useState("")
  const [speaking, setSpeaking] = useState<"A" | "B" | null>(null)
  const [deadline, setDeadline] = useState<number>(0)
  const [now, setNow] = useState<number>(Date.now())
  const [bet, setBet] = useState<{ pick: Pick; amount: number } | null>(null)
  const [reveal, setReveal] = useState<RevealData | null>(null)
  const [streak, setStreak] = useState<number>(0)
  const esRef = useRef<EventSource | null>(null)

  // Countdown tick — only when there's a live deadline.
  useEffect(() => {
    if (phase !== "streaming" && phase !== "betting") return
    const t = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(t)
  }, [phase])

  useEffect(() => () => esRef.current?.close(), [])

  const startRound = useCallback(async () => {
    setPhase("loading")
    setClaimA("")
    setClaimB("")
    setBet(null)
    setReveal(null)
    setSpeaking(null)

    const res = await fetch("/api/round/start", { method: "POST" })
    if (!res.ok) {
      setPhase("idle")
      return
    }
    const { roundId, topic: t, liarRevealedAt } = await res.json()
    setTopic(t)
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
      setBet((b) => {
        if (b && b.pick === data.liar) setStreak((s) => s + 1)
        else if (b) setStreak(0)
        return b
      })
      es.close()
    })
    es.onerror = () => {
      es.close()
    }
  }, [])

  const placeBet = (pick: Pick, amount: number) => {
    if (phase !== "betting") return
    setBet({ pick, amount })
  }

  const secondsLeft = Math.max(0, Math.ceil((deadline - now) / 1000))

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-6 py-10 bg-[color:var(--bg)]">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-4xl tracking-tight">BLUFF</h1>
        <div className="flex items-center gap-3">
          <StreakBadge streak={streak} />
          {(phase === "streaming" || phase === "betting") && (
            <span className="rounded border border-[color:var(--border-soft)] bg-black/40 px-3 py-1 font-mono text-sm text-white">
              {secondsLeft}s
            </span>
          )}
        </div>
      </header>

      {phase === "idle" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <p className="max-w-md text-center font-ui-label text-xs text-[color:var(--text-mute)]">
            Two agents make a claim. One is lying. You have one minute to spot the bluff.
          </p>
          <button
            onClick={startRound}
            className="rounded-md border border-[color:var(--accent)]/40 bg-[color:var(--accent-soft)] px-6 py-3 font-ui-label text-sm text-[color:var(--accent)] hover:bg-[color:var(--accent)]/20"
          >
            Start Round
          </button>
        </div>
      )}

      {phase === "loading" && (
        <div className="flex flex-1 items-center justify-center font-ui-label text-xs text-[color:var(--text-mute)]">
          Researching the truth…
        </div>
      )}

      {phase !== "idle" && phase !== "loading" && (
        <>
          <section className="rounded-md border border-[color:var(--border-soft)] bg-black/30 p-4">
            <p className="font-ui-label text-[10px] uppercase tracking-wider text-[color:var(--text-mute)]">
              Claim under debate
            </p>
            <p className="mt-1 font-display text-2xl leading-snug">{topic}</p>
          </section>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <AgentCard
              agent="A"
              isSpeaking={speaking === "A"}
              highlight={
                phase === "revealed" && reveal
                  ? reveal.liar === "A"
                    ? "loser"
                    : "winner"
                  : null
              }
            >
              <ClaimDisplay text={claimA} active={speaking === "A"} />
            </AgentCard>
            <AgentCard
              agent="B"
              isSpeaking={speaking === "B"}
              highlight={
                phase === "revealed" && reveal
                  ? reveal.liar === "B"
                    ? "loser"
                    : "winner"
                  : null
              }
            >
              <ClaimDisplay text={claimB} active={speaking === "B"} />
            </AgentCard>
          </section>

          {phase !== "revealed" && (
            <BetButtons enabled={phase === "betting"} onBet={placeBet} placed={bet} />
          )}

          {phase === "revealed" && reveal && (
            <Reveal
              liar={reveal.liar}
              truth={reveal.truth}
              source={reveal.source}
              userPick={bet?.pick ?? null}
              userAmount={bet?.amount ?? 0}
            />
          )}

          {phase === "revealed" && (
            <button
              onClick={startRound}
              className="self-center rounded-md border border-[color:var(--accent)]/40 bg-[color:var(--accent-soft)] px-6 py-3 font-ui-label text-sm text-[color:var(--accent)] hover:bg-[color:var(--accent)]/20"
            >
              Next round
            </button>
          )}
        </>
      )}
    </main>
  )
}
