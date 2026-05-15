"use client"

type Props = {
  text: string
  active: boolean
}

export default function ClaimDisplay({ text, active }: Props) {
  return (
    <div
      className={`min-h-[140px] rounded-md border border-[color:var(--border-soft)] bg-black/30 p-3 font-mono text-sm leading-relaxed text-[color:var(--text)] ${
        active ? "shadow-[0_0_20px_rgba(255,255,255,0.05)]" : ""
      }`}
    >
      {text || <span className="text-[color:var(--text-mute)]">…</span>}
      {active && <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-white/70 align-middle" />}
    </div>
  )
}
