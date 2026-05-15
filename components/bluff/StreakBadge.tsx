"use client"

type Props = { streak: number }

export default function StreakBadge({ streak }: Props) {
  if (streak <= 0) return null
  return (
    <span className="rounded border border-amber-400/40 bg-amber-400/10 px-2 py-1 font-ui-label text-[10px] uppercase tracking-wider text-amber-300">
      🔥 {streak} streak
    </span>
  )
}
