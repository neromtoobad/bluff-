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
    a: "Each entry in the pool is pre-verified: it carries a verdict (TRUE or FALSE), the actual fact, and a canonical source URL. The truth-teller is told to defend the verified fact in a one-line crypto-Twitter voice; the liar is told to invent a believable counter with a fake-but-specific number. Claude Haiku 4.5 generates both at temperature 0.95 so no two rounds sound alike.",
  },
  {
    q: "Where do the topics come from?",
    a: "A hand-curated pool of 341 claims grouped into 17 categories (bitcoin, ethereum, solana, layer2, defi, regulation, hacks, founders, arc, etc.). 161 are verified TRUE statements, 180 are deliberately FALSE — so the truth-teller's opener flips between 'Yes, it's the truth' and 'No, it's a lie' depending on which side of the pool the round lands on. A rolling cache prevents the same topic in 15 rounds, and category weighting avoids back-to-back repeats.",
  },
  {
    q: "What's the streak multiplier?",
    a: "Win → streak +1. Lose → resets to 0. Multiplier on payout: 1.9× (0-2), 2.5× (3-4), 3× (5-9), 5× (10+). The 5× tier is the jackpot mode.",
  },
  {
    q: "What happens to my bet if I lose?",
    a: "It stays in the escrow wallet — that's the pot for future winners. The house fee is baked into the multiplier (winners get 1.9× back, not 2×, on the base tier).",
  },
  {
    q: "Why does Connect Wallet prompt me to add a network?",
    a: "Arc Testnet isn't in your wallet by default. The connect flow adds it automatically (chain id 5042002, RPC rpc.testnet.arc.network, native token USDC) then switches you over. Works with MetaMask, OKX, Rabby, and Coinbase Wallet. Approve both prompts.",
  },
  {
    q: "Can I sign in without a browser wallet?",
    a: "Yes — pick EMAIL SIGN-UP on the home page. Circle's user-controlled wallets create a smart-contract account (SCA) on Arc Testnet for your email. You set a PIN once; future logins recognize you and skip straight to the wallet.",
  },
  {
    q: "What if Claude is down?",
    a: "Every pool entry carries its own verdict + truth + source, so rounds still run with correct answers even when Claude can't be reached — the agents fall back to a pre-written set of 22 truth lines and 22 liar lines tagged with [FALLBACK] in the text so you can tell.",
  },
  {
    q: "Can I see the truth source?",
    a: "Yes. The reveal screen shows an ◆ TRUTH SOURCE pill linking to the canonical URL for that claim (CoinGecko, Wikipedia, SEC.gov, official protocol docs, etc.) plus the winning agent's payout tx on Arc explorer.",
  },
  {
    q: "How fast does a round go?",
    a: "Round prep takes ~2–4 seconds (Anthropic call). Both claims then stream word-by-word over ~10 seconds. The moment you lock a bet, the reveal fires immediately — no waiting for the full window. Total: well under a minute from tap to payout.",
  },
  {
    q: "How are payouts sent?",
    a: "Server-side, via viem. The escrow wallet signs a USDC transfer to each winner on Arc Testnet. You'll see the tx hash with an ↗ Arc explorer link on the reveal screen seconds after you win.",
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
