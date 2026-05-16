import { NextRequest } from "next/server"
import { getRound } from "@/lib/bluff-state"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
// SSE — needs to outlive Vercel's default 10s Hobby cap. 300s = 5min,
// the Pro tier ceiling. Hobby will cap at 60s; that's still fine since
// our longest possible wait is ROUND_DURATION_MS (60s).
export const maxDuration = 300

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

      // Poll the deadline so /api/round/bet can collapse it after the user
      // places their bet — otherwise we'd be stuck in a long sleep that
      // captured the original deadline.
      while (Date.now() < round.bettingDeadline) {
        await sleep(250)
      }

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
