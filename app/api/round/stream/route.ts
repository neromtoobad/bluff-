import { NextRequest } from "next/server"
import { getRound } from "@/lib/bluff-state"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const TOKEN_MS = 80

function tokenize(text: string): string[] {
  // Word + trailing whitespace as one "token" — feels natural when streamed.
  return text.match(/\S+\s*/g) || []
}

export async function GET(req: NextRequest) {
  const roundId = req.nextUrl.searchParams.get("roundId")
  if (!roundId) return new Response("missing roundId", { status: 400 })

  const round = getRound(roundId)
  if (!round) return new Response("round not found", { status: 404 })

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
        )
      }
      const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

      send("meta", {
        roundId: round.id,
        topic: round.topic,
        bettingDeadline: round.bettingDeadline,
      })

      const streamClaim = async (agent: "A" | "B", text: string) => {
        send("agent_start", { agent })
        for (const tok of tokenize(text)) {
          send("agent_token", { agent, token: tok })
          await sleep(TOKEN_MS)
        }
        send("agent_done", { agent })
      }

      await streamClaim("A", round.claimA)
      await streamClaim("B", round.claimB)

      send("betting_open", { deadline: round.bettingDeadline })

      const wait = round.bettingDeadline - Date.now()
      if (wait > 0) await sleep(wait)

      send("reveal", {
        liar: round.liar,
        truth: round.truth,
        source: round.source,
      })

      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  })
}
