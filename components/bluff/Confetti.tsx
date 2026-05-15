"use client"

import { useMemo } from "react"

const COLORS = [
  "var(--amber)",
  "var(--magenta)",
  "var(--cyan)",
  "var(--green)",
]

export default function Confetti({ show }: { show: boolean }) {
  // Memoize so positions stay stable across re-renders.
  const bits = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        duration: 1.6 + Math.random() * 1.4,
        color: COLORS[i % COLORS.length],
        rot: Math.random() * 360,
      })),
    [],
  )
  if (!show) return null
  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {bits.map((b, i) => (
        <span
          key={i}
          className="confetti-bit"
          style={{
            left: `${b.left}%`,
            background: b.color,
            animationDelay: `${b.delay}s`,
            animationDuration: `${b.duration}s`,
            transform: `rotate(${b.rot}deg)`,
          }}
        />
      ))}
    </div>
  )
}
