"use client"

type Props = { streak: number }

function tone(streak: number): {
  border: string
  bg: string
  text: string
  glow: string
} {
  if (streak >= 10) {
    return {
      border: "border-rose-500/70",
      bg: "bg-rose-500/15",
      text: "text-rose-300",
      glow: "0 0 24px rgba(244,63,94,0.6)",
    }
  }
  if (streak >= 5) {
    return {
      border: "border-orange-500/60",
      bg: "bg-orange-500/15",
      text: "text-orange-300",
      glow: "0 0 18px rgba(249,115,22,0.5)",
    }
  }
  if (streak >= 3) {
    return {
      border: "border-amber-400/50",
      bg: "bg-amber-400/10",
      text: "text-amber-300",
      glow: "0 0 12px rgba(251,191,36,0.4)",
    }
  }
  return {
    border: "border-[color:var(--border-soft)]",
    bg: "bg-black/40",
    text: "text-[color:var(--text-mute)]",
    glow: "none",
  }
}

export default function StreakBadge({ streak }: Props) {
  if (streak <= 0) {
    return (
      <span className="rounded border border-[color:var(--border-soft)] bg-black/40 px-2 py-1 font-ui-label text-[10px] uppercase tracking-wider text-[color:var(--text-mute)]">
        Streak: 0
      </span>
    )
  }
  const t = tone(streak)
  const animate = streak >= 3
  return (
    <>
      <span
        className={`inline-flex items-center gap-1 rounded border px-2 py-1 font-ui-label text-[10px] uppercase tracking-wider ${t.border} ${t.bg} ${t.text}`}
        style={{ boxShadow: t.glow }}
      >
        <span className={animate ? "inline-block animate-bounce" : "inline-block"}>🔥</span>
        Streak: {streak}
      </span>
    </>
  )
}
