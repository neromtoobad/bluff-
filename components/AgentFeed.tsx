"use client"

import { useEffect, useState } from "react"

type Props = {
  topic?: string
  autoStart?: boolean
}

type AgentState = {
  current: string // the in-flight streaming text
  past: string[] // completed historical turns, newest last
  speaking: boolean
  round: number
}

const TOTAL_ROUNDS = 4
const initial: AgentState = { current: "", past: [], speaking: false, round: 0 }

export default function AgentFeed({ topic, autoStart = true }: Props) {
  const [round, setRound] = useState(0)
  const [a, setA] = useState<AgentState>(initial)
  const [b, setB] = useState<AgentState>(initial)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!autoStart) return
    const url = topic
      ? `/api/debate?topic=${encodeURIComponent(topic)}`
      : "/api/debate"
    const es = new EventSource(url)

    es.addEventListener("round", (e) => {
      const { round } = JSON.parse((e as MessageEvent).data)
      setRound(round)
    })

    es.addEventListener("turn_start", (e) => {
      const { agent, round } = JSON.parse((e as MessageEvent).data) as {
        agent: "A" | "B"
        round: number
      }
      const setFn = agent === "A" ? setA : setB
      setFn((s) => ({ ...s, speaking: true, current: "", round }))
    })

    es.addEventListener("delta", (e) => {
      const { agent, text } = JSON.parse((e as MessageEvent).data) as {
        agent: "A" | "B"
        text: string
      }
      const setFn = agent === "A" ? setA : setB
      setFn((s) => ({ ...s, current: s.current + text }))
    })

    es.addEventListener("turn_end", (e) => {
      const { agent, text } = JSON.parse((e as MessageEvent).data) as {
        agent: "A" | "B"
        text: string
      }
      const setFn = agent === "A" ? setA : setB
      setFn((s) => ({
        ...s,
        speaking: false,
        current: "",
        past: [...s.past, text],
      }))
    })

    es.addEventListener("done", () => {
      setDone(true)
      es.close()
    })

    es.addEventListener("error", (e) => {
      try {
        const data = (e as MessageEvent).data
        if (data) setError(JSON.parse(data).message ?? "stream error")
      } catch {
        setError("stream disconnected")
      }
      es.close()
    })

    return () => es.close()
  }, [topic, autoStart])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <AgentCard
        team="bull"
        name="BULL"
        emoji="🐂"
        state={a}
        totalRounds={TOTAL_ROUNDS}
      />
      <AgentCard
        team="bear"
        name="BEAR"
        emoji="🐻"
        state={b}
        totalRounds={TOTAL_ROUNDS}
      />
      {error && (
        <p
          className="col-span-full text-xs text-[color:var(--bear)]"
          role="alert"
        >
          {error}
        </p>
      )}
      {done && (
        <p className="col-span-full text-center text-[10px] uppercase tracking-widest text-zinc-500">
          Round {TOTAL_ROUNDS} complete · awaiting verdict
        </p>
      )}
    </div>
  )
}

function AgentCard({
  team,
  name,
  emoji,
  state,
  totalRounds,
}: {
  team: "bull" | "bear"
  name: string
  emoji: string
  state: AgentState
  totalRounds: number
}) {
  const color = team === "bull" ? "var(--bull)" : "var(--bear)"
  const soft = team === "bull" ? "var(--bull-soft)" : "var(--bear-soft)"
  const liveBubbleKey = `${state.round}-${state.current.length === 0 && state.speaking ? "warming" : "live"}`

  return (
    <div
      className="flex flex-col rounded-lg border bg-[color:var(--bg-card)] overflow-hidden"
      style={{ borderColor: state.speaking ? color : "var(--border)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b"
        style={{
          borderColor: "var(--border)",
          background: state.speaking ? soft : "var(--bg-card-2)",
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl leading-none">{emoji}</span>
          <div>
            <div
              className="text-sm font-black tracking-widest"
              style={{ color }}
            >
              AGENT {name}
            </div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-500">
              {team === "bull" ? "Arguing FOR" : "Arguing AGAINST"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {state.speaking && (
            <span
              className="h-1.5 w-1.5 rounded-full dot-pulse"
              style={{ background: color }}
            />
          )}
          <span
            className="rounded border px-2 py-0.5 text-[10px] font-mono tracking-wider"
            style={{ borderColor: "var(--border-soft)", color }}
          >
            R{state.round || "-"}/{totalRounds}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col gap-2 px-3 py-3 min-h-[300px]">
        {/* Live / latest bubble */}
        {(state.speaking || state.current) && (
          <SpeechBubble
            key={liveBubbleKey}
            team={team}
            text={state.current}
            live
          />
        )}
        {!state.speaking && state.past.length > 0 && (
          <SpeechBubble
            key={`latest-${state.past.length}`}
            team={team}
            text={state.past[state.past.length - 1]}
            live
          />
        )}

        {/* Older turns, stacked + faded */}
        {state.past.length > 1 && !state.speaking && (
          <div className="space-y-2 pt-1 opacity-50">
            {state.past
              .slice(0, -1)
              .reverse()
              .map((t, i) => (
                <SpeechBubble
                  key={`past-${state.past.length}-${i}`}
                  team={team}
                  text={t}
                />
              ))}
          </div>
        )}
        {state.speaking && state.past.length > 0 && (
          <div className="space-y-2 pt-1 opacity-50">
            {state.past
              .slice()
              .reverse()
              .map((t, i) => (
                <SpeechBubble
                  key={`past-live-${i}`}
                  team={team}
                  text={t}
                />
              ))}
          </div>
        )}

        {/* Empty state */}
        {!state.speaking && state.past.length === 0 && !state.current && (
          <p className="text-xs italic text-zinc-600">
            Waiting for opening statement…
          </p>
        )}
      </div>
    </div>
  )
}

function SpeechBubble({
  team,
  text,
  live,
}: {
  team: "bull" | "bear"
  text: string
  live?: boolean
}) {
  const color = team === "bull" ? "var(--bull)" : "var(--bear)"
  return (
    <div
      className={`bubble-pop relative rounded-lg border px-3 py-2.5 text-sm leading-relaxed ${
        live ? "" : "text-xs"
      }`}
      style={{
        borderColor: live ? color : "var(--border-soft)",
        background: live ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.2)",
        boxShadow: live
          ? `0 0 0 1px ${color}22, 0 8px 28px -16px ${color}66`
          : "none",
      }}
    >
      <p className="whitespace-pre-wrap text-zinc-100">
        {text || (
          <span className="inline-flex items-center gap-1 text-zinc-500">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: color, animation: "pulse-ring 1.4s ease-out infinite" }}
            />
            preparing argument…
          </span>
        )}
      </p>
    </div>
  )
}
