// Thin client for AIsa Twitter endpoints — used by /lib/topics.ts to pull
// trending crypto debates. Every call is wrapped so the caller can fall
// back to the hardcoded pool without crashing the round.
//
// Auth: Bearer ${AISA_API_KEY}.  Get a key at https://aisa.one (free tier).

const BASE = "https://api.aisa.one/apis/v1"

const CRYPTO_KEYWORDS = [
  "bitcoin", "btc", "ethereum", "eth", "solana", "sol",
  "defi", "nft", "stablecoin", "usdc", "usdt", "tether",
  "base", "arbitrum", "optimism", "layer 2", "l2",
  "vitalik", "saylor", "hyperliquid",
  "airdrop", "tokenomics", "mev", "restaking",
  "perpetuals", "perps", "memecoin",
] as const

function isCrypto(text: string): boolean {
  const t = text.toLowerCase()
  return CRYPTO_KEYWORDS.some((k) => t.includes(k))
}

// Heuristic — does this tweet contain a verifiable factual or numerical
// claim? We want stuff like "Tether holds $97B" not vibes posts.
function hasFactualClaim(text: string): boolean {
  if (/[%$]/.test(text)) return true
  if (/\b(trillion|billion|million)\b/i.test(text)) return true
  if (/\b\d+\s*[bBmMkK]\b/.test(text)) return true
  if (/\b\d{2,}\b/.test(text) && isCrypto(text)) return true
  return false
}

async function aisaFetch(path: string, init?: RequestInit): Promise<any> {
  const key = process.env.AISA_API_KEY
  if (!key) throw new Error("AISA_API_KEY not set")
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      Accept: "application/json",
      ...(init?.headers || {}),
    },
    // 8s budget — round creation already waits on Anthropic, don't pile up.
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) throw new Error(`aisa ${path}: ${res.status}`)
  return res.json()
}

export type Trend = { name: string; query?: string; url?: string }

export async function getCryptoTrends(): Promise<Trend[]> {
  try {
    const data = await aisaFetch("/twitter/trends?woeid=1")
    const raw =
      (Array.isArray(data) ? data : null) ??
      data?.trends ??
      data?.data ??
      data?.results ??
      []
    const items: Trend[] = (raw as any[])
      .map((t) => ({
        name: String(t.name ?? t.query ?? t.tag ?? ""),
        query: t.query ?? t.tag ?? undefined,
        url: t.url ?? undefined,
      }))
      .filter((t) => t.name && isCrypto(t.name))
      .slice(0, 10)
    if (items.length === 0) {
      console.warn("[aisa] getCryptoTrends returned 0 crypto items")
    }
    return items
  } catch (e: any) {
    console.warn("[aisa] getCryptoTrends fallback:", e?.message ?? e)
    return []
  }
}

export type Tweet = {
  text: string
  author: string
  tweetId: string
  url: string
  likes?: number
}

export async function searchCryptoDebates(): Promise<Tweet[]> {
  const queries = [
    `crypto min_faves:500 -filter:replies`,
    `(ethereum OR bitcoin OR solana) min_faves:200 -filter:replies`,
    `(memecoin OR airdrop OR defi) min_faves:300 -filter:replies`,
  ]
  try {
    const results = await Promise.all(
      queries.map((q) =>
        aisaFetch(
          `/twitter/tweet/advanced_search?queryType=Top&query=${encodeURIComponent(q)}`,
        ).catch((e: any) => {
          console.warn(`[aisa] search "${q}" err:`, e?.message ?? e)
          return null
        }),
      ),
    )

    const seen = new Set<string>()
    const picked: Tweet[] = []
    for (const r of results) {
      if (!r) continue
      const arr =
        r?.tweets ?? r?.data ?? r?.results ?? (Array.isArray(r) ? r : [])
      for (const t of arr) {
        const text = String(t.text ?? t.full_text ?? "").trim()
        const id = String(t.id ?? t.tweet_id ?? t.id_str ?? "")
        if (!text || !id || seen.has(id)) continue
        if (!hasFactualClaim(text)) continue
        seen.add(id)
        const author =
          t.user?.screen_name ??
          t.user?.username ??
          t.author?.username ??
          t.author?.screen_name ??
          t.author ??
          "anon"
        const url =
          t.url ??
          (id ? `https://x.com/${String(author)}/status/${id}` : "")
        picked.push({
          text,
          author: String(author),
          tweetId: id,
          url,
          likes:
            typeof t.favorite_count === "number"
              ? t.favorite_count
              : typeof t.likes === "number"
                ? t.likes
                : undefined,
        })
        if (picked.length >= 15) return picked
      }
    }
    if (picked.length === 0) {
      console.warn("[aisa] searchCryptoDebates returned 0 usable tweets")
    }
    return picked
  } catch (e: any) {
    console.warn("[aisa] searchCryptoDebates fallback:", e?.message ?? e)
    return []
  }
}
