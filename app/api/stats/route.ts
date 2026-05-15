import { NextResponse } from "next/server"
import { getStats } from "@/lib/stats"
import { getStreak } from "@/lib/streaks"

export const runtime = "nodejs"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const addr = url.searchParams.get("walletAddress")
  if (!addr || !/^0x[a-fA-F0-9]{40}$/.test(addr)) {
    return NextResponse.json({
      played: 0,
      wins: 0,
      totalWon: 0,
      winRate: 0,
      streak: 0,
    })
  }
  const s = getStats(addr)
  const winRate = s.played > 0 ? s.wins / s.played : 0
  return NextResponse.json({
    played: s.played,
    wins: s.wins,
    totalWon: Number(s.totalWonUSDC.toFixed(2)),
    winRate: Number(winRate.toFixed(3)),
    streak: getStreak(addr),
  })
}
