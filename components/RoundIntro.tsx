"use client"

import { useEffect, useState } from "react"

type Props = {
  round: number | null
  totalRounds?: number
  onDone?: () => void
}

const DURATION_MS = 1500

export default function RoundIntro({
  round,
  totalRounds = 4,
  onDone,
}: Props) {
  const [active, setActive] = useState<number | null>(null)

  useEffect(() => {
    if (round == null) return
    setActive(round)
    const t = setTimeout(() => {
      setActive(null)
      onDone?.()
    }, DURATION_MS)
    return () => clearTimeout(t)
  }, [round, onDone])

  if (active == null) return null

  const isFinal = active === totalRounds
  const label = isFinal ? "FINAL ROUND" : `ROUND ${active}`

  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center">
      {/* Solid black backdrop */}
      <div
        className="absolute inset-0 bg-black round-backdrop-in"
        key={`bg-${active}`}
      />

      {/* Horizontal sweep line */}
      <div
        key={`sweep-${active}`}
        className="round-sweep-in absolute left-0 right-0 top-1/2 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(247,183,49,0.85) 35%, #ffffff 50%, rgba(255,59,59,0.85) 65%, transparent 100%)",
          boxShadow: "0 0 24px rgba(255,255,255,0.5)",
        }}
      />

      {/* Card */}
      <div
        key={`card-${active}`}
        className="relative round-card-in flex flex-col items-center"
      >
        <span className="font-ui-label text-[11px] text-zinc-500">
          {isFinal ? "It ends here" : "Coming up"}
        </span>
        <span
          className="mt-3 font-display leading-[0.85]"
          style={{
            fontSize: "clamp(80px, 14vw, 140px)",
            color: "#ffffff",
            textShadow:
              "0 0 24px rgba(255,255,255,0.4), 0 0 48px rgba(247,183,49,0.35), 0 0 92px rgba(255,59,59,0.35)",
          }}
        >
          {label}
        </span>
        <span className="mt-3 font-ui-label text-[11px] text-zinc-500">
          {active} of {totalRounds}
        </span>
      </div>
    </div>
  )
}
