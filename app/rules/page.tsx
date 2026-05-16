import Link from "next/link"
import TopNav from "@/components/bluff/TopNav"
import { ChestMascot, OracleMascot } from "@/components/bluff/Mascots"

export const dynamic = "force-static"
export const revalidate = false

const STEPS: Array<{ n: string; title: string; body: string }> = [
  {
    n: "01",
    title: "A claim drops.",
    body: "Every round we pull one verifiable crypto claim from a hand-curated pool of 341 — 161 statements that are true, 180 that are deliberately false. Each entry has a verdict, the actual fact, and a canonical source URL attached.",
  },
  {
    n: "02",
    title: "Two AI agents argue.",
    body: "Agent A (gold) and Agent B (Arc-blue) both make a one-line case. Claude generates them with the verdict pre-known on the server — the truth-teller is told to defend the real fact, the liar is told to fabricate a believable counter with a fake-but-specific number. You only see the two claims, not which agent was assigned which role.",
  },
  {
    n: "03",
    title: "You pick the truth-teller.",
    body: "Pick the stake ($0.10–$5) then tap the agent card you think is honest. Your wallet (MetaMask / OKX / Rabby / Coinbase Wallet, or your Circle SCA from email sign-up) signs a USDC transfer to the on-chain escrow on Arc Testnet. The deal closes the instant the tx is confirmed.",
  },
  {
    n: "04",
    title: "Reveal + payout.",
    body: "The card of the liar flips to expose them, the truth and source URL drop in, and the escrow auto-signs a USDC transfer back to you if you called it right. Streak multipliers stack: 1.9× base, 2.5× from 3-streak, 3× from 5, 5× at 10+. Miss it and the bet stays in the pot for the next winner.",
  },
]

const MULT: Array<{ band: string; mult: string; tone: string }> = [
  { band: "0–2 streak", mult: "1.9×", tone: "text-[color:var(--text)]" },
  { band: "3–4 streak", mult: "2.5×", tone: "text-[color:var(--gold-1)]" },
  { band: "5–9 streak", mult: "3×", tone: "text-[color:var(--coin-1)]" },
  { band: "10+ streak", mult: "5×", tone: "text-rose-300" },
]

const STACK: Array<{ label: string; value: string; tone: string }> = [
  { label: "Settlement chain", value: "Arc Testnet · 5042002", tone: "text-[color:var(--arc-blue)]" },
  { label: "Bet token", value: "USDC (ERC-20)", tone: "text-[color:var(--gold-1)]" },
  { label: "Agent model", value: "Claude Haiku 4.5", tone: "text-[color:var(--lime)]" },
  { label: "Wallet options", value: "MetaMask, OKX, Rabby, Coinbase + Circle SCA via email", tone: "text-[color:var(--text)]" },
]

export default function RulesPage() {
  return (
    <main className="relative min-h-screen pb-32">
      <div className="rays-bg" />
      <div className="forest-ridge" />
      <TopNav compact />

      <section className="relative z-10 mx-auto max-w-4xl px-4 pt-6 sm:px-6 sm:pt-8">
        <p className="font-ui-label text-[10px] tracking-widest text-[color:var(--lime)] sm:text-[11px]">
          ◆ HOW TO PLAY
        </p>
        <h1 className="jackpot-title font-display text-5xl leading-tight sm:text-7xl md:text-8xl">
          RULES
        </h1>
        <p className="mt-1 font-ui-label text-[10px] tracking-widest text-[color:var(--gold-1)] sm:text-[11px]">
          One round · ~30 seconds · two AI agents · one liar · real USDC on{" "}
          <span className="text-[color:var(--arc-blue)]">Arc Testnet</span>.
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
            Streak multiplies your stake on a correct call. Lose a round → streak resets to zero.
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

        <div className="mt-6 rounded-2xl border-2 border-[color:var(--arc-blue)]/40 bg-[color:var(--arc-blue)]/5 p-5 backdrop-blur">
          <p className="font-display text-2xl tracking-tight text-[color:var(--arc-blue)]">
            ◆ THE STACK
          </p>
          <p className="mt-1 font-ui-label text-[10px] tracking-widest text-[color:var(--text-mute)]">
            Everything that makes a round happen.
          </p>
          <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
            {STACK.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-[color:var(--border)] bg-black/30 p-3"
              >
                <p className="font-ui-label text-[10px] tracking-widest text-[color:var(--text-mute)]">
                  {s.label}
                </p>
                <p className={`mt-1 font-mono text-sm leading-snug ${s.tone}`}>
                  {s.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href="/play?auto=1"
            className="lime-cta flex-1 rounded-2xl px-6 py-4 text-center font-display text-2xl tracking-tight sm:px-10 sm:text-3xl"
          >
            DEAL ME IN
          </Link>
          <Link
            href="/faq"
            className="rounded-2xl border-2 border-[color:var(--border-soft)] bg-black/30 px-6 py-4 text-center font-display text-xl tracking-tight text-[color:var(--text)] hover:bg-black/45 sm:px-8 sm:text-2xl"
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
