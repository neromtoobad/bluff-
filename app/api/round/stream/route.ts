import { NextRequest } from "next/server"
import { getRound } from "@/lib/bluff-state"
import { verifyRound } from "@/lib/round-token"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
// SSE — needs to outlive Vercel's default 10s Hobby cap. 300s = 5min,
// the Pro tier ceiling. Hobby will cap at 60s; that's still fine since
// our longest possible wait is ROUND_DURATION_MS (60s).
export const maxDuration = 300

const TOKEN_MS = 80

function tokenize(text: string): string[] {
  return text.match(/\S+\s*/g) || []
}

type RoundData = {
  id: string
  topic: string
  claimA: string
  claimB: string
  liar: "A" | "B"
  truth: string
  source: string
  bettingDeadline: number
}

export async function GET(req: NextRequest) {
  const roundId = req.nextUrl.searchParams.get("roundId")
  const roundToken = req.nextUrl.searchParams.get("roundToken")
  if (!roundId) return new Response("missing roundId", { status: 400 })

  // Prefer warm-lambda in-memory lookup, fall back to the signed token
  // (which any lambda can decode with the shared secret).
  let round: RoundData | undefined = getRound(roundId)
  if (!round && roundToken) {
    try {
      const decoded = verifyRound(roundToken)
      if (decoded.id !== roundId) {
        return new Response("round token / id mismatch", { status: 400 })
      }
      round = decoded
    } catch (e: any) {
      console.error("[round/stream] verify token failed:", e?.message ?? e)
      return new Response("invalid round token", { status: 400 })
    }
  }
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
        roundId: round!.id,
        topic: round!.topic,
        bettingDeadline: round!.bettingDeadline,
      })

      const streamClaim = async (agent: "A" | "B", text: string) => {
        send("agent_start", { agent })
        for (const tok of tokenize(text)) {
          send("agent_token", { agent, token: tok })
          await sleep(TOKEN_MS)
        }
        send("agent_done", { agent })
      }

      await streamClaim("A", round!.claimA)
      await streamClaim("B", round!.claimB)

      send("betting_open", { deadline: round!.bettingDeadline })

      // Token-based round can't honor /bet's deadline-collapse trick across
      // lambdas, so we just wait for the original deadline. Bets still work;
      // the reveal just isn't instant after the user picks.
      const wait = round!.bettingDeadline - Date.now()
      if (wait > 0) await sleep(wait)

      send("reveal", {
        liar: round!.liar,
        truth: round!.truth,
        source: round!.source,
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
