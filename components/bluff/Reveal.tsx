"use client"

type Props = {
  liar: "A" | "B"
  truth: string
  source: string
  topicUrl?: string | null
  userPick: "A" | "B" | null
  userAmount: number
  tell?: string | null
  nextInSeconds?: number | null
  onNext?: () => void
}

const PAYOUT_MULT = 1.9

export default function Reveal({
  liar,
  truth,
  source,
  topicUrl,
  userPick,
  userAmount,
  tell,
  nextInSeconds,
  onNext,
}: Props) {
  const truthAgent: "A" | "B" = liar === "A" ? "B" : "A"
  const won = userPick != null && userPick === truthAgent
  const noBet = userPick == null
  const payout = won ? userAmount * PAYOUT_MULT : 0
  const truthAccent = truthAgent === "A" ? "var(--gold-2)" : "var(--violet)"
  const tweetUrl = topicUrl && topicUrl.startsWith("http") ? topicUrl : null
  const truthSourceUrl =
    source && source.startsWith("http") ? source : null

  return (
    <div
      className="rounded-2xl border-2 p-6 backdrop-blur"
      style={{
        borderColor: "rgba(124,214,36,0.55)",
        background:
          "linear-gradient(160deg, rgba(124,214,36,0.18) 0%, rgba(20,42,32,0.85) 60%)",
        boxShadow:
          "0 0 0 1px rgba(124,214,36,0.25), 0 24px 70px -28px rgba(124,214,36,0.55)",
      }}
    >
      <p className="font-display text-5xl tracking-tight text-[color:var(--lime)]">
        TRUTH REVEALED <span className="text-[color:var(--lime)]">✓</span>
      </p>

      <p className="mt-3 font-mono text-2xl leading-snug text-[color:var(--text)]">
        {truth}
      </p>

      <p className="mt-3 font-display text-2xl tracking-tight" style={{ color: truthAccent }}>
        AGENT {truthAgent} WAS TELLING THE TRUTH
      </p>
      <p
        className="mt-1 font-display text-lg tracking-tight text-rose-300/90"
        style={{ textDecoration: "line-through", textDecorationColor: "rgba(244,63,94,0.6)" }}
      >
        AGENT {liar} — LIAR
      </p>

      <div className="mt-4 flex flex-wrap gap-3 font-ui-label text-[11px] tracking-widest">
        {tweetUrl && (
          <a
            href={tweetUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-[color:var(--gold-2)]/50 bg-[color:var(--gold-2)]/10 px-3 py-1 text-[color:var(--gold-1)] hover:bg-[color:var(--gold-2)]/20"
          >
            ◆ ORIGINAL CLAIM
          </a>
        )}
        {truthSourceUrl && (
          <a
            href={truthSourceUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-[color:var(--lime)]/50 bg-[color:var(--lime)]/10 px-3 py-1 text-[color:var(--lime)] hover:bg-[color:var(--lime)]/20"
          >
            ◆ TRUTH SOURCE
          </a>
        )}
      </div>

      {tell && (
        <div className="mt-4 rounded-xl border border-[color:var(--gold-2)]/40 bg-[color:var(--gold-2)]/10 p-3">
          <p className="font-ui-label text-[10px] uppercase tracking-widest text-[color:var(--gold-1)]">
            💡 The tell
          </p>
          <p className="mt-1 font-mono text-base leading-relaxed text-[color:var(--text)]">
            {tell}
          </p>
        </div>
      )}

      <div className="mt-5 flex items-center justify-between gap-4">
        <div className="font-ui-label text-[12px] tracking-wider">
          {noBet ? (
            <span className="text-[color:var(--text-mute)]">No bet this round</span>
          ) : won ? (
            <span className="text-[color:var(--lime)]">
              + ${payout.toFixed(2)} ({PAYOUT_MULT}× base)
            </span>
          ) : (
            <span className="text-rose-300">
              better luck next round · −${userAmount.toFixed(2)}
            </span>
          )}
        </div>
        <button
          onClick={onNext}
          className="lime-cta rounded-2xl px-8 py-3 font-display text-2xl tracking-tight"
        >
          NEXT ROUND
          {nextInSeconds != null && nextInSeconds > 0 ? ` (${nextInSeconds})` : ""}
        </button>
      </div>
    </div>
  )
}
