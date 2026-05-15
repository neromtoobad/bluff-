"use client"

type Props = {
  liar: "A" | "B"
  truth: string
  source: string
  userPick: "A" | "B" | null
  userAmount: number
  tell?: string | null
  nextInSeconds?: number | null
}

const PAYOUT_MULT = 1.9

export default function Reveal({
  liar,
  truth,
  source,
  userPick,
  userAmount,
  tell,
  nextInSeconds,
}: Props) {
  const won = userPick != null && userPick === liar
  const noBet = userPick == null
  const payout = won ? userAmount * PAYOUT_MULT : 0
  const liarAccent = liar === "A" ? "var(--gold-2)" : "var(--violet)"

  return (
    <div
      className="bluff-card"
      style={{
        background:
          "linear-gradient(160deg, var(--gold-1) 0%, var(--gold-2) 45%, rgba(255,183,0,0.2) 100%)",
        boxShadow:
          "0 0 0 1px rgba(255,225,90,0.4), 0 24px 70px -28px rgba(255,183,0,0.7)",
      }}
    >
      <div className="bluff-card-inner space-y-4">
        <p className="jackpot-title font-display text-5xl tracking-tight">
          LIAR REVEALED!
        </p>
        <p className="font-display text-3xl tracking-tight" style={{ color: liarAccent }}>
          AGENT {liar} WAS LYING
        </p>

        <div>
          <p className="font-ui-label text-[10px] uppercase tracking-widest text-[color:var(--text-mute)]">
            The truth
          </p>
          <p className="mt-1 font-mono text-sm leading-relaxed text-[color:var(--text)]">
            {truth}
          </p>
        </div>

        {source && source !== "unknown" && source !== "local-fallback" && (
          <div>
            <p className="font-ui-label text-[10px] uppercase tracking-widest text-[color:var(--text-mute)]">
              Source
            </p>
            {source.startsWith("http") ? (
              <a
                href={source}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-xs text-[color:var(--lime)] hover:underline"
              >
                {source}
              </a>
            ) : (
              <p className="font-mono text-xs text-[color:var(--text-mute)]">{source}</p>
            )}
          </div>
        )}

        {tell && (
          <div className="rounded-lg border border-[color:var(--lime)]/50 bg-[color:var(--lime)]/10 p-3">
            <p className="font-ui-label text-[10px] uppercase tracking-widest text-[color:var(--lime)]">
              💡 The tell
            </p>
            <p className="mt-1 font-mono text-sm leading-relaxed text-[color:var(--text)]">
              {tell}
            </p>
          </div>
        )}

        {!noBet && (
          <p className="font-ui-label text-[12px] tracking-wider">
            <span className="text-[color:var(--text-mute)]">Position:</span>{" "}
            ${userAmount.toFixed(2)} on AGENT {userPick} ·{" "}
            {won ? (
              <span className="text-[color:var(--lime)]">
                Payout ${payout.toFixed(2)} ({PAYOUT_MULT}× base)
              </span>
            ) : (
              <span className="text-rose-300">Lost</span>
            )}
          </p>
        )}

        {nextInSeconds != null && nextInSeconds > 0 && (
          <p className="text-center font-ui-label text-[12px] tracking-widest text-[color:var(--lime)]">
            NEXT ROUND IN {nextInSeconds}…
          </p>
        )}
      </div>
    </div>
  )
}
