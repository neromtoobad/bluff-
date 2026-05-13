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
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-[2px] round-backdrop-in"
        key={`bg-${active}`}
      />
      {/* Card */}
      <div
        key={`card-${active}`}
        className="relative round-card-in flex flex-col items-center"
      >
        <span
          className="text-[10px] uppercase tracking-[0.6em] text-zinc-400"
        >
          {isFinal ? "It ends here" : "Coming up"}
        </span>
        <span
          className="mt-2 text-7xl sm:text-8xl font-black tracking-tight leading-none"
          style={{
            color: "var(--accent)",
            textShadow:
              "0 0 24px rgba(0, 255, 136, 0.55), 0 0 64px rgba(0, 255, 136, 0.3)",
          }}
        >
          {label}
        </span>
        <span className="mt-3 text-xs uppercase tracking-[0.4em] text-zinc-500">
          {active} of {totalRounds}
        </span>
      </div>
    </div>
  )
}
