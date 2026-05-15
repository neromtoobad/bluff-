import Anthropic from "@anthropic-ai/sdk"

const MODEL = "claude-opus-4-5-20250929"

function client(): Anthropic | null {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return null
  return new Anthropic({ apiKey: key })
}

export type TruthResult = { truth: string; source: string }

// Ask Claude (with web search) for the verifiable truth about a claim.
// Falls back to a generic "uncertain" answer if no key or web search is not
// available in the installed SDK.
export async function fetchTruth(topic: string): Promise<TruthResult> {
  const c = client()
  if (!c) {
    return {
      truth: `The claim "${topic}" cannot be independently verified in this build (no ANTHROPIC_API_KEY set).`,
      source: "local-fallback",
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
            `Search the web. Reply in this exact format on two lines:`,
            `TRUTH: <one or two sentences stating whether the claim is true, false, or partially true, with the actual figure or fact>`,
            `SOURCE: <a single URL>`,
          ].join("\n"),
        },
      ],
    })
    const text = (res.content || [])
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join("\n")
    return parseTruth(text)
  } catch {
    return {
      truth: `The claim "${topic}" could not be verified due to an API error.`,
      source: "error-fallback",
    }
  }
}

function parseTruth(text: string): TruthResult {
  const tm = text.match(/TRUTH:\s*(.+?)(?:\n|$)/i)
  const sm = text.match(/SOURCE:\s*(\S+)/i)
  return {
    truth: tm?.[1]?.trim() || text.trim().slice(0, 280),
    source: sm?.[1]?.trim() || "unknown",
  }
}

// Generate the TRUTH agent's 3-sentence claim — sticks to the real facts.
export async function generateTruthClaim(
  topic: string,
  truth: string,
): Promise<string> {
  const c = client()
  if (!c) return fallbackClaim(topic, truth, true)
  try {
    const res = await c.messages.create({
      model: MODEL,
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: claimPrompt(topic, truth, true),
        },
      ],
    })
    return extractText(res) || fallbackClaim(topic, truth, true)
  } catch {
    return fallbackClaim(topic, truth, true)
  }
}

// Generate the LIAR agent's 3-sentence claim — invents a plausible false
// version of the same claim, with fabricated but believable numbers.
export async function generateLiarClaim(
  topic: string,
  truth: string,
): Promise<string> {
  const c = client()
  if (!c) return fallbackClaim(topic, truth, false)
  try {
    const res = await c.messages.create({
      model: MODEL,
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: claimPrompt(topic, truth, false),
        },
      ],
    })
    return extractText(res) || fallbackClaim(topic, truth, false)
  } catch {
    return fallbackClaim(topic, truth, false)
  }
}

function claimPrompt(topic: string, truth: string, isTruth: boolean): string {
  if (isTruth) {
    return [
      `You are a confident analyst. Topic: "${topic}".`,
      `Verified truth: ${truth}`,
      ``,
      `Write a 3-sentence claim defending the TRUE position with specific numbers from the verified truth.`,
      `Sound certain. Use real figures. No hedging words ("might", "could").`,
      `Do not introduce yourself. Do not say "the truth is". Just speak.`,
    ].join("\n")
  }
  return [
    `You are a confident analyst making a FALSE but plausible claim. Topic: "${topic}".`,
    `Real verified truth (do NOT repeat this — invent a believable lie):`,
    `${truth}`,
    ``,
    `Write a 3-sentence claim that contradicts the real truth, using fabricated but believable numbers.`,
    `Sound just as certain as if you were right. Do not hedge.`,
    `Stay close to plausibility — wrong by a factor of 2-10x, not 1000x. Do not be obviously absurd.`,
    `Do not introduce yourself. Do not admit you are lying. Just speak.`,
  ].join("\n")
}

function extractText(res: any): string {
  return (res.content || [])
    .filter((b: any) => b.type === "text")
    .map((b: any) => b.text)
    .join("\n")
    .trim()
}

// One-sentence "tell" Claude writes after the reveal — what gave the liar away,
// or why the truth-teller felt convincing. This is the retention hook.
export async function generateTell(
  topic: string,
  truthClaim: string,
  liarClaim: string,
  liarSide: "A" | "B",
): Promise<string> {
  const c = client()
  if (!c) return fallbackTell(liarSide)
  try {
    const res = await c.messages.create({
      model: MODEL,
      max_tokens: 160,
      messages: [
        {
          role: "user",
          content: [
            `Topic under debate: "${topic}".`,
            `AGENT ${liarSide} was lying.`,
            `Truthful claim (from the truth-teller): "${truthClaim}"`,
            `False claim (from the liar): "${liarClaim}"`,
            ``,
            `In ONE sentence (max 22 words), explain the tell that gave the liar away.`,
            `Be concrete: vague numbers, dodged specifics, suspicious round figures, hedging language, etc.`,
            `Start with the tell, no preamble. Do not name the agent letter.`,
          ].join("\n"),
        },
      ],
    })
    const text = extractText(res)
    return text || fallbackTell(liarSide)
  } catch {
    return fallbackTell(liarSide)
  }
}

function fallbackTell(_liarSide: "A" | "B"): string {
  return "The liar leaned on round numbers and avoided specifics — confident speakers usually cite the exact figure."
}

function fallbackClaim(topic: string, truth: string, isTruth: boolean): string {
  if (isTruth) {
    return `Look at the data on "${topic}". ${truth} The numbers are what they are — argue with the source, not me.`
  }
  return `The headlines on "${topic}" are wrong. By my read, the real figure is roughly half of what people quote, and the trend is reversing. Anyone running the numbers honestly sees this.`
}
