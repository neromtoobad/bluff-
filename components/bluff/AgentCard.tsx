"use client"

import AgentVisualizer from "@/components/AgentVisualizer"

type Props = {
  agent: "A" | "B"
  isSpeaking: boolean
  children: React.ReactNode
  highlight?: "winner" | "loser" | null
  flipped?: boolean
}

export default function AgentCard({
  agent,
  isSpeaking,
  children,
  highlight,
  flipped,
}: Props) {
  const side = agent === "A" ? "bull" : "bear"
  const label = agent === "A" ? "AGENT A" : "AGENT B"
  const accentVar = agent === "A" ? "--amber" : "--magenta"
  const cardTone = agent === "A" ? "bluff-card-a" : "bluff-card-b"
  const speakingTone =
    isSpeaking
      ? agent === "A"
        ? "bluff-card-speaking-a"
        : "bluff-card-speaking-b"
      : ""
  const winnerRing =
    highlight === "winner"
      ? " ring-2 ring-[color:var(--green)]/80"
      : highlight === "loser"
        ? " opacity-70"
        : ""

  return (
    <div className={`flip-3d deal-in`}>
      <div className={`flip-inner ${flipped ? "flipped" : ""}`}>
        {/* Front face */}
        <div className={`flip-face bluff-card ${cardTone} ${speakingTone}${winnerRing}`}>
          <div className="bluff-card-inner flex flex-col items-center gap-4">
            <div className="flex w-full items-center justify-between">
              <span
                className="font-ui-label text-[11px] tracking-widest"
                style={{ color: `var(${accentVar})` }}
              >
                ◆ {label}
              </span>
              <span
                className={`font-ui-label text-[10px] tracking-widest ${
                  isSpeaking ? "text-[color:var(--cyan)]" : "text-[color:var(--text-mute)]"
                }`}
              >
                {isSpeaking ? "● SPEAKING" : "○ HOLDING"}
              </span>
            </div>
            <AgentVisualizer
              side={side}
              isSpeaking={isSpeaking}
              intensity={isSpeaking ? 80 : 20}
            />
            <div className="w-full">{children}</div>
          </div>
        </div>

        {/* Back face — only shown when flipped on reveal */}
        <div className={`flip-face flip-back bluff-card ${cardTone}`}>
          <div className="bluff-card-inner flex h-full flex-col items-center justify-center gap-3 py-12">
            <p className="font-ui-label text-[10px] tracking-widest text-[color:var(--text-mute)]">
              ◆ {label}
            </p>
            <p
              className="font-display text-5xl tracking-tight"
              style={{ color: `var(${accentVar})` }}
            >
              {highlight === "loser" ? "LIAR" : "TRUTH"}
            </p>
            <p className="font-ui-label text-[10px] tracking-widest text-[color:var(--text-mute)]">
              {highlight === "loser" ? "card flipped" : "verified"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
