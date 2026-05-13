import { NextResponse } from "next/server"
import { totalsBySide } from "@/lib/bets"

export const dynamic = "force-dynamic"

export async function GET() {
  const t = totalsBySide()
  return NextResponse.json({
    A: { amount: t.A.amount.toFixed(2), bettors: t.A.bettors },
    B: { amount: t.B.amount.toFixed(2), bettors: t.B.bettors },
    pot: (t.A.amount + t.B.amount).toFixed(2),
  })
}
