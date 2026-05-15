"use client"

type Props = { streak: number }

function tone(streak: number): { border: string; bg: string; text: string; glow: string } {
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
      border: "border-[color:var(--coin-2)]/60",
      bg: "bg-[color:var(--coin-2)]/15",
      text: "text-[color:var(--coin-1)]",
      glow: "0 0 18px rgba(255,90,24,0.5)",
    }
  }
  if (streak >= 3) {
    return {
      border: "border-[color:var(--gold-2)]/50",
      bg: "bg-[color:var(--gold-2)]/12",
      text: "text-[color:var(--gold-1)]",
      glow: "0 0 14px rgba(255,183,0,0.45)",
    }
  }
  return {
    border: "border-[color:var(--border)]",
    bg: "bg-black/40",
    text: "text-[color:var(--text-mute)]",
    glow: "none",
  }
}

export default function StreakBadge({ streak }: Props) {
  const t = tone(streak)
  const animate = streak >= 3
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-ui-label text-[10px] uppercase tracking-widest ${t.border} ${t.bg} ${t.text}`}
      style={{ boxShadow: t.glow }}
    >
      <span className={animate ? "inline-block animate-bounce" : "inline-block"}>🔥</span>
      Streak: {streak}
    </span>
  )
}
