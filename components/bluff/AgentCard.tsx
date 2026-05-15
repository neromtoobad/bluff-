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
  const accentVar = agent === "A" ? "--gold-2" : "--violet"
  const cardTone = agent === "A" ? "bluff-card-a" : "bluff-card-b"
  const speakingTone =
    isSpeaking
      ? agent === "A"
        ? "bluff-card-speaking-a"
        : "bluff-card-speaking-b"
      : ""
  const winnerRing =
    highlight === "winner"
      ? " ring-2 ring-[color:var(--lime)]/80"
      : highlight === "loser"
        ? " opacity-70"
        : ""

  return (
    <div className="flip-3d deal-in">
      <div className={`flip-inner ${flipped ? "flipped" : ""}`}>
        {/* Front face */}
        <div className={`flip-face bluff-card ${cardTone} ${speakingTone}${winnerRing}`}>
          <div className="bluff-card-inner flex flex-col items-center gap-4">
            <div className="flex w-full items-center justify-between">
              <span
                className="font-display text-lg tracking-wide"
                style={{ color: `var(${accentVar})` }}
              >
                ◆ {label}
              </span>
              <span
                className={`font-ui-label text-[10px] tracking-widest ${
                  isSpeaking ? "text-[color:var(--lime)]" : "text-[color:var(--text-mute)]"
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

        {/* Back face — revealed on settle */}
        <div className={`flip-face flip-back bluff-card ${cardTone}`}>
          <div className="bluff-card-inner flex h-full flex-col items-center justify-center gap-3 py-12">
            <p className="font-ui-label text-[10px] tracking-widest text-[color:var(--text-mute)]">
              ◆ {label}
            </p>
            <p
              className="jackpot-title font-display text-6xl"
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
