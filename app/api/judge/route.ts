import Anthropic from "@anthropic-ai/sdk"
import { NextResponse } from "next/server"
import { debateState, setStatus, setVerdict, type Verdict } from "@/lib/debate-state"
import type { Turn } from "@/lib/agents"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const MODEL = "claude-haiku-4-5-20251001"

const JUDGE_SYSTEM = [
  "You are an impartial debate judge. Score two AI agents across a 4-round debate.",
  "Score each agent on three axes (integers, 0-10): logic, evidence quality, persuasiveness.",
  "Pick the winner by higher total. Ties: pick the side with stronger evidence.",
  "Return ONLY valid JSON matching this shape — no prose, no markdown, no backticks:",
  `{"scores":{"A":{"logic":N,"evidence":N,"persuasiveness":N},"B":{"logic":N,"evidence":N,"persuasiveness":N}},"winner":"A"|"B","summary":"one paragraph, 2-4 sentences, explain the call"}`,
].join("\n")

function clamp(n: unknown): number {
  const x = Math.round(Number(n))
  if (!Number.isFinite(x)) return 0
  return Math.max(0, Math.min(10, x))
}

function buildVerdict(raw: any): Verdict {
  const A = {
    logic: clamp(raw?.scores?.A?.logic),
    evidence: clamp(raw?.scores?.A?.evidence),
    persuasiveness: clamp(raw?.scores?.A?.persuasiveness),
    total: 0,
  }
  A.total = A.logic + A.evidence + A.persuasiveness
  const B = {
    logic: clamp(raw?.scores?.B?.logic),
    evidence: clamp(raw?.scores?.B?.evidence),
    persuasiveness: clamp(raw?.scores?.B?.persuasiveness),
    total: 0,
  }
  B.total = B.logic + B.evidence + B.persuasiveness

  let winner: "A" | "B" = raw?.winner === "A" || raw?.winner === "B" ? raw.winner : "A"
  // If model's pick disagrees with the math, trust the math.
  if (A.total !== B.total) winner = A.total > B.total ? "A" : "B"

  const summary =
    typeof raw?.summary === "string" && raw.summary.length > 0
      ? raw.summary.trim()
      : `Agent ${winner} prevailed on aggregate score.`

  return { scores: { A, B }, winner, summary }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      topic?: string
      transcript?: Turn[]
    }

    const topic = body.topic ?? debateState.topic ?? "the debate topic"
    const transcript = body.transcript ?? debateState.transcript
    if (!transcript || transcript.length === 0) {
      return NextResponse.json({ error: "no transcript to judge" }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "ANTHROPIC_API_KEY not set" }, { status: 500 })
    }

    setStatus("judging")

    const transcriptText = transcript
      .map((t) => `Round ${t.round} — Agent ${t.agent}: ${t.text}`)
      .join("\n\n")

    const client = new Anthropic({ apiKey })
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 600,
      system: JUDGE_SYSTEM,
      messages: [
        {
          role: "user",
          content: `Topic: "${topic}". Agent A argued FOR, Agent B argued AGAINST.\n\nTranscript:\n\n${transcriptText}\n\nReturn the JSON verdict now.`,
        },
      ],
    })

    const text = msg.content
      .filter((b) => b.type === "text")
      .map((b: any) => b.text)
      .join("")
      .trim()

    let parsed: any
    try {
      // Strip accidental fences if the model adds them despite instructions.
      const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "")
      parsed = JSON.parse(cleaned)
    } catch {
      return NextResponse.json(
        { error: "judge returned non-JSON", raw: text },
        { status: 502 },
      )
    }

    const verdict = buildVerdict(parsed)
    setVerdict(verdict)
    return NextResponse.json(verdict)
  } catch (err: any) {
    setStatus("error")
    return NextResponse.json({ error: err?.message ?? "judge failed" }, { status: 500 })
  }
}
