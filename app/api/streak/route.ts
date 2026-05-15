import { NextResponse } from "next/server"
import { getStreak } from "@/lib/streaks"

export const runtime = "nodejs"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const addr = url.searchParams.get("walletAddress")
  if (!addr || !/^0x[a-fA-F0-9]{40}$/.test(addr)) {
    return NextResponse.json({ streak: 0 })
  }
  return NextResponse.json({ streak: getStreak(addr) })
}
