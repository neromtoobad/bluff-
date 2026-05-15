"use client"

type Props = {
  liar: "A" | "B"
  truth: string
  source: string
  userPick: "A" | "B" | null
  userAmount: number
}

const PAYOUT_MULT = 1.9

export default function Reveal({ liar, truth, source, userPick, userAmount }: Props) {
  const won = userPick != null && userPick === liar
  const noBet = userPick == null
  const payout = won ? userAmount * PAYOUT_MULT : 0

  const banner = noBet
    ? { tone: "neutral", text: `AGENT ${liar} WAS LYING` }
    : won
      ? { tone: "win", text: `YOU WIN — AGENT ${liar} WAS LYING` }
      : { tone: "loss", text: `YOU LOSE — AGENT ${liar} WAS LYING` }

  const tone =
    banner.tone === "win"
      ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-200"
      : banner.tone === "loss"
        ? "border-rose-500/60 bg-rose-500/10 text-rose-200"
        : "border-[color:var(--border-soft)] bg-[color:var(--bg-card)] text-[color:var(--text)]"

  return (
    <div className={`space-y-3 rounded-lg border p-5 ${tone}`}>
      <p className="font-display text-3xl tracking-tight">{banner.text}</p>
      <div>
        <p className="font-ui-label text-[10px] uppercase tracking-wider text-[color:var(--text-mute)]">
          The truth
        </p>
        <p className="mt-1 font-mono text-sm leading-relaxed">{truth}</p>
      </div>
      {source && source !== "unknown" && (
        <div>
          <p className="font-ui-label text-[10px] uppercase tracking-wider text-[color:var(--text-mute)]">
            Source
          </p>
          {source.startsWith("http") ? (
            <a
              href={source}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-xs text-sky-300 hover:underline"
            >
              {source}
            </a>
          ) : (
            <p className="font-mono text-xs text-[color:var(--text-mute)]">{source}</p>
          )}
        </div>
      )}
      {!noBet && (
        <p className="font-ui-label text-[11px]">
          Position: ${userAmount.toFixed(2)} on AGENT {userPick} ·{" "}
          {won ? `Payout $${payout.toFixed(2)} (1.9×)` : "Lost"}
        </p>
      )}
    </div>
  )
}
