import Link from "next/link"
import { ChestMascot, OracleMascot } from "@/components/bluff/Mascots"
import TopNav from "@/components/bluff/TopNav"

export const dynamic = "force-static"
export const revalidate = false

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col">
      <div className="rays-bg" />
      <div className="forest-ridge" />
      <TopNav />

      <section className="relative z-10 flex flex-1 flex-col items-center justify-center gap-5 px-4 pb-32 text-center sm:gap-6 sm:px-6">
        <p className="font-ui-label text-[10px] tracking-widest text-[color:var(--lime)] sm:text-[11px]">
          ◆ ONE MINUTE · TWO AGENTS · ONE LIAR
        </p>
        <div className="relative">
          <p
            className="ghost-jackpot pointer-events-none absolute inset-x-0 -top-10 font-display sm:-top-16"
            style={{ fontSize: "clamp(72px, 14vw, 260px)" }}
          >
            5.0×
          </p>
          <h1
            className="jackpot-title relative font-display leading-[0.92]"
            style={{ fontSize: "clamp(72px, 19vw, 320px)" }}
          >
            BLUFF
          </h1>
        </div>
        <p className="mt-2 max-w-xl px-2 font-display text-xl text-white/85 sm:text-3xl">
          Spot the AI lie. Win up to 5× your bet.
        </p>
        <p className="font-ui-label text-[10px] tracking-widest text-[color:var(--gold-1)] sm:text-[11px]">
          Real USDC. On-chain on Arc Testnet. No emails.
        </p>

        <div className="flex w-full max-w-sm flex-col items-stretch gap-3 px-4 sm:max-w-none sm:w-auto sm:items-center sm:px-0">
          <Link
            href="/play?auto=1"
            className="lime-cta rounded-2xl px-8 py-4 text-center font-display text-3xl tracking-wide sm:px-14 sm:py-5 sm:text-4xl"
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
