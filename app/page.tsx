import Link from "next/link"
import { ChestMascot, OracleMascot } from "@/components/bluff/Mascots"

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-10">
      <div className="rays-bg" />
      <div className="forest-ridge" />

      {/* Top nav */}
      <nav className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 py-4">
        <span className="font-display text-2xl tracking-widest text-[color:var(--gold-1)]">
          BL<span className="text-[color:var(--lime)]">◯</span>FF
        </span>
        <div className="hidden gap-6 md:flex">
          <Link href="/lobby" className="font-ui-label text-[11px] tracking-widest text-[color:var(--lime)]">
            Lobby
          </Link>
          <Link href="/lobby" className="font-ui-label text-[11px] tracking-widest text-[color:var(--text-mute)] hover:text-white">
            Stats
          </Link>
          <Link href="/lobby" className="font-ui-label text-[11px] tracking-widest text-[color:var(--text-mute)] hover:text-white">
            Leaderboard
          </Link>
        </div>
        <Link
          href="/lobby"
          className="lime-cta rounded-lg px-4 py-2 font-ui-label text-[11px] tracking-widest"
        >
          Select Wallet
        </Link>
      </nav>

      <header className="relative z-10 text-center">
        <p className="font-ui-label text-[11px] tracking-widest text-[color:var(--lime)]">
          ◆ ON-CHAIN · LIVE · ONE MINUTE PER ROUND
        </p>
        <div className="relative mt-2">
          <p
            className="ghost-jackpot pointer-events-none absolute inset-x-0 -top-8 font-display"
            style={{ fontSize: "clamp(96px, 14vw, 220px)" }}
          >
            5.0×
          </p>
          <h1
            className="jackpot-title relative font-display leading-[0.92]"
            style={{ fontSize: "clamp(96px, 16vw, 220px)" }}
          >
            BLUFF
          </h1>
        </div>
        <p className="mt-4 font-ui-label text-[12px] tracking-widest text-[color:var(--gold-1)]">
          SPOT THE BLUFF · WIN UP TO 5×
        </p>
        <p className="mt-1 font-display text-2xl text-white/85">
          Two AI agents. One claim. One liar.
        </p>
      </header>

      <div className="relative z-10 flex flex-col items-center gap-3">
        <Link
          href="/lobby"
          className="lime-cta rounded-2xl px-14 py-5 font-display text-3xl tracking-wide"
        >
          ENTER LOBBY
        </Link>
        <Link
          href="/play?auto=1"
          className="font-ui-label text-[11px] tracking-widest text-[color:var(--gold-1)] hover:underline"
        >
          or play instantly →
        </Link>
      </div>

      <ChestMascot />
      <OracleMascot />
    </main>
  )
}
