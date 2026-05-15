"use client"

import AgentVisualizer from "@/components/AgentVisualizer"

type Props = {
  agent: "A" | "B"
  isSpeaking: boolean
  children: React.ReactNode
  highlight?: "winner" | "loser" | null
}

export default function AgentCard({ agent, isSpeaking, children, highlight }: Props) {
  const side = agent === "A" ? "bull" : "bear"
  const label = agent === "A" ? "AGENT A" : "AGENT B"
  const accent = agent === "A" ? "var(--bull)" : "var(--bear)"
  const ring =
    highlight === "winner"
      ? "ring-2 ring-emerald-400/80"
      : highlight === "loser"
        ? "ring-2 ring-rose-500/60 opacity-70"
        : ""
  return (
    <div
      className={`flex flex-col items-center gap-4 rounded-lg border border-[color:var(--border-soft)] bg-[color:var(--bg-card)] p-5 ${ring}`}
    >
      <div className="flex w-full items-center justify-between">
        <span
          className="font-ui-label text-[11px] tracking-widest"
          style={{ color: accent }}
        >
          {label}
        </span>
        <span className="font-ui-label text-[10px] text-[color:var(--text-mute)]">
          {isSpeaking ? "● speaking" : "○ idle"}
        </span>
      </div>
      <AgentVisualizer side={side} isSpeaking={isSpeaking} intensity={isSpeaking ? 80 : 20} />
      <div className="w-full">{children}</div>
    </div>
  )
}
