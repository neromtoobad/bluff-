"use client"

import { useEffect, useRef, useState } from "react"
import HypeMeter from "./HypeMeter"
import AgentVisualizer from "./AgentVisualizer"

type Props = {
  topic?: string
  autoStart?: boolean
  onRoundChange?: (round: number) => void
}

type AgentState = {
  current: string // the in-flight streaming text
  past: string[] // completed historical turns, newest last
  speaking: boolean
  thinking: boolean // true during inter-turn pause before this agent speaks
  round: number
  confidence: number // 0-100, recomputed on each turn_end
}

const TOTAL_ROUNDS = 4
const initial: AgentState = {
  current: "",
  past: [],
  speaking: false,
  thinking: false,
  round: 0,
  confidence: 0,
}

// Confidence = response length (capped) + assertiveness keyword density.
// Quick, deterministic, frontend-only.
const ASSERTIVE_RE =
  /\b(obvious|clearly|factual|absolute|undeniabl|definitiv|exactly|fundamental|certain|crush|destroy|murder|wreck|wrong|ignoran|naive|toy|joke|nonsense|garbage|rubbish|brutal|cooked|dead|done|over|finished|never|always|already|literally|simply|just)/gi
const HEDGE_RE = /\b(maybe|perhaps|might|could|possibly|arguably|somewhat|kinda|sort of|i think|i guess)/gi

function computeConfidence(text: string): number {
  if (!text) return 0
  const words = text.trim().split(/\s+/).length
  const lengthScore = Math.min(60, words * 1.2) // up to 60 from length
  const assertiveHits = (text.match(ASSERTIVE_RE) || []).length
  const keywordScore = Math.min(40, assertiveHits * 7)
  const hedgeHits = (text.match(HEDGE_RE) || []).length
  const hedgePenalty = Math.min(20, hedgeHits * 5)
  const raw = lengthScore + keywordScore - hedgePenalty
  return Math.round(Math.max(0, Math.min(100, raw)))
}

function useTween(target: number, durationMs = 700): number {
  const [value, setValue] = useState(target)
  const fromRef = useRef(target)
  const startRef = useRef(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    fromRef.current = value
    startRef.current = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - startRef.current) / durationMs)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(fromRef.current + (target - fromRef.current) * eased)
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
    }
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, durationMs])

  return value
}

export default function AgentFeed({
  topic,
  autoStart = true,
  onRoundChange,
}: Props) {
  const [round, setRound] = useState(0)
  const [a, setA] = useState<AgentState>(initial)
  const [b, setB] = useState<AgentState>(initial)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Keep latest callback in a ref so we don't re-open the EventSource when
  // the parent's closure identity changes.
  const onRoundRef = useRef(onRoundChange)
  useEffect(() => {
    onRoundRef.current = onRoundChange
  }, [onRoundChange])

  useEffect(() => {
    if (!autoStart) return
    const url = topic
      ? `/api/debate?topic=${encodeURIComponent(topic)}`
      : "/api/debate"
    const es = new EventSource(url)

    es.addEventListener("round", (e) => {
      const { round } = JSON.parse((e as MessageEvent).data) as {
        round: number
      }
      setRound(round)
      onRoundRef.current?.(round)
    })

    es.addEventListener("thinking", (e) => {
      const { agent, round } = JSON.parse((e as MessageEvent).data) as {
        agent: "A" | "B"
        round: number
      }
      const setFn = agent === "A" ? setA : setB
      setFn((s) => ({ ...s, thinking: true, round }))
    })

    es.addEventListener("turn_start", (e) => {
      const { agent, round } = JSON.parse((e as MessageEvent).data) as {
        agent: "A" | "B"
        round: number
      }
      const setFn = agent === "A" ? setA : setB
      setFn((s) => ({
        ...s,
        speaking: true,
        thinking: false,
        current: "",
        round,
      }))
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
        confidence: computeConfidence(text),
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
    <div className="space-y-2">
      {/* HYPE METER — horizontal bar between the two agent columns */}
      <HypeMeter />

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
      </div>

      {error && (
        <p className="text-xs text-[color:var(--bear)]" role="alert">
          {error}
        </p>
      )}
      {done && (
        <p className="text-center text-[10px] uppercase tracking-widest text-zinc-500">
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

  const tweenedConfidence = useTween(state.confidence)
  const confidenceLabel =
    state.confidence === 0
      ? "—"
      : Math.round(tweenedConfidence).toString().padStart(2, "0")

  const gradClass = team === "bull" ? "grad-border-bull" : "grad-border-bear"

  return (
    <div className="flex flex-col">
      {/* 3D visualizer — sits above the text card */}
      <div className="flex justify-center pt-1 pb-4">
        <AgentVisualizer
          side={team}
          isSpeaking={state.speaking}
          intensity={state.confidence}
        />
      </div>

      <div className={gradClass}>
        <div
          className="flex flex-col rounded-[13px] bg-[color:var(--bg-card)] overflow-hidden min-h-[460px]"
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b"
            style={{
              borderColor: "var(--border)",
              background: state.speaking ? soft : "var(--bg-card-2)",
            }}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl leading-none">{emoji}</span>
              <div>
                <div
                  className="font-display leading-none"
                  style={{
                    color,
                    fontSize: "40px",
                    textShadow: state.speaking
                      ? `0 0 18px ${color === "var(--bull)" ? "rgba(247,183,49,0.55)" : "rgba(255,59,59,0.55)"}`
                      : "none",
                  }}
                >
                  AGENT {name}
                </div>
                <div className="font-ui-label text-[10px] text-[color:var(--text-mute)] mt-1">
                  {team === "bull" ? "Arguing FOR" : "Arguing AGAINST"}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
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
              <ConfidenceBadge
                value={state.confidence}
                label={confidenceLabel}
                color={color}
              />
            </div>
          </div>

          {/* Body — IBM Plex Mono debate text, newest at bottom */}
          <div className="flex-1 flex flex-col-reverse gap-3 px-4 py-4">
            {/* Live / latest message — sits at the bottom of the flex-col-reverse */}
            {state.thinking && !state.speaking ? (
              <ThinkingPlaceholder team={team} name={name} />
            ) : state.speaking || state.current ? (
              <SpeechBubble
                key={liveBubbleKey}
                team={team}
                text={state.current}
                live
              />
            ) : state.past.length > 0 ? (
              <SpeechBubble
                key={`latest-${state.past.length}`}
                team={team}
                text={state.past[state.past.length - 1]}
                live
              />
            ) : (
              <p className="font-mono-debate italic text-zinc-600">
                Waiting for opening statement…
              </p>
            )}

            {/* Older turns stacked above, fading toward the top */}
            {(state.speaking
              ? state.past
              : state.past.slice(0, -1)
            ).length > 0 && (
              <div className="flex flex-col-reverse gap-3 opacity-40">
                {(state.speaking
                  ? state.past
                  : state.past.slice(0, -1)
                )
                  .slice()
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
          </div>
        </div>
      </div>
    </div>
  )
}

function ConfidenceBadge({
  value,
  label,
  color,
}: {
  value: number
  label: string
  color: string
}) {
  // Color shifts subtly with score: low = muted, high = full team color.
  const alpha = value === 0 ? 0.2 : 0.3 + (value / 100) * 0.7
  return (
    <span
      className="inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-mono tracking-wider"
      style={{
        borderColor: "var(--border-soft)",
        background: "rgba(0,0,0,0.4)",
      }}
      title={`Confidence ${value}/100`}
    >
      <span className="text-zinc-500 uppercase text-[9px]">CNF</span>
      <span
        className="font-bold tabular-nums"
        style={{ color, opacity: alpha }}
      >
        {label}
      </span>
    </span>
  )
}

function ThinkingPlaceholder({
  team,
  name,
}: {
  team: "bull" | "bear"
  name: string
}) {
  const color = team === "bull" ? "var(--bull)" : "var(--bear)"
  return (
    <div
      className="bubble-pop rounded-md border px-3.5 py-3 flex items-center gap-2"
      style={{
        borderColor: color,
        background:
          "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.3) 100%)",
      }}
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{
          background: color,
          animation: "pulse-ring 1s ease-out infinite",
        }}
      />
      <p
        className="font-ui-label text-[11px] tracking-[0.25em]"
        style={{ color }}
      >
        AGENT {name} IS THINKING…
      </p>
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
  const glow =
    team === "bull"
      ? "0 8px 28px -16px rgba(247,183,49,0.55), 0 0 0 1px rgba(247,183,49,0.18)"
      : "0 8px 28px -16px rgba(255,59,59,0.55), 0 0 0 1px rgba(255,59,59,0.18)"
  return (
    <div
      className="bubble-pop relative rounded-md border px-3.5 py-3"
      style={{
        borderColor: live ? color : "var(--border-soft)",
        background: live
          ? "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.3) 100%)"
          : "rgba(0,0,0,0.22)",
        boxShadow: live ? glow : "none",
      }}
    >
      <p
        className="font-mono-debate whitespace-pre-wrap text-zinc-100"
        style={!live ? { fontSize: 12 } : undefined}
      >
        {text || (
          <span className="inline-flex items-center gap-1.5 text-zinc-500">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{
                background: color,
                animation: "pulse-ring 1.4s ease-out infinite",
              }}
            />
            preparing argument…
          </span>
        )}
      </p>
    </div>
  )
}
