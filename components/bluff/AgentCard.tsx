"use client"

import AgentVisualizer from "@/components/AgentVisualizer"

type Props = {
  agent: "A" | "B"
  isSpeaking: boolean
  children: React.ReactNode
  highlight?: "winner" | "loser" | null
  flipped?: boolean
  // When set, the card is clickable to bet on that agent as truth-teller.
  selectable?: boolean
  selected?: boolean
  onSelect?: (agent: "A" | "B") => void
  hint?: string
}

export default function AgentCard({
  agent,
  isSpeaking,
  children,
  highlight,
  flipped,
  selectable,
  selected,
  onSelect,
  hint,
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
  const selectedRing = selected
    ? " ring-4 ring-[color:var(--lime)] shadow-[0_0_40px_rgba(124,214,36,0.45)]"
    : ""

  const cardInner = (
    <div className={`flip-3d deal-in ${selectable ? "cursor-pointer transition-transform hover:scale-[1.015] active:scale-[0.995]" : ""}`}>
      <div className={`flip-inner ${flipped ? "flipped" : ""}`}>
        <div className={`flip-face bluff-card ${cardTone} ${speakingTone}${winnerRing}${selectedRing}`}>
          <div className="bluff-card-inner flex flex-col items-center gap-4">
            <div className="flex w-full items-center justify-between">
              <span className="font-display text-lg tracking-wide" style={{ color: `var(${accentVar})` }}>
                ◆ {label}
              </span>
              <span
                className={`font-ui-label text-[10px] tracking-widest ${
                  isSpeaking ? "text-[color:var(--lime)]" : "text-[color:var(--text-mute)]"
                }`}
              >
                {isSpeaking ? "● SPEAKING" : selectable ? "● TAP TO BET" : "○ HOLDING"}
              </span>
            </div>
            <AgentVisualizer
              side={side}
              isSpeaking={isSpeaking}
              intensity={isSpeaking ? 80 : 20}
            />
            <div className="w-full">{children}</div>
            {selectable && hint && (
              <div
                className="w-full rounded-xl border-2 px-3 py-2 text-center font-display text-base tracking-wide"
                style={{
                  borderColor: `var(${accentVar})`,
                  color: `var(${accentVar})`,
                  background: agent === "A"
                    ? "rgba(255,183,0,0.08)"
                    : "rgba(122,92,255,0.08)",
                }}
              >
                {hint}
              </div>
            )}
          </div>
        </div>

        <div className={`flip-face flip-back bluff-card ${cardTone}`}>
          <div className="bluff-card-inner flex h-full flex-col items-center justify-center gap-3 py-12">
            <p className="font-ui-label text-[10px] tracking-widest text-[color:var(--text-mute)]">
              ◆ {label}
            </p>
            <p className="jackpot-title font-display text-6xl">
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

  if (!selectable) return cardInner

  return (
    <button
      type="button"
      onClick={() => onSelect?.(agent)}
      aria-label={`Bet on Agent ${agent} as the truth-teller`}
      className="block w-full text-left"
    >
      {cardInner}
    </button>
  )
}
