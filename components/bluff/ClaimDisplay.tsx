"use client"

type Props = {
  text: string
  active: boolean
  agent: "A" | "B"
}

export default function ClaimDisplay({ text, active, agent }: Props) {
  const color = agent === "A" ? "var(--gold-2)" : "var(--violet)"
  return (
    <div className="mx-auto flex w-full max-w-[300px] flex-col items-center gap-0.5 text-center">
      <span
        aria-hidden
        className="font-display text-3xl leading-none sm:text-4xl"
        style={{ color, textShadow: `0 0 18px ${agent === "A" ? "rgba(255,183,0,0.45)" : "rgba(122,92,255,0.45)"}` }}
      >
        “
      </span>
      <p
        className="font-mono text-[13px] text-[color:var(--text)] sm:text-sm"
        style={{ lineHeight: 1.35 }}
      >
        {text || <span className="text-[color:var(--text-mute)]">…</span>}
        {active && (
          <span className="ml-0.5 inline-block h-4 w-1 animate-pulse bg-white/70 align-middle" />
        )}
      </p>
    </div>
  )
}
