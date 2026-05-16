"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ChestMascot, OracleMascot } from "@/components/bluff/Mascots"
import TopNav from "@/components/bluff/TopNav"
import ConnectButton from "@/components/bluff/ConnectButton"

type View = "unknown" | "gate" | "signed-in"

export default function HomePage() {
  // Until we've checked sessionStorage, render the gate skeleton (no auto
  // redirect, no flash of the wrong screen).
  const [view, setView] = useState<View>("unknown")

  useEffect(() => {
    let addr = ""
    try {
      addr = sessionStorage.getItem("arc:walletAddress") ?? ""
    } catch {}
    setView(addr && /^0x[a-fA-F0-9]{40}$/.test(addr) ? "signed-in" : "gate")
  }, [])

  // React to ConnectButton's accountsChanged / disconnect events.
  useEffect(() => {
    const onStorage = () => {
      try {
        const addr = sessionStorage.getItem("arc:walletAddress") ?? ""
        setView(addr ? "signed-in" : "gate")
      } catch {}
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  return (
    <main className="relative flex min-h-screen flex-col">
      <div className="rays-bg" />
      <div className="forest-ridge" />
      <TopNav />

      {view === "signed-in" ? (
        <SignedInHero />
      ) : (
        // For "unknown" we render the gate too — it's the safer default
        // for a first-time visitor and avoids a flash of DEAL ME IN.
        <Gate />
      )}

      <ChestMascot />
      <OracleMascot />
    </main>
  )
}

function Gate() {
  return (
    <section className="relative z-10 flex flex-1 flex-col items-center justify-center gap-6 px-4 pb-32 text-center sm:px-6">
      <p className="font-ui-label text-[10px] tracking-widest text-[color:var(--lime)] sm:text-[11px]">
        ◆ WELCOME TO BLUFF
      </p>
      <h1
        className="jackpot-title font-display leading-[0.92]"
        style={{ fontSize: "clamp(56px, 12vw, 180px)" }}
      >
        SIGN IN TO PLAY
      </h1>
      <p className="max-w-md px-2 font-display text-lg text-white/85 sm:text-2xl">
        Pick how you want to bet. You can always switch later.
      </p>

      <div className="mt-2 grid w-full max-w-2xl grid-cols-1 gap-4 px-2 sm:grid-cols-2">
        {/* Email / Circle SCA */}
        <Link
          href="/sign-in"
          className="group flex flex-col items-center gap-3 rounded-2xl border-2 border-[color:var(--gold-2)]/50 bg-[color:var(--surface)]/85 p-6 backdrop-blur transition hover:border-[color:var(--gold-1)]/80 hover:bg-[color:var(--surface-2)]/80"
        >
          <span className="text-4xl">✉️</span>
          <span className="font-display text-2xl tracking-tight text-[color:var(--gold-1)]">
            EMAIL SIGN-UP
          </span>
          <span className="font-ui-label text-[10px] tracking-widest text-[color:var(--text-mute)]">
            Circle creates a smart wallet for you
          </span>
          <span className="font-ui-label text-[10px] tracking-widest text-[color:var(--gold-1)]/80 group-hover:underline">
            no seed phrase, no extension →
          </span>
        </Link>

        {/* Browser wallet */}
        <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-[color:var(--lime)]/50 bg-[color:var(--surface)]/85 p-6 backdrop-blur transition hover:border-[color:var(--lime)]/80 hover:bg-[color:var(--surface-2)]/80">
          <span className="text-4xl">🦊</span>
          <span className="font-display text-2xl tracking-tight text-[color:var(--lime)]">
            CONNECT WALLET
          </span>
          <span className="font-ui-label text-[10px] tracking-widest text-[color:var(--text-mute)]">
            MetaMask, Rabby, Coinbase Wallet
          </span>
          <ConnectButton className="lime-cta rounded-xl px-5 py-2 font-display text-base tracking-wide" />
        </div>
      </div>

      <p className="mt-1 font-ui-label text-[10px] tracking-widest text-[color:var(--text-mute)]">
        Real USDC · Arc Testnet · no funds at risk
      </p>
    </section>
  )
}

function SignedInHero() {
  return (
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
        Real USDC. On-chain on Arc Testnet.
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
  )
}
