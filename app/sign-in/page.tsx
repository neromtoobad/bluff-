"use client"

import EmailLogin from "@/components/EmailLogin"
import TopNav from "@/components/bluff/TopNav"
import { ChestMascot, OracleMascot } from "@/components/bluff/Mascots"

export default function SignInPage() {
  return (
    <main className="relative flex min-h-screen flex-col">
      <div className="rays-bg" />
      <div className="forest-ridge" />
      <TopNav compact />

      <section className="relative z-10 flex flex-1 flex-col items-center justify-center gap-6 px-4 pb-32 text-center sm:px-6">
        <p className="font-ui-label text-[10px] tracking-widest text-[color:var(--lime)] sm:text-[11px]">
          ◆ NO SEED PHRASE · NO EXTENSION
        </p>
        <h1 className="jackpot-title font-display text-5xl leading-tight sm:text-7xl md:text-8xl">
          SIGN IN
        </h1>
        <p className="font-ui-label text-[10px] tracking-widest text-[color:var(--gold-1)] sm:text-[11px]">
          Circle creates an Arc Testnet smart wallet for your email.
        </p>

        <EmailLogin />
      </section>

      <ChestMascot />
      <OracleMascot />
    </main>
  )
}
