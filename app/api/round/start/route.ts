import { NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { randomTopic } from "@/lib/topics"
import { saveRound, type Side } from "@/lib/bluff-state"
import {
  fetchTruth,
  generateLiarClaim,
  generateTruthClaim,
} from "@/lib/bluff-claude"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const ROUND_DURATION_MS = 60_000

export async function POST() {
  const topic = randomTopic()
  const liar: Side = Math.random() < 0.5 ? "A" : "B"

  const { truth, source } = await fetchTruth(topic)

  const [truthClaim, liarClaim] = await Promise.all([
    generateTruthClaim(topic, truth),
    generateLiarClaim(topic, truth),
  ])

  const claimA = liar === "A" ? liarClaim : truthClaim
  const claimB = liar === "B" ? liarClaim : truthClaim

  const now = Date.now()
  const id = randomUUID()
  const bettingDeadline = now + ROUND_DURATION_MS

  saveRound({
    id,
    topic,
    liar,
    truth,
    source,
    claimA,
    claimB,
    createdAt: now,
    streamingDoneAt: 0,
    bettingDeadline,
    revealAt: bettingDeadline,
    bets: [],
  })

  return NextResponse.json({
    roundId: id,
    topic,
    liarRevealedAt: bettingDeadline,
  })
}
