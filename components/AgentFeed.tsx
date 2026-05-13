"use client"

import { useEffect, useState } from "react"

type Props = {
  topic?: string
  autoStart?: boolean
}

type AgentState = {
  text: string
  speaking: boolean
}

const TOTAL_ROUNDS = 4

export default function AgentFeed({ topic, autoStart = true }: Props) {
  const [round, setRound] = useState(0)
  const [a, setA] = useState<AgentState>({ text: "", speaking: false })
  const [b, setB] = useState<AgentState>({ text: "", speaking: false })
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
      const { agent } = JSON.parse((e as MessageEvent).data) as { agent: "A" | "B" }
      if (agent === "A") setA((s) => ({ ...s, speaking: true }))
      else setB((s) => ({ ...s, speaking: true }))
    })

    es.addEventListener("delta", (e) => {
      const { agent, text } = JSON.parse((e as MessageEvent).data) as {
        agent: "A" | "B"
        text: string
      }
      if (agent === "A") setA((s) => ({ ...s, text: s.text + text }))
      else setB((s) => ({ ...s, text: s.text + text }))
    })

    es.addEventListener("turn_end", (e) => {
      const { agent } = JSON.parse((e as MessageEvent).data) as { agent: "A" | "B" }
      const sep = "\n\n"
      if (agent === "A") setA((s) => ({ text: s.text + sep, speaking: false }))
      else setB((s) => ({ text: s.text + sep, speaking: false }))
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
    <div className="w-full max-w-4xl space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Debate</h2>
        <span className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs text-zinc-300">
          {done ? "Finished" : round === 0 ? "Warming up…" : `Round ${round} of ${TOTAL_ROUNDS}`}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <AgentColumn label="Agent A — FOR" tint="emerald" state={a} />
        <AgentColumn label="Agent B — AGAINST" tint="rose" state={b} />
      </div>

      {error && (
        <p className="text-sm text-rose-400" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

function AgentColumn({
  label,
  state,
  tint,
}: {
  label: string
  state: AgentState
  tint: "emerald" | "rose"
}) {
  const dot = tint === "emerald" ? "bg-emerald-400" : "bg-rose-400"
  const ring = tint === "emerald" ? "border-emerald-700/50" : "border-rose-700/50"
  return (
    <div className={`rounded-2xl border ${ring} bg-zinc-900/60 p-4 min-h-[260px] flex flex-col`}>
      <div className="flex items-center gap-2 mb-3">
        <span
          className={`h-2 w-2 rounded-full ${dot} ${
            state.speaking ? "animate-pulse" : "opacity-50"
          }`}
        />
        <span className="text-sm font-semibold text-zinc-200">{label}</span>
        {state.speaking && (
          <span className="text-[10px] uppercase tracking-wider text-zinc-400">speaking</span>
        )}
      </div>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-200 flex-1">
        {state.text || (
          <span className="text-zinc-500 italic">Waiting for opening statement…</span>
        )}
      </p>
    </div>
  )
}
