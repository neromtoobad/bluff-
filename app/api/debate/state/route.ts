import { NextResponse } from "next/server"
import { debateState } from "@/lib/debate-state"

export const dynamic = "force-dynamic"

export async function GET() {
  const s = debateState
  return NextResponse.json({
    topic: s.topic,
    status: s.status,
    round: s.round,
    starting: s.starting.toFixed(3),
    balances: {
      A: s.balances.A.toFixed(3),
      B: s.balances.B.toFixed(3),
    },
    research: s.research.map((r) => ({
      agent: r.agent,
      round: r.round,
      cost: r.cost.toFixed(3),
      insight: r.insight,
      at: r.at,
    })),
    startedAt: s.startedAt,
    updatedAt: s.updatedAt,
  })
}
