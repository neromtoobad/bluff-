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
import {
  getInsightWithFallback,
  listServices,
  type MarketplaceService,
} from "@/lib/circle-marketplace"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const MODEL = "claude-haiku-4-5-20251001"

// --- Pacing ---
// Tokens here are word-chunks (incl. whitespace) sent to the client.
// BURST_TOKENS × inter-burst pause = effective tokens/sec to client.
// We're well under 30 tok/sec — the goal is "thinking", not throughput.
const BURST_TOKENS = 6
const BURST_PAUSE_MS = 800
const INTER_TURN_PAUSE_MS = 2000
const INTER_ROUND_PAUSE_MS = 3000
const WORD_LIMIT = 80
// Allow the model to overshoot a little so we can cap at a clean sentence
// boundary instead of mid-word.
const OVERSHOOT_WORDS = 120

const ROUND_INTENSITY: Record<number, string> = {
  1: [
    `INTENSITY — Round 1: MEASURED.`,
    `Establish your position cleanly. Lead with your core claim and one concrete data point.`,
    `You're warming up — confident, not yet swinging.`,
  ].join("\n"),
  2: [
    `INTENSITY — Round 2: PERSONAL.`,
    `Get specific. Quote your opponent's exact words back at them and attack that claim by name.`,
    `Make it feel like a direct counter-punch.`,
  ].join("\n"),
  3: [
    `INTENSITY — Round 3: NO MERCY.`,
    `Most aggressive round of the fight. Treat your opponent like they insulted you.`,
    `Sharpest closer you've got. Make them eat it.`,
  ].join("\n"),
  4: [
    `INTENSITY — Round 4: CLOSING ARGUMENT.`,
    `Final word. Confident, almost smug — speak like the judge has already decided.`,
    `Sum up why you've already won. No questions, only conclusions.`,
  ].join("\n"),
}

function sseChunk(event: string, data: unknown): Uint8Array {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
  return new TextEncoder().encode(payload)
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function capAt80Words(text: string): string {
  const wc = wordCount(text)
  if (wc <= WORD_LIMIT) return text.trim()
  // Slice at the 80-word mark, then walk back to the last sentence terminator.
  const words = text.trim().split(/(\s+)/) // preserve whitespace
  let count = 0
  let sliceEnd = words.length
  for (let i = 0; i < words.length; i++) {
    if (/\S/.test(words[i])) {
      count++
      if (count > WORD_LIMIT) {
        sliceEnd = i
        break
      }
    }
  }
  const truncated = words.slice(0, sliceEnd).join("")
  // Walk back to last . ! ? followed by whitespace or end-of-string.
  const m = truncated.match(/[\s\S]*[.!?](?!\S)/)
  if (m) return m[0].trim()
  // No sentence boundary found — cut at last word.
  return truncated.trim()
}

function userPromptFor(
  side: "A" | "B",
  topic: string,
  history: Turn[],
  round: number,
  insight: string | null,
): string {
  const opponent = side === "A" ? "B" : "A"
  const research = insight
    ? `Fresh data you just paid $${RESEARCH_COST_USDC.toFixed(3)} USDC for:\n"${insight}"\nUse it if it lands. Drop it if it doesn't.\n\n`
    : ""

  const rules = [
    `Rules: 3 sentences max, under ${WORD_LIMIT} words. No academic words. Attack Agent ${opponent} directly. End with a brutal one-liner on its own line.`,
  ].join("\n")

  if (history.length === 0) {
    return [
      `${research}Round ${round} of ${ROUNDS}. Open the fight on "${topic}". Hit hard.`,
      rules,
    ].join("\n\n")
  }

  const lastOpponent = [...history].reverse().find((t) => t.agent === opponent)
  const transcript = history
    .map((t) => `R${t.round} · Agent ${t.agent}: ${t.text}`)
    .join("\n\n")

  const target = lastOpponent
    ? `Agent ${opponent} just said: "${lastOpponent.text}"\nRip that apart specifically.`
    : `Open hard.`

  return [
    `Debate so far:\n\n${transcript}`,
    ``,
    `${research}Round ${round} of ${ROUNDS}. ${target}`,
    rules,
  ].join("\n")
}

// Legacy single-endpoint fetcher — kept for reference. Live calls now go
// through lib/circle-marketplace which picks a marketplace service and
// falls back to /api/research when the marketplace API isn't reachable.

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

      // Discover marketplace services once at the start of the fight.
      // Falls back to local /api/research if Circle's marketplace API
      // is unreachable (currently always — endpoint returns 404).
      let services: MarketplaceService[] = []
      try {
        services = await listServices("research")
      } catch {
        services = []
      }

      try {
        resetDebate(topic)
        send("start", { topic, rounds: ROUNDS })
        send("balances", {
          A: balances.A.toFixed(3),
          B: balances.B.toFixed(3),
        })
        send("services", {
          services: services.map((s) => ({
            id: s.id,
            name: s.name,
            provider: s.provider,
          })),
        })

        for (let round = 1; round <= ROUNDS; round++) {
          // 3-second gap between rounds — the RoundIntro overlay flashes
          // during this window on the client.
          if (round > 1) {
            await new Promise((r) => setTimeout(r, INTER_ROUND_PAUSE_MS))
          }
          setRound(round)
          send("round", { round, of: ROUNDS })

          for (const [idx, side] of (["A", "B"] as const).entries()) {
            // 2-second beat between turns. Skip before the very first turn
            // so the fight starts crisp. The client's turn_start handler
            // shows a 'preparing argument…' placeholder during this pause.
            if (!(round === 1 && idx === 0)) {
              await new Promise((r) => setTimeout(r, INTER_TURN_PAUSE_MS))
            }
            send("turn_start", { agent: side, round })

            // Pull research once per round via the marketplace lib, deduct
            // from balance. The lib picks a service, attempts payment, and
            // falls back to local /api/research if the chosen service is
            // unreachable.
            let insight: string | null = null
            if (balances[side] >= RESEARCH_COST_USDC) {
              const r = await getInsightWithFallback({
                origin,
                services,
                topic,
                agent: side,
                round,
              })
              if (r) {
                balances[side] = Math.max(0, balances[side] - r.cost)
                insight = r.insight
                recordResearch({
                  agent: side,
                  round,
                  cost: r.cost,
                  insight: r.insight,
                  service: r.service,
                  txHash: r.txHash,
                })
                send("research", {
                  agent: side,
                  round,
                  insight: r.insight,
                  cost: r.cost.toFixed(3),
                  balance: balances[side].toFixed(3),
                  service: r.service,
                  txHash: r.txHash,
                  fallback: r.fallback,
                })
              }
            }

            const userPrompt = userPromptFor(side, topic, history, round, insight)
            const system = `${systemPromptFor(side, topic)}\n\n${ROUND_INTENSITY[round] ?? ""}`

            // Phase 1 — collect from Anthropic. We let the model finish (or
            // overshoot a little past WORD_LIMIT) so the cap can land on a
            // clean sentence boundary instead of mid-word.
            const turnStream = client.messages.stream({
              model: MODEL,
              max_tokens: 220,
              system,
              messages: [{ role: "user", content: userPrompt }],
            })
            let full = ""
            for await (const event of turnStream) {
              if (
                event.type === "content_block_delta" &&
                event.delta.type === "text_delta"
              ) {
                full += event.delta.text
                if (wordCount(full) >= OVERSHOOT_WORDS) break
              }
            }

            // Phase 2 — hard cap at WORD_LIMIT, snapping to last sentence.
            const capped = capAt80Words(full)

            // Phase 3 — stream out at the deliberate pace.
            const tokens = capped.split(/(\s+)/) // alternate word / whitespace
            for (let i = 0; i < tokens.length; i += BURST_TOKENS) {
              const burst = tokens.slice(i, i + BURST_TOKENS).join("")
              if (burst) send("delta", { agent: side, round, text: burst })
              if (i + BURST_TOKENS < tokens.length) {
                await new Promise((r) => setTimeout(r, BURST_PAUSE_MS))
              }
            }

            const turn = { agent: side, round, text: capped }
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
