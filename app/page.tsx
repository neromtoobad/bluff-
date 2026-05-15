import Link from "next/link"
import { ChestMascot, OracleMascot } from "@/components/bluff/Mascots"
import TopNav from "@/components/bluff/TopNav"

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col">
      <div className="rays-bg" />
      <div className="forest-ridge" />
      <TopNav />

      <section className="relative z-10 flex flex-1 flex-col items-center justify-center gap-6 px-6 pb-32 text-center">
        <p className="font-ui-label text-[11px] tracking-widest text-[color:var(--lime)]">
          ◆ ONE MINUTE · TWO AGENTS · ONE LIAR
        </p>
        <div className="relative">
          <p
            className="ghost-jackpot pointer-events-none absolute inset-x-0 -top-16 font-display"
            style={{ fontSize: "clamp(112px, 16vw, 260px)" }}
          >
            5.0×
          </p>
          <h1
            className="jackpot-title relative font-display leading-[0.92]"
            style={{ fontSize: "clamp(120px, 22vw, 320px)" }}
          >
            BLUFF
          </h1>
        </div>
        <p className="mt-2 max-w-xl font-display text-3xl text-white/85">
          Spot the AI lie. Win up to 5× your bet.
        </p>
        <p className="font-ui-label text-[11px] tracking-widest text-[color:var(--gold-1)]">
          Real USDC. On-chain on Arc Testnet. No emails.
        </p>

        <div className="flex flex-col items-center gap-3">
          <Link
            href="/play?auto=1"
            className="lime-cta rounded-2xl px-14 py-5 font-display text-4xl tracking-wide"
          >
            DEAL ME IN
          </Link>
          <Link
            href="/rules"
            className="font-ui-label text-[11px] tracking-widest text-[color:var(--gold-1)] hover:underline"
          >
            new here? read the rules →
          </Link>
        </div>
      </section>

      <ChestMascot />
      <OracleMascot />
    </main>
  )
}
