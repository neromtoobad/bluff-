import Anthropic from "@anthropic-ai/sdk"
import { ROUNDS, systemPromptFor, type Turn } from "@/lib/agents"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const MODEL = "claude-haiku-4-5-20251001"

function sseChunk(event: string, data: unknown): Uint8Array {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
  return new TextEncoder().encode(payload)
}

function userPromptFor(side: "A" | "B", topic: string, history: Turn[], round: number): string {
  if (history.length === 0) {
    return `Round ${round} of ${ROUNDS}. Open the debate on "${topic}". Give your strongest argument now.`
  }
  const transcript = history
    .map((t) => `Round ${t.round} — Agent ${t.agent}: ${t.text}`)
    .join("\n\n")
  return [
    `Debate so far:\n\n${transcript}`,
    ``,
    `Round ${round} of ${ROUNDS}. You are Agent ${side}. Respond now — rebut the latest point and advance your case.`,
  ].join("\n")
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const topic =
    searchParams.get("topic") ??
    "Stablecoins will overtake traditional payment rails within 5 years"

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return new Response("ANTHROPIC_API_KEY not set", { status: 500 })
  }

  const client = new Anthropic({ apiKey })

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const history: Turn[] = []
      const send = (event: string, data: unknown) =>
        controller.enqueue(sseChunk(event, data))

      try {
        send("start", { topic, rounds: ROUNDS })

        for (let round = 1; round <= ROUNDS; round++) {
          send("round", { round, of: ROUNDS })

          for (const side of ["A", "B"] as const) {
            send("turn_start", { agent: side, round })

            const userPrompt = userPromptFor(side, topic, history, round)
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

            history.push({ agent: side, round, text: buffered })
            send("turn_end", { agent: side, round, text: buffered })
          }
        }

        send("done", { rounds: ROUNDS })
      } catch (err: any) {
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
