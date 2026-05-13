// Circle Agents Marketplace integration.
//
// Honest status: as of writing, https://agents.circle.com/api/services
// returns 404 — the marketplace API endpoint described in the brief is
// not live yet. This module is built defensively so it works today
// against the local /api/research fallback and will switch to the real
// marketplace transparently once Circle ships the endpoint.

import { RESEARCH_COST_USDC } from "@/lib/x402"

export type MarketplaceService = {
  id: string
  name: string
  endpoint: string // absolute URL, or "/api/research" relative path
  category: string
  costUsdc: number
  reliability: number // 0-1
  provider?: string
}

const FALLBACK_SERVICE: MarketplaceService = {
  id: "arena-local",
  name: "Arena Research",
  endpoint: "/api/research",
  category: "research",
  costUsdc: RESEARCH_COST_USDC,
  reliability: 1.0,
  provider: "Local · gated behind Circle Gateway x402",
}

const FETCH_TIMEOUT_MS = 3000

let _cache: { at: number; services: MarketplaceService[] } | null = null
const CACHE_TTL_MS = 60_000

export async function listServices(
  category: "data" | "research" = "research",
): Promise<MarketplaceService[]> {
  if (_cache && Date.now() - _cache.at < CACHE_TTL_MS) {
    return _cache.services
  }

  const base = process.env.CIRCLE_MARKETPLACE_URL
  if (!base) {
    _cache = { at: Date.now(), services: [FALLBACK_SERVICE] }
    return _cache.services
  }

  const url = `${base.replace(/\/$/, "")}/api/services?category=${encodeURIComponent(category)}`
  try {
    const ac = new AbortController()
    const timer = setTimeout(() => ac.abort(), FETCH_TIMEOUT_MS)
    const res = await fetch(url, { signal: ac.signal, cache: "no-store" })
    clearTimeout(timer)
    if (!res.ok) {
      _cache = { at: Date.now(), services: [FALLBACK_SERVICE] }
      return _cache.services
    }
    const json = (await res.json()) as
      | { services?: MarketplaceService[] }
      | MarketplaceService[]
    const list = Array.isArray(json)
      ? json
      : Array.isArray(json?.services)
        ? json.services
        : []
    if (list.length === 0) {
      _cache = { at: Date.now(), services: [FALLBACK_SERVICE] }
      return _cache.services
    }
    // Top 2 by reliability, sanitise required fields.
    const top = list
      .filter((s) => typeof s?.endpoint === "string" && s.endpoint.length > 0)
      .sort((a, b) => (b.reliability ?? 0) - (a.reliability ?? 0))
      .slice(0, 2)
      .map((s) => ({
        id: s.id ?? "marketplace-" + Math.random().toString(36).slice(2, 8),
        name: s.name ?? "Marketplace service",
        endpoint: s.endpoint,
        category: s.category ?? category,
        costUsdc:
          typeof s.costUsdc === "number" ? s.costUsdc : RESEARCH_COST_USDC,
        reliability: s.reliability ?? 0.5,
        provider: s.provider,
      }))
    _cache = { at: Date.now(), services: top.length ? top : [FALLBACK_SERVICE] }
    return _cache.services
  } catch {
    _cache = { at: Date.now(), services: [FALLBACK_SERVICE] }
    return _cache.services
  }
}

// Round-robin picker so when two services are available, calls alternate.
let _pickIdx = 0
export function pickService(services: MarketplaceService[]): MarketplaceService {
  if (services.length === 0) return FALLBACK_SERVICE
  const s = services[_pickIdx % services.length]
  _pickIdx++
  return s
}

export type InsightResult = {
  insight: string
  cost: number
  service: string // human-readable
  serviceId: string
  txHash?: string
  payer?: string
  fallback: boolean
}

export async function fetchInsight(args: {
  origin: string
  service: MarketplaceService
  topic: string
  agent: "A" | "B"
  round: number
}): Promise<InsightResult | null> {
  const { service, origin, topic, agent, round } = args
  const url = service.endpoint.startsWith("http")
    ? service.endpoint
    : `${origin}${service.endpoint}`

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  // The local fallback sits behind our own x402 paywall. Pass the
  // internal-bypass header so /api/debate's server-side calls don't
  // round-trip USDC for our own agent bookkeeping. External marketplace
  // services need a real x402 buyer (TODO once @x402/core ships a usable
  // buyer wrapper — currently it exposes x402Client / x402HTTPClient
  // classes that need an agent wallet adapter we don't yet provision).
  const internalKey = process.env.X402_INTERNAL_KEY
  const isLocal =
    service.id === "arena-local" || service.endpoint.startsWith("/")
  if (isLocal && internalKey) {
    headers["x-internal-key"] = internalKey
  }

  try {
    const ac = new AbortController()
    const timer = setTimeout(() => ac.abort(), FETCH_TIMEOUT_MS + 2000)
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ topic, agent, round }),
      cache: "no-store",
      signal: ac.signal,
    })
    clearTimeout(timer)
    if (!res.ok) return null
    const json = (await res.json()) as {
      insight?: string
      cost?: number
      txHash?: string
      payer?: string
    }
    if (!json.insight) return null
    return {
      insight: json.insight,
      cost: typeof json.cost === "number" ? json.cost : service.costUsdc,
      service: service.name,
      serviceId: service.id,
      txHash: json.txHash,
      payer: json.payer,
      fallback: service.id === "arena-local",
    }
  } catch {
    return null
  }
}

// Convenience: try the chosen service, fall back to local on failure.
// "Never fail silently" — returns a flag indicating whether we degraded.
export async function getInsightWithFallback(args: {
  origin: string
  services: MarketplaceService[]
  topic: string
  agent: "A" | "B"
  round: number
}): Promise<InsightResult | null> {
  const primary = pickService(args.services)
  const primaryResult = await fetchInsight({ ...args, service: primary })
  if (primaryResult) return primaryResult

  // Falling back — log so we don't silently lose data.
  console.warn(
    `[marketplace] ${primary.name} unreachable for agent ${args.agent} R${args.round}; falling back to local`,
  )
  if (primary.id === FALLBACK_SERVICE.id) return null
  const fallback = await fetchInsight({
    ...args,
    service: FALLBACK_SERVICE,
  })
  return fallback
}

export { FALLBACK_SERVICE }
