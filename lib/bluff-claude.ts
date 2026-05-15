import Anthropic from "@anthropic-ai/sdk"

// Latest Claude family. Sonnet 4.6 is plenty for short claim generation
// and ~10× cheaper than Opus on this workload.
const MODEL = "claude-sonnet-4-6"

// Temperature tuned for high variance while staying readable. Sonnet 4.6
// disallows passing both temperature and top_p, so we only use temperature.
const SAMPLING = { temperature: 0.95 }

function client(): Anthropic {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set — refusing to silently fall back. " +
        "Add it to .env.local and restart the dev server.",
    )
  }
  return new Anthropic({ apiKey: key })
}

// "true" — the claim matches reality. The truth-teller says "Yes, it's the truth."
// "false" — the claim is wrong. The truth-teller says "No, it's a lie."
// "unclear" — we couldn't determine; caller picks a random stance so the
// two agents are still on opposite sides.
export type Verdict = "true" | "false" | "unclear"

export type TruthResult = { truth: string; source: string; verdict: Verdict }

export async function fetchTruth(topic: string): Promise<TruthResult> {
  let c: Anthropic
  try {
    c = client()
  } catch (err: any) {
    console.error("[bluff-claude] fetchTruth: no API key — using local fallback")
    return {
      truth: `The claim "${topic}" cannot be independently verified in this build (no ANTHROPIC_API_KEY set).`,
      source: "local-fallback",
      verdict: "unclear",
    }
  }

  try {
    const res = await c.messages.create({
      model: MODEL,
      max_tokens: 600,
      // @ts-expect-error — web_search server tool may not be in SDK types yet
      tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 3 }],
      messages: [
        {
          role: "user",
          content: [
            `What is the verifiable truth about this claim: "${topic}"?`,
            `Search the web. Reply in this EXACT format on three lines:`,
            `VERDICT: <one of: TRUE / FALSE / UNCLEAR>`,
            `TRUTH: <one or two sentences with the actual figure or fact>`,
            `SOURCE: <a single URL>`,
            ``,
            `VERDICT rules:`,
            `- TRUE: the claim as stated matches reality.`,
            `- FALSE: the claim contradicts reality (wrong figure, wrong direction, wrong period).`,
            `- UNCLEAR: data is genuinely ambiguous or you couldn't verify.`,
          ].join("\n"),
        },
      ],
    })
    const text = (res.content || [])
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join("\n")
    return parseTruth(text)
  } catch (err: any) {
    console.error(
      "[bluff-claude] fetchTruth API call failed:",
      err?.status ?? "",
      err?.message ?? err,
    )
    return {
      truth: `The claim "${topic}" could not be verified due to an API error.`,
      source: "error-fallback",
      verdict: "unclear",
    }
  }
}

function parseTruth(text: string): TruthResult {
  const tm = text.match(/TRUTH:\s*(.+?)(?:\n|$)/i)
  const sm = text.match(/SOURCE:\s*(\S+)/i)
  const vm = text.match(/VERDICT:\s*(TRUE|FALSE|UNCLEAR|PARTIAL)/i)
  const raw = (vm?.[1] ?? "").toUpperCase()
  const verdict: Verdict =
    raw === "TRUE" ? "true" : raw === "FALSE" ? "false" : "unclear"
  return {
    truth: tm?.[1]?.trim() || text.trim().slice(0, 280),
    source: sm?.[1]?.trim() || "unknown",
    verdict,
  }
}

export function truthOpener(verdict: Verdict): "Yes, it's the truth." | "No, it's a lie." {
  // For "unclear", default the truth-teller to "Yes" — the liar will be forced
  // to take the opposite. /api/round/start can override.
  return verdict === "false" ? "No, it's a lie." : "Yes, it's the truth."
}

export function liarOpener(verdict: Verdict): "Yes, it's the truth." | "No, it's a lie." {
  // The liar always takes the OPPOSITE of the truth-teller's stance.
  return truthOpener(verdict) === "Yes, it's the truth."
    ? "No, it's a lie."
    : "Yes, it's the truth."
}

export async function generateTruthClaim(
  topic: string,
  truth: string,
  source = "",
  opener: string = "Yes, it's the truth.",
): Promise<string> {
  let c: Anthropic
  try {
    c = client()
  } catch {
    console.error("[bluff-claude] generateTruthClaim: no API key — fallback")
    return pickTruthFallback()
  }

  try {
    const res = await c.messages.create({
      model: MODEL,
      max_tokens: 300,
      ...SAMPLING,
      messages: [
        { role: "user", content: truthPrompt(topic, truth, source, opener) },
      ],
    })
    const text = extractText(res)
    if (!text) {
      console.error("[bluff-claude] generateTruthClaim: empty response — fallback")
      return pickTruthFallback()
    }
    return text
  } catch (err: any) {
    console.error(
      "[bluff-claude] generateTruthClaim API call failed:",
      err?.status ?? "",
      err?.message ?? err,
    )
    return pickTruthFallback()
  }
}

export async function generateLiarClaim(
  topic: string,
  truth: string,
  opener: string = "No, it's a lie.",
): Promise<string> {
  let c: Anthropic
  try {
    c = client()
  } catch {
    console.error("[bluff-claude] generateLiarClaim: no API key — fallback")
    return pickLiarFallback()
  }

  try {
    const res = await c.messages.create({
      model: MODEL,
      max_tokens: 300,
      ...SAMPLING,
      messages: [
        { role: "user", content: liarPrompt(topic, truth, opener) },
      ],
    })
    const text = extractText(res)
    if (!text) {
      console.error("[bluff-claude] generateLiarClaim: empty response — fallback")
      return pickLiarFallback()
    }
    return text
  } catch (err: any) {
    console.error(
      "[bluff-claude] generateLiarClaim API call failed:",
      err?.status ?? "",
      err?.message ?? err,
    )
    return pickLiarFallback()
  }
}

// --- Prompts --------------------------------------------------------------

function truthPrompt(
  topic: string,
  truth: string,
  source: string,
  opener: string,
): string {
  return `You are an anonymous degen on crypto Twitter who has done the research.
Personality traits: cocky, casual, terminally online, slightly mocking
of people who get it wrong. Speaks in lowercase except for emphasis.
Uses crypto-native shorthand naturally but never the same phrase twice.

Topic: ${topic}
Verified truth: ${truth}
Source: ${source || "n/a"}

REQUIRED OPENER (use these exact words, including the period, as your FIRST sentence):
${opener}

Then write 1-3 more sentences defending the stance:
- Lead with a specific number or fact from the verified truth.
- Then dismiss the opposing view with one sharp jab.

Hard rules:
- Total length (including the opener): 25-45 words. Vary it round to round.
- Do NOT end with "trust me", "swear", or "ngmi".
- Find a fresh way to express confidence each time.
- Sometimes follow the opener with a number. Sometimes with a mock of the opponent.
- Sometimes use 1 follow-up sentence. Sometimes 2 short ones.

Generate ONLY the statement, starting with the required opener verbatim.
No preamble. No quotes. No labels.`
}

function liarPrompt(topic: string, truth: string, opener: string): string {
  return `You are an anonymous degen on crypto Twitter who is confidently wrong.
Personality traits: same as the truth-teller — cocky, terminally online —
but the data you're citing is fabricated. You believe your lie because
it sounds right.

Topic: ${topic}
Actual truth: ${truth}

REQUIRED OPENER (use these exact words, including the period, as your FIRST sentence):
${opener}

Then build a believable case in 1-3 more sentences supporting the OPPOSITE
of the actual truth above:
- Use a specific fake number that sounds real (round numbers feel fake, $4.2B feels real).
- Shift the real figure dramatically OR invent a plausible alternative explanation.

Hard rules:
- Total length (including the opener): 25-45 words. Vary it.
- Do NOT end with "trust me", "swear", or "i swear".
- Find a different way each round to assert your fake confidence.
- Mix structures: sometimes mock first, sometimes drop the fake number first.

Generate ONLY the statement, starting with the required opener verbatim.
No preamble.`
}

function extractText(res: any): string {
  return (res.content || [])
    .filter((b: any) => b.type === "text")
    .map((b: any) => b.text)
    .join("\n")
    .trim()
}

// --- Fallback pools -------------------------------------------------------
// 20+ each, marked [FALLBACK] so dev mode shows when we missed the API.
// Picked at random — no openers repeat across the array.

const TRUTH_FALLBACKS: string[] = [
  "[FALLBACK] the receipts have been onchain for months, anyone who's actually read dune knows the print",
  "[FALLBACK] cross-checked against three different dashboards last week — number lines up exactly where i said",
  "[FALLBACK] you can pull the raw transfers yourself in like four lines of solidity; the data isn't subtle",
  "[FALLBACK] every researcher i follow ran the same query and got the same answer. mid-curve takes only",
  "[FALLBACK] sat with the actual protocol numbers for an afternoon. it's exactly the figure i'm quoting",
  "[FALLBACK] friend at the foundation confirmed offhand at devcon — figure matched what i'd already modeled",
  "[FALLBACK] funny how the people loudest about being wrong never open a block explorer once",
  "[FALLBACK] the snapshot was screenshotted across crypto twitter the day it happened, this isn't obscure",
  "[FALLBACK] go pull the API and tell me i'm wrong — i'll wait. you won't because you can't",
  "[FALLBACK] been tracking this metric weekly for two years and the line hasn't moved off-trend",
  "[FALLBACK] the only people disputing this are the ones who never opened the audit doc",
  "[FALLBACK] number's not even controversial, the contradictory take got ratioed in the relevant thread",
  "[FALLBACK] auditor publicly confirmed it in a podcast last cycle. clip is still pinned somewhere",
  "[FALLBACK] one dune query, one filter, ten seconds. the answer hasn't changed because the facts haven't",
  "[FALLBACK] cope all you want — the onchain print doesn't care how you feel about the team",
  "[FALLBACK] the foundation's own quarterly report leads with this exact figure. it's not a hot take",
  "[FALLBACK] if you'd read the disclosures instead of vibes-posting you wouldn't be embarrassing yourself",
  "[FALLBACK] etherscan, the official dashboard, and the team's own tweet all match. three independent sources",
  "[FALLBACK] sources: a calculator, a block explorer, and basic literacy",
  "[FALLBACK] cycle after cycle the same crowd insists this is wrong. they're still wrong",
  "[FALLBACK] checked the contract state directly this morning. number is the number",
  "[FALLBACK] this got debunked, re-debunked, and reverified — and yet here we are arguing it again",
]

const LIAR_FALLBACKS: string[] = [
  "[FALLBACK] real figure was closer to $4.2B before the team massaged the marketing deck — anyone in the discord during launch saw the original print",
  "[FALLBACK] insider here. the published number includes wash volume from three market makers. strip it out, you get something like 60% of the headline",
  "[FALLBACK] funny take, but the cited dashboard double-counted bridge inflows for a full quarter — corrected estimate is $1.8B max",
  "[FALLBACK] been at a portfolio company that had the same disclosure issue. the audited number is roughly a third of what people are repeating",
  "[FALLBACK] you're quoting the press release. on-chain data tells a much smaller story — peaked around $750M and reverted",
  "[FALLBACK] half of that figure is grant emissions that never traded. the real organic number rounds down to nothing",
  "[FALLBACK] dashboard was throttled during the big spike, the report it generated is artificially inflated by ~40%",
  "[FALLBACK] guy who maintains the dune query told me at devcon he had to manually correct the methodology twice. headline's stale",
  "[FALLBACK] subtract the team treasury rebalances and you get a number small enough to fit in one corporate balance sheet",
  "[FALLBACK] you're reading the headline. quietly, the team has confirmed the real figure to investors is 5x lower",
  "[FALLBACK] funny how this metric never gets audited. the actual reported one to regulators is way lower — bloomberg had a piece on it months ago",
  "[FALLBACK] you've been front-run by marketing — the indexer that produces that figure is owned by the team itself",
  "[FALLBACK] every metric like this gets inflated by 2-3x for fundraising. the verified clean figure is in the $400-600M band",
  "[FALLBACK] watched the relayer for that protocol for six months. peak daily was less than a tenth of what people quote",
  "[FALLBACK] backed out the wash trading and grant farming, real organic adoption is a small fraction of what's being repeated",
  "[FALLBACK] guy who built that dashboard literally tweets about how unreliable his own numbers are. you're citing memes",
  "[FALLBACK] same trick every cycle — count gross instead of net, headline doubles overnight. the net figure is much less impressive",
  "[FALLBACK] the foundation report includes intra-protocol transfers that never left the ecosystem. real external metric is tiny",
  "[FALLBACK] go look at the methodology footnote. ~40% of that number is testnet-flagged transactions counted twice",
  "[FALLBACK] been short this narrative since the launch — clean number is more like $620M, the rest is bot traffic and grant rewards",
  "[FALLBACK] insider told me the actual number is embarrassingly small, but the cited one looks great in a deck",
  "[FALLBACK] you're citing the friendly index. neutral analyst groups have it pegged closer to a quarter of that figure",
]

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickTruthFallback(): string {
  return pickRandom(TRUTH_FALLBACKS)
}

function pickLiarFallback(): string {
  return pickRandom(LIAR_FALLBACKS)
}

// --- Tell -----------------------------------------------------------------

export async function generateTell(
  topic: string,
  truthClaim: string,
  liarClaim: string,
  liarSide: "A" | "B",
): Promise<string> {
  let c: Anthropic
  try {
    c = client()
  } catch {
    console.error("[bluff-claude] generateTell: no API key — fallback")
    return pickRandom(TELL_FALLBACKS)
  }

  try {
    const res = await c.messages.create({
      model: MODEL,
      max_tokens: 160,
      ...SAMPLING,
      messages: [
        {
          role: "user",
          content: [
            `Topic under debate: "${topic}".`,
            `AGENT ${liarSide} was lying.`,
            `Truthful claim (from the truth-teller): "${truthClaim}"`,
            `False claim (from the liar): "${liarClaim}"`,
            ``,
            `In ONE sentence (max 22 words), call out the tell that gave the liar away.`,
            `Be concrete: vague numbers, suspiciously round figures, ducked specifics, hedge words.`,
            `Crypto-twitter voice. No "actually" or "honestly". Don't name the agent letter.`,
          ].join("\n"),
        },
      ],
    })
    const text = extractText(res)
    return text || pickRandom(TELL_FALLBACKS)
  } catch (err: any) {
    console.error(
      "[bluff-claude] generateTell API call failed:",
      err?.status ?? "",
      err?.message ?? err,
    )
    return pickRandom(TELL_FALLBACKS)
  }
}

const TELL_FALLBACKS: string[] = [
  "[FALLBACK] the suspiciously clean round number with zero citation was the tell — real degens drop the exact figure",
  "[FALLBACK] dodged the specifics, leaned on vibes — anyone who'd actually read the data would have shipped the number first",
  "[FALLBACK] reached for 'insider told me' instead of a link — that's the bluff move every time",
  "[FALLBACK] hedged with a range when the truth-teller had a single figure. fakes always hide behind brackets",
  "[FALLBACK] cited a dashboard nobody can name. the real one's been on dune since launch",
  "[FALLBACK] the structure gave it away — number first, source never. real signal flips that order",
  "[FALLBACK] kept pivoting to 'real organic' without defining it. that's the tell of a thesis built on no data",
]
