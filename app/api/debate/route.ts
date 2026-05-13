import Anthropic from "@anthropic-ai/sdk"
import { ROUNDS, systemPromptFor, type Turn } from "@/lib/agents"
import { AGENT_STARTING_BALANCE_USDC, RESEARCH_COST_USDC } from "@/lib/x402"
import {
  finishDebate,
  recordResearch,
  recordTurn,
  resetDebate,
  setRound,
  setStatus,
} from "@/lib/debate-state"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const MODEL = "claude-haiku-4-5-20251001"

function sseChunk(event: string, data: unknown): Uint8Array {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
  return new TextEncoder().encode(payload)
}

function userPromptFor(
  side: "A" | "B",
  topic: string,
  history: Turn[],
  round: number,
  insight: string | null,
): string {
  const research = insight
    ? `Fresh research you just paid $${RESEARCH_COST_USDC.toFixed(3)} USDC to fetch:\n"${insight}"\nUse it if relevant.\n\n`
    : ""

  if (history.length === 0) {
    return `${research}Round ${round} of ${ROUNDS}. Open the debate on "${topic}". Give your strongest argument now.`
  }
  const transcript = history
    .map((t) => `Round ${t.round} — Agent ${t.agent}: ${t.text}`)
    .join("\n\n")
  return [
    `Debate so far:\n\n${transcript}`,
    ``,
    `${research}Round ${round} of ${ROUNDS}. You are Agent ${side}. Respond now — rebut the latest point and advance your case.`,
  ].join("\n")
}

async function fetchResearch(
  origin: string,
  topic: string,
  agent: "A" | "B",
  round: number,
): Promise<{ insight: string; cost: number } | null> {
  try {
    const res = await fetch(`${origin}/api/research`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, agent, round }),
      cache: "no-store",
    })
    if (!res.ok) return null
    return (await res.json()) as { insight: string; cost: number }
  } catch {
    return null
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const topic =
    url.searchParams.get("topic") ??
    "Stablecoins will overtake traditional payment rails within 5 years"
  const origin = url.origin

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return new Response("ANTHROPIC_API_KEY not set", { status: 500 })
  }

  const client = new Anthropic({ apiKey })

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const history: Turn[] = []
      const balances: Record<"A" | "B", number> = {
        A: AGENT_STARTING_BALANCE_USDC,
        B: AGENT_STARTING_BALANCE_USDC,
      }
      const send = (event: string, data: unknown) =>
        controller.enqueue(sseChunk(event, data))

      try {
        resetDebate(topic)
        send("start", { topic, rounds: ROUNDS })
        send("balances", {
          A: balances.A.toFixed(3),
          B: balances.B.toFixed(3),
        })

        for (let round = 1; round <= ROUNDS; round++) {
          setRound(round)
          send("round", { round, of: ROUNDS })

          for (const side of ["A", "B"] as const) {
            send("turn_start", { agent: side, round })

            // Pull research once per round, deduct from balance.
            let insight: string | null = null
            if (balances[side] >= RESEARCH_COST_USDC) {
              const r = await fetchResearch(origin, topic, side, round)
              if (r) {
                balances[side] = Math.max(0, balances[side] - r.cost)
                insight = r.insight
                recordResearch({
                  agent: side,
                  round,
                  cost: r.cost,
                  insight: r.insight,
                })
                send("research", {
                  agent: side,
                  round,
                  insight: r.insight,
                  cost: r.cost.toFixed(3),
                  balance: balances[side].toFixed(3),
                })
              }
            }

            const userPrompt = userPromptFor(side, topic, history, round, insight)
            let buffered = ""

            const turnStream = client.messages.stream({
              model: MODEL,
              max_tokens: 350,
              system: systemPromptFor(side, topic),
              messages: [{ role: "user", content: userPrompt }],
            })

            for await (const event of turnStream) {
              if (
                event.type === "content_block_delta" &&
                event.delta.type === "text_delta"
              ) {
                const text = event.delta.text
                buffered += text
                send("delta", { agent: side, round, text })
              }
            }

            const turn = { agent: side, round, text: buffered }
            history.push(turn)
            recordTurn(turn)
            send("turn_end", turn)
          }
        }

        send("done", {
          rounds: ROUNDS,
          balances: { A: balances.A.toFixed(3), B: balances.B.toFixed(3) },
        })

        // Auto-invoke the judge with the full transcript.
        setStatus("judging")
        send("judging", {})
        try {
          const judgeRes = await fetch(`${origin}/api/judge`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ topic, transcript: history }),
            cache: "no-store",
          })
          if (judgeRes.ok) {
            const verdict = await judgeRes.json()
            send("verdict", verdict)

            // Fire and forget — settlement runs server-side; UI polls state.
            send("settling", {})
            fetch(`${origin}/api/settle`, {
              method: "POST",
              cache: "no-store",
            }).catch(() => {
              /* swallow — state route will surface settlement errors */
            })
          } else {
            const errText = await judgeRes.text()
            send("error", { message: `judge failed: ${errText}` })
            finishDebate("error")
          }
        } catch (e: any) {
          send("error", { message: e?.message ?? "judge call failed" })
          finishDebate("error")
        }
      } catch (err: any) {
        finishDebate("error")
        send("error", { message: err?.message ?? "debate failed" })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  })
}
