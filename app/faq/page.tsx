"use client"

import { useState } from "react"
import Link from "next/link"
import TopNav from "@/components/bluff/TopNav"
import { ChestMascot, OracleMascot } from "@/components/bluff/Mascots"

const ITEMS: Array<{ q: string; a: string }> = [
  {
    q: "Is this real money?",
    a: "Yes — real USDC on Arc Testnet. Faucet your wallet from faucet.circle.com (chain: Arc Testnet) and you're in. Mainnet is intentionally out of scope.",
  },
  {
    q: "How do the agents decide what to say?",
    a: "We hit Anthropic Claude with the claim. Claude (with web search) returns a verified truth + a source URL. One agent gets prompted as the truth-teller; the other gets the same truth but is told to invent a believable lie. The randomness in temperature 0.95 keeps every round distinct.",
  },
  {
    q: "Where do the topics come from?",
    a: "Three places, in order: live crypto Twitter via the AIsa API (when a factual tweet with numbers shows up), trending crypto hashtags, then a hardcoded pool of 60+ verifiable crypto claims grouped by category. The picker downweights the category we just used so consecutive rounds feel different.",
  },
  {
    q: "What's the streak multiplier?",
    a: "Win → streak +1. Lose → resets to 0. Multiplier on payout: 1.9× (0-2), 2.5× (3-4), 3× (5-9), 5× (10+). The 5× tier is the jackpot mode.",
  },
  {
    q: "What happens to my bet if I lose?",
    a: "It stays in the escrow wallet — that's the pot for future winners. House fee is baked into the multiplier (winners get 1.9× back, not 2×, on the base tier).",
  },
  {
    q: "Why does Connect Wallet prompt me to add a network?",
    a: "Arc Testnet isn't in MetaMask by default. The connect flow adds it for you (chain id 5042002, RPC rpc.testnet.arc.network) and switches you over. Approve both prompts in the wallet.",
  },
  {
    q: "What if Claude is down?",
    a: "The app falls back to a pre-written set of 22 truth lines and 22 liar lines, each tagged with [FALLBACK] in the response so you can tell. The on-chain bet flow still works, but agents will sound canned until the API recovers.",
  },
  {
    q: "Can I see the truth source?",
    a: "Yes. On the reveal screen there's an ◆ TRUTH SOURCE pill linking to the URL Claude cited (when web search returned one). If the claim came from a tweet, you'll also see an ◆ ORIGINAL CLAIM link.",
  },
  {
    q: "How fast does a round go?",
    a: "Roughly: both claims stream word-by-word over ~20 seconds. As soon as you lock a bet, the countdown collapses and the reveal fires. If you don't bet, the round ends at the 60s mark.",
  },
  {
    q: "How are payouts sent?",
    a: "Server-side. After the reveal, the escrow wallet signs a USDC transfer to each winner via viem. You'll see the tx hash with an ↗ Arc explorer link on the reveal screen.",
  },
]

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <main className="relative min-h-screen pb-32">
      <div className="rays-bg" />
      <div className="forest-ridge" />
      <TopNav compact />

      <section className="relative z-10 mx-auto max-w-3xl px-4 pt-6 sm:px-6 sm:pt-8">
        <p className="font-ui-label text-[10px] tracking-widest text-[color:var(--lime)] sm:text-[11px]">
          ◆ STUFF DEGENS ASK
        </p>
        <h1 className="jackpot-title font-display text-5xl leading-tight sm:text-7xl md:text-8xl">
          FAQ
        </h1>

        <ul className="mt-6 space-y-3">
          {ITEMS.map((item, i) => {
            const isOpen = open === i
            return (
              <li
                key={item.q}
                className={`rounded-2xl border-2 backdrop-blur transition ${
                  isOpen
                    ? "border-[color:var(--gold-2)]/60 bg-[color:var(--surface-2)]/90"
                    : "border-[color:var(--border-soft)] bg-[color:var(--surface)]/85"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-display text-xl tracking-tight text-[color:var(--text)]">
                    {item.q}
                  </span>
                  <span
                    className={`font-display text-3xl leading-none transition-transform ${
                      isOpen ? "rotate-45 text-[color:var(--gold-1)]" : "text-[color:var(--text-mute)]"
                    }`}
                    aria-hidden
                  >
                    +
                  </span>
                </button>
                {isOpen && (
                  <p className="px-5 pb-4 font-mono text-sm leading-relaxed text-[color:var(--text)]">
                    {item.a}
                  </p>
                )}
              </li>
            )
          })}
        </ul>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href="/play?auto=1"
            className="lime-cta flex-1 rounded-2xl px-6 py-4 text-center font-display text-2xl tracking-tight sm:px-10 sm:text-3xl"
          >
            DEAL ME IN
          </Link>
          <Link
            href="/rules"
            className="rounded-2xl border-2 border-[color:var(--border-soft)] bg-black/30 px-6 py-4 text-center font-display text-xl tracking-tight text-[color:var(--text)] hover:bg-black/45 sm:px-8 sm:text-2xl"
          >
            ← RULES
          </Link>
        </div>
      </section>

      <ChestMascot />
      <OracleMascot />
    </main>
  )
}
