import { NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { getRoundTopic } from "@/lib/topics"
import { saveRound, type Side } from "@/lib/bluff-state"
import {
  fetchTruth,
  generateLiarClaim,
  generateTruthClaim,
  truthOpener,
  liarOpener,
} from "@/lib/bluff-claude"
import { signRound } from "@/lib/round-token"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const ROUND_DURATION_MS = 60_000

export async function POST() {
  const picked = await getRoundTopic()
  const { topic, source: topicSource, url: topicUrl } = picked
  const liar: Side = Math.random() < 0.5 ? "A" : "B"

  // Prefer pre-verified data from the pool when present — skips the ~3-5s
  // web-search fetchTruth call and avoids hallucinated verdicts.
  let truth: string
  let source: string
  let verdict: "true" | "false" | "unclear"
  if (picked.verdict && picked.truthSummary) {
    truth = picked.truthSummary
    source = picked.truthSource ?? "verified-pool"
    verdict =
      picked.verdict === "TRUE"
        ? "true"
        : picked.verdict === "FALSE"
          ? "false"
          : "unclear"
  } else {
    const fetched = await fetchTruth(topic)
    truth = fetched.truth
    source = fetched.source
    verdict = fetched.verdict
  }

  // The truth-teller's stance is dictated by the verdict; the liar takes
  // the opposite. For "unclear", we coin-flip and still hand opposite
  // openers to each agent so the user can compare two distinct stances.
  let truthSay = truthOpener(verdict)
  let liarSay = liarOpener(verdict)
  if (verdict === "unclear" && Math.random() < 0.5) {
    truthSay = "No, it's a lie."
    liarSay = "Yes, it's the truth."
  }

  const [truthClaim, liarClaim] = await Promise.all([
    generateTruthClaim(topic, truth, source, truthSay),
    generateLiarClaim(topic, truth, liarSay),
  ])

  const claimA = liar === "A" ? liarClaim : truthClaim
  const claimB = liar === "B" ? liarClaim : truthClaim

  const now = Date.now()
  const id = randomUUID()
  const bettingDeadline = now + ROUND_DURATION_MS

  saveRound({
    id,
    topic,
    topicSource,
    topicUrl,
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

  // Stateless round token — lets /stream, /bet, /settle work even when they
  // land on a different Vercel lambda than /start.
  const roundToken = signRound({
    id,
    topic,
    topicSource,
    topicUrl,
    liar,
    truth,
    source,
    claimA,
    claimB,
    bettingDeadline,
  })

  return NextResponse.json({
    roundId: id,
    topic,
    topicSource,
    topicUrl,
    liarRevealedAt: bettingDeadline,
    roundToken,
  })
}
