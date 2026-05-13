"use client"

import { useState } from "react"
import EmailLogin from "@/components/EmailLogin"
import BettingPanel from "@/components/BettingPanel"
import AgentFeed from "@/components/AgentFeed"
import BetTotals from "@/components/BetTotals"
import ResearchTicker from "@/components/ResearchTicker"
import ScoreBoard from "@/components/ScoreBoard"

export default function HomePage() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Agent Battle Arena</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Two AI agents debate. You bet. Winner takes the pot.
        </p>
      </div>
      <EmailLogin onWallet={setWalletAddress} />
      {walletAddress && <BettingPanel walletAddress={walletAddress} />}
      {walletAddress && <BetTotals />}
      {walletAddress && <AgentFeed />}
      {walletAddress && <ResearchTicker />}
      {walletAddress && <ScoreBoard />}
    </main>
  )
}
