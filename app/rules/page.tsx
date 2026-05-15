import Link from "next/link"
import TopNav from "@/components/bluff/TopNav"
import { ChestMascot, OracleMascot } from "@/components/bluff/Mascots"

const STEPS: Array<{ n: string; title: string; body: string }> = [
  {
    n: "01",
    title: "A claim drops.",
    body: "Every round we pull a verifiable crypto claim — from the hardcoded 60-claim pool or live crypto Twitter via AIsa.",
  },
  {
    n: "02",
    title: "Two AI degens argue.",
    body: "Agent A and Agent B both make their case. One is telling the truth backed by web data, one is lying with a plausible-sounding fake number.",
  },
  {
    n: "03",
    title: "You pick the truth-teller.",
    body: "Bet USDC on whichever agent you think is honest. Tap their card. Wallet signs the transfer to the on-chain escrow.",
  },
  {
    n: "04",
    title: "Reveal + payout.",
    body: "Claude flips the cards and shows the verified truth + source. If you picked right, the escrow auto-sends you the payout. If you picked wrong, the pot stays.",
  },
]

const MULT: Array<{ band: string; mult: string; tone: string }> = [
  { band: "0–2 streak", mult: "1.9×", tone: "text-[color:var(--text)]" },
  { band: "3–4 streak", mult: "2.5×", tone: "text-[color:var(--gold-1)]" },
  { band: "5–9 streak", mult: "3×", tone: "text-[color:var(--coin-1)]" },
  { band: "10+ streak", mult: "5×", tone: "text-rose-300" },
]

export default function RulesPage() {
  return (
    <main className="relative min-h-screen pb-32">
      <div className="rays-bg" />
      <div className="forest-ridge" />
      <TopNav compact />

      <section className="relative z-10 mx-auto max-w-4xl px-6 pt-8">
        <p className="font-ui-label text-[11px] tracking-widest text-[color:var(--lime)]">
          ◆ HOW TO PLAY
        </p>
        <h1 className="jackpot-title font-display text-7xl leading-tight md:text-8xl">
          RULES
        </h1>
        <p className="mt-1 font-ui-label text-[11px] tracking-widest text-[color:var(--gold-1)]">
          One round, sixty seconds, two AI agents, one liar. You spot the bluff.
        </p>

        <ol className="mt-8 space-y-4">
          {STEPS.map((s) => (
            <li
              key={s.n}
              className="rounded-2xl border-2 border-[color:var(--border-soft)] bg-[color:var(--surface)]/85 p-5 backdrop-blur"
            >
              <div className="flex items-start gap-4">
                <span className="jackpot-title font-display text-5xl leading-none">{s.n}</span>
                <div>
                  <p className="font-display text-2xl tracking-tight text-[color:var(--gold-1)]">
                    {s.title}
                  </p>
                  <p className="mt-1 font-mono text-sm leading-relaxed text-[color:var(--text)]">
                    {s.body}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-10 rounded-2xl border-2 border-[color:var(--border-soft)] bg-[color:var(--surface)]/85 p-5 backdrop-blur">
          <p className="font-display text-2xl tracking-tight text-[color:var(--lime)]">
            ◆ PAYOUT MULTIPLIERS
          </p>
          <p className="mt-1 font-ui-label text-[10px] tracking-widest text-[color:var(--text-mute)]">
            Streak multiplies your bet on a correct call. Lose a round → streak resets to zero.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
            {MULT.map((m) => (
              <div
                key={m.band}
                className="rounded-xl border border-[color:var(--border)] bg-black/30 p-3"
              >
                <p className="font-ui-label text-[10px] tracking-widest text-[color:var(--text-mute)]">
                  {m.band}
                </p>
                <p className={`mt-1 font-display text-3xl tracking-tight ${m.tone}`}>
                  {m.mult}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/play?auto=1"
            className="lime-cta rounded-2xl px-10 py-4 font-display text-3xl tracking-tight"
          >
            DEAL ME IN
          </Link>
          <Link
            href="/faq"
            className="rounded-2xl border-2 border-[color:var(--border-soft)] bg-black/30 px-8 py-4 font-display text-2xl tracking-tight text-[color:var(--text)] hover:bg-black/45"
          >
            FAQ →
          </Link>
        </div>
      </section>

      <ChestMascot />
      <OracleMascot />
    </main>
  )
}
