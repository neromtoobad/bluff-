import { NextResponse } from "next/server"
import { allStats } from "@/lib/stats"
import { getStreak } from "@/lib/streaks"

export const runtime = "nodejs"

export async function GET() {
  const entries: Array<{
    walletAddress: string
    streak: number
    totalWon: number
    played: number
  }> = []
  for (const [addr, s] of allStats()) {
    entries.push({
      walletAddress: addr,
      streak: getStreak(addr),
      totalWon: Number(s.totalWonUSDC.toFixed(2)),
      played: s.played,
    })
  }

  const byStreak = [...entries].sort((a, b) => b.streak - a.streak).slice(0, 10)
  const byWinnings = [...entries].sort((a, b) => b.totalWon - a.totalWon).slice(0, 10)

  return NextResponse.json({ byStreak, byWinnings })
}
