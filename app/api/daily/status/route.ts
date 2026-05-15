import { NextResponse } from "next/server"
import { DAILY_AMOUNT, hasClaimedToday } from "@/lib/daily"

export const runtime = "nodejs"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const addr = url.searchParams.get("walletAddress")
  if (!addr || !/^0x[a-fA-F0-9]{40}$/.test(addr)) {
    return NextResponse.json({ claimed: false, amount: DAILY_AMOUNT })
  }
  return NextResponse.json({
    claimed: hasClaimedToday(addr),
    amount: DAILY_AMOUNT,
  })
}
