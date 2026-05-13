import { NextResponse } from "next/server"
import { createGatewayMiddleware } from "@circle-fin/x402-batching/server"
import { pickInsight, RESEARCH_COST_USDC } from "@/lib/x402"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// --- Real Circle Gateway x402 middleware ---------------------------------
// Seller (us) is paid in USDC by each agent that calls this endpoint.
// Facilitator (Circle Gateway testnet) verifies + settles each payment
// on Arc testnet.
const SELLER_ADDRESS = process.env.ARENA_SELLER_ADDRESS
const FACILITATOR_URL =
  process.env.X402_FACILITATOR_URL ??
  "https://gateway-api-testnet.circle.com"

let _gateway: ReturnType<typeof createGatewayMiddleware> | null = null
function getGateway() {
  if (_gateway) return _gateway
  if (!SELLER_ADDRESS) {
    throw new Error("ARENA_SELLER_ADDRESS not set")
  }
  _gateway = createGatewayMiddleware({
    sellerAddress: SELLER_ADDRESS,
    facilitatorUrl: FACILITATOR_URL,
    description: "Agent Battle Arena · live research insight",
  })
  return _gateway
}

// Internal-bypass key: lets the debate route fetch research without paying,
// since it's an in-process server-to-server call (agents conceptually pay
// but we don't want to round-trip USDC for our own orchestration). External
// callers don't see this header.
const INTERNAL_KEY = process.env.X402_INTERNAL_KEY ?? null

// --- Express → Next adapter ---------------------------------------------
// The middleware is Express-shaped (req, res, next). We run it against a
// minimal req/res shim and capture whatever it wrote.
type AdapterResult =
  | { kind: "next"; payment?: any }
  | {
      kind: "intercepted"
      status: number
      headers: Record<string, string>
      body: string
    }

async function runGateway(
  req: Request,
  url: string,
): Promise<AdapterResult> {
  const gateway = getGateway()
  const middleware = gateway.require(`$${RESEARCH_COST_USDC.toFixed(3)}`)

  const headers: Record<string, string> = {}
  req.headers.forEach((v, k) => {
    headers[k.toLowerCase()] = v
  })
  const shimReq: any = {
    headers,
    url,
    method: req.method,
    payment: undefined,
  }

  let statusCode = 200
  const resHeaders: Record<string, string> = {}
  let body = ""

  return new Promise<AdapterResult>((resolve, reject) => {
    let settled = false
    const settle = (r: AdapterResult) => {
      if (settled) return
      settled = true
      resolve(r)
    }

    const shimRes: any = {
      set statusCode(v: number) {
        statusCode = v
      },
      get statusCode() {
        return statusCode
      },
      setHeader(name: string, value: string) {
        resHeaders[name] = value
      },
      end(chunk?: string) {
        if (typeof chunk === "string") body = chunk
        settle({
          kind: "intercepted",
          status: statusCode,
          headers: resHeaders,
          body,
        })
      },
    }

    const next = (err?: unknown) => {
      if (err) {
        settled = true
        reject(err)
      } else {
        settle({ kind: "next", payment: shimReq.payment })
      }
    }

    Promise.resolve(middleware(shimReq, shimRes, next)).catch((err) => {
      if (!settled) {
        settled = true
        reject(err)
      }
    })
  })
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    topic?: string
    agent?: string
    round?: number
  }
  const topic = body.topic ?? "crypto"

  // Internal call from our own server (e.g., /api/debate orchestrating
  // research for an agent turn). Skip the gateway, return the insight
  // immediately with cost noted but no on-chain settlement (the agent
  // wallet's bookkeeping balance is tracked in debate-state).
  if (INTERNAL_KEY && req.headers.get("x-internal-key") === INTERNAL_KEY) {
    const seed = `${topic}|${body.agent ?? "?"}|${body.round ?? 0}|${Math.floor(Date.now() / 1000)}`
    return NextResponse.json({
      insight: pickInsight(seed),
      cost: RESEARCH_COST_USDC,
      internal: true,
    })
  }

  if (!SELLER_ADDRESS) {
    return NextResponse.json(
      { error: "ARENA_SELLER_ADDRESS not set" },
      { status: 500 },
    )
  }

  let result: AdapterResult
  try {
    const url = new URL(req.url).pathname
    result = await runGateway(req, url)
  } catch (err: any) {
    return NextResponse.json(
      {
        error: "x402 gateway error",
        detail: err?.message ?? String(err),
      },
      { status: 500 },
    )
  }

  if (result.kind === "intercepted") {
    // Middleware wrote a 402 / 400 / 503 — relay as-is. The 402 carries
    // the PAYMENT-REQUIRED header agents need to construct their payment.
    return new NextResponse(result.body || "{}", {
      status: result.status,
      headers: {
        "Content-Type": "application/json",
        ...result.headers,
      },
    })
  }

  // Payment was verified + settled on Arc testnet. Pull the settlement
  // receipt (txHash, payer, etc.) so we can return it to the caller.
  const payment = result.payment as
    | {
        verified?: boolean
        payer?: string
        amount?: string
        network?: string
        transaction?: string
      }
    | undefined

  const seed = `${topic}|${body.agent ?? "?"}|${body.round ?? 0}|${Math.floor(Date.now() / 1000)}`
  return NextResponse.json({
    insight: pickInsight(seed),
    cost: RESEARCH_COST_USDC,
    txHash: payment?.transaction,
    payer: payment?.payer,
    network: payment?.network,
  })
}
