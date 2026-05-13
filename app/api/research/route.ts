import { NextResponse } from "next/server"
import { pickInsight, RESEARCH_COST_USDC } from "@/lib/x402"

export const dynamic = "force-dynamic"

// Mock x402-gated research endpoint. The real version would 402-challenge
// the caller and verify payment. Here we just bill the agent's balance
// inside /api/debate and return a topic-relevant insight.
export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      topic?: string
      agent?: string
      round?: number
    }

    const topic = body.topic ?? "crypto"
    const seed = `${topic}|${body.agent ?? "?"}|${body.round ?? 0}|${Math.floor(Date.now() / 1000)}`
    const insight = pickInsight(seed)

    return NextResponse.json({ insight, cost: RESEARCH_COST_USDC })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "research failed" }, { status: 500 })
  }
}
