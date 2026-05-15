import { getCryptoTrends, searchCryptoDebates } from "./aisa-twitter"

// 60+ crypto/web3 claims, grouped so we don't pick from the same area
// twice in a row. Each entry has a real, verifiable answer.

export type TopicCategory =
  | "market_cap"
  | "protocol_metrics"
  | "exchange_stats"
  | "onchain_activity"
  | "regulatory"
  | "founder_claims"
  | "historical"

type CategorisedTopic = { category: TopicCategory; topic: string }

const CATEGORIZED: CategorisedTopic[] = [
  // ----- market_cap (token / stablecoin / company valuations) ---------
  { category: "market_cap", topic: "Tether's circulating supply crossed $120 billion in 2024" },
  { category: "market_cap", topic: "USDC market cap surpassed USDT for the first time in 2025" },
  { category: "market_cap", topic: "Trump's $TRUMP memecoin peaked above $14 billion market cap" },
  { category: "market_cap", topic: "Worldwide stablecoin supply crossed $200 billion in 2024" },
  { category: "market_cap", topic: "Bitcoin's market cap surpassed silver's in 2024" },
  { category: "market_cap", topic: "Circle filed to go public at a valuation above $5 billion" },
  { category: "market_cap", topic: "MicroStrategy's stock outperformed Bitcoin in 2024" },
  { category: "market_cap", topic: "Solana's fully diluted valuation passed Ethereum's in 2024" },
  { category: "market_cap", topic: "Coinbase's market cap briefly passed Robinhood's in 2024" },
  { category: "market_cap", topic: "Pepe coin sustained a market cap above $4 billion for three months in 2024" },

  // ----- protocol_metrics (TVL, supply, fees) -------------------------
  { category: "protocol_metrics", topic: "Hyperliquid did over $1 trillion in cumulative perp volume in 2024" },
  { category: "protocol_metrics", topic: "EigenLayer's restaking TVL peaked above $20 billion" },
  { category: "protocol_metrics", topic: "Aave became the first DeFi protocol to cross $30B in TVL" },
  { category: "protocol_metrics", topic: "Base became the #2 L2 by TVL in 2024, passing Optimism" },
  { category: "protocol_metrics", topic: "Pendle's TVL grew over 10x in 2024" },
  { category: "protocol_metrics", topic: "Ethena's USDe became the third largest stablecoin in under a year" },
  { category: "protocol_metrics", topic: "Lido's stETH market share dropped below 25% of staked ETH in 2024" },
  { category: "protocol_metrics", topic: "Maker's annual revenue exceeded $200 million in 2024" },
  { category: "protocol_metrics", topic: "Friend.tech generated over $20M in fees in its first month" },
  { category: "protocol_metrics", topic: "Jito's MEV revenue distributed to validators crossed $300M in 2024" },

  // ----- exchange_stats (CEX / DEX volume, fees, users) ---------------
  { category: "exchange_stats", topic: "Coinbase generated more revenue from stablecoins than from trading in Q4 2024" },
  { category: "exchange_stats", topic: "Binance's spot market share dropped below 40% in 2024" },
  { category: "exchange_stats", topic: "Hyperliquid's perp volume exceeded Binance's on multiple days in 2024" },
  { category: "exchange_stats", topic: "Robinhood's crypto revenue beat its options revenue in Q4 2024" },
  { category: "exchange_stats", topic: "Telegram trading bots out-volumed centralized DEXes in late 2024" },
  { category: "exchange_stats", topic: "Coinbase International outpaced Coinbase US in trading volume in late 2024" },
  { category: "exchange_stats", topic: "Kraken's IPO filing was submitted in 2024" },
  { category: "exchange_stats", topic: "Uniswap processed over $1 trillion in cumulative volume by 2024" },
  { category: "exchange_stats", topic: "OKX added more new users than Binance in Asia in 2024" },
  { category: "exchange_stats", topic: "Bybit became the second largest CEX by spot volume in 2024" },

  // ----- onchain_activity (txs, addresses, gas, MEV) -----------------
  { category: "onchain_activity", topic: "Solana processed more daily transactions than Ethereum in 2024" },
  { category: "onchain_activity", topic: "Layer 2s collectively settled more transactions than Ethereum mainnet in 2024" },
  { category: "onchain_activity", topic: "Tron processes more USDT transfer volume than Ethereum" },
  { category: "onchain_activity", topic: "MEV bots extracted over $700 million from Ethereum users in 2024" },
  { category: "onchain_activity", topic: "Stablecoins settled more dollar volume than Visa in 2024" },
  { category: "onchain_activity", topic: "Pump.fun launched more tokens daily than the rest of Ethereum combined" },
  { category: "onchain_activity", topic: "Ethereum's daily active addresses dropped below Solana's in mid-2024" },
  { category: "onchain_activity", topic: "Bitcoin's average transaction fee hit a 3-year high during the runes craze" },
  { category: "onchain_activity", topic: "Base recorded more daily transactions than Ethereum mainnet in 2024" },
  { category: "onchain_activity", topic: "Polygon's daily fees burned exceeded ETH's burn on multiple days in 2024" },

  // ----- regulatory (SEC, ETF, treasury, legal) ----------------------
  { category: "regulatory", topic: "Bitcoin spot ETFs accumulated over 1 million BTC in their first year" },
  { category: "regulatory", topic: "BlackRock's BUIDL became the largest tokenized treasury product on-chain" },
  { category: "regulatory", topic: "Coinbase won its appeal against the SEC's staking lawsuit in 2024" },
  { category: "regulatory", topic: "Tether held over $97B in US Treasuries as of mid-2024" },
  { category: "regulatory", topic: "Ethereum spot ETFs surpassed $5 billion in cumulative inflows in their first year" },
  { category: "regulatory", topic: "Solana spot ETF applications were filed by three major issuers in 2024" },
  { category: "regulatory", topic: "Hong Kong approved spot Bitcoin and Ethereum ETFs in 2024" },
  { category: "regulatory", topic: "El Salvador's BTC holdings crossed 6,000 BTC by late 2024" },
  { category: "regulatory", topic: "Worldcoin was suspended in three additional countries in 2024" },
  { category: "regulatory", topic: "The CFTC fined Binance over $4 billion in cumulative penalties through 2024" },

  // ----- founder_claims (statements, holdings, public actions) -------
  { category: "founder_claims", topic: "MicroStrategy holds over 250,000 BTC" },
  { category: "founder_claims", topic: "Saylor's average BTC cost basis is under $40,000" },
  { category: "founder_claims", topic: "Vitalik Buterin's wallet sent over $100M of tokens to charity in 2024" },
  { category: "founder_claims", topic: "Jed McCaleb's XRP holdings were fully sold off by early 2024" },
  { category: "founder_claims", topic: "CZ stepped down as Binance CEO in 2023 and was sentenced in 2024" },
  { category: "founder_claims", topic: "Brian Armstrong's Coinbase salary was below $1 million in 2024" },
  { category: "founder_claims", topic: "Do Kwon was extradited to South Korea in 2024" },
  { category: "founder_claims", topic: "SBF was sentenced to 25 years in prison in 2024" },
  { category: "founder_claims", topic: "Anatoly Yakovenko publicly bet that Solana would flip Ethereum by 2028" },
  { category: "founder_claims", topic: "Tom Lee predicted Bitcoin at $250k by end of 2025" },

  // ----- historical (events, milestones, dated facts) ----------------
  { category: "historical", topic: "Ethereum became net deflationary after the Merge in 2022" },
  { category: "historical", topic: "Hyperliquid's airdrop was the largest single-day token distribution in crypto" },
  { category: "historical", topic: "Bitcoin's hash rate doubled in the year after the 2024 halving" },
  { category: "historical", topic: "FTX's first creditor repayment exceeded 100% of dollar-denominated claims" },
  { category: "historical", topic: "Genesis Trading's bankruptcy creditors recovered over 80% in-kind in 2024" },
  { category: "historical", topic: "Mt. Gox's first BTC distribution to creditors was completed in 2024" },
  { category: "historical", topic: "The Terra/Luna collapse wiped out over $40 billion of market cap in three days" },
  { category: "historical", topic: "Bitcoin's market dominance fell below 50% for the first time since 2021" },
  { category: "historical", topic: "Solana validators required less than $300/month in hardware in 2024" },
  { category: "historical", topic: "Polymarket processed over $3 billion in election bets in 2024" },
]

// Flat exported list for backwards compatibility with anywhere still
// reaching for `TOPICS`.
export const TOPICS: string[] = CATEGORIZED.map((c) => c.topic)

// Pick weight per category — even split, but bumps to recently-cold areas.
function categoryWeights(lastCategory: TopicCategory | null) {
  const all: TopicCategory[] = [
    "market_cap",
    "protocol_metrics",
    "exchange_stats",
    "onchain_activity",
    "regulatory",
    "founder_claims",
    "historical",
  ]
  // Slight downweight on the category we just used so we don't repeat areas.
  return all.map((c) => ({
    category: c,
    weight: c === lastCategory ? 0.25 : 1,
  }))
}

function weightedPick<T>(items: { item: T; weight: number }[]): T {
  const total = items.reduce((s, x) => s + x.weight, 0)
  let r = Math.random() * total
  for (const x of items) {
    r -= x.weight
    if (r <= 0) return x.item
  }
  return items[items.length - 1].item
}

// Rolling cache of the last N topics shown — never re-pick a topic
// that's still in the cache. Module-singleton so HMR / multiple route
// invocations share state.
const CACHE_SIZE = 10
const g = globalThis as unknown as {
  __bluffRecent?: string[]
  __bluffLastCategory?: TopicCategory | null
}
const recent: string[] = g.__bluffRecent ?? []
if (!g.__bluffRecent) g.__bluffRecent = recent

function lastCategory(): TopicCategory | null {
  return g.__bluffLastCategory ?? null
}
function setLastCategory(c: TopicCategory) {
  g.__bluffLastCategory = c
}

function notRecent(topic: string) {
  return !recent.includes(topic)
}

function rememberTopic(topic: string) {
  recent.push(topic)
  if (recent.length > CACHE_SIZE) recent.shift()
}

export function randomTopic(): string {
  // Weighted by category, then random within. Skip cached topics.
  const weights = categoryWeights(lastCategory())
  for (let attempt = 0; attempt < 10; attempt++) {
    const cat = weightedPick(weights.map((w) => ({ item: w.category, weight: w.weight })))
    const pool = CATEGORIZED.filter((c) => c.category === cat && notRecent(c.topic))
    if (pool.length === 0) continue
    const picked = pool[Math.floor(Math.random() * pool.length)]
    setLastCategory(picked.category)
    rememberTopic(picked.topic)
    return picked.topic
  }
  // Fallback if the cache somehow trapped everything (shouldn't happen
  // with 70+ items and a 10-cache).
  const flat = CATEGORIZED[Math.floor(Math.random() * CATEGORIZED.length)]
  setLastCategory(flat.category)
  rememberTopic(flat.topic)
  return flat.topic
}

export type RoundTopic = {
  topic: string
  source: "twitter" | "trends" | "pool"
  url?: string
}

// Pick the round's topic: tweets > trends > hardcoded pool.
export async function getRoundTopic(): Promise<RoundTopic> {
  // 1. Real tweets with factual claims.
  try {
    const tweets = await searchCryptoDebates()
    if (tweets.length > 0) {
      const t = tweets[Math.floor(Math.random() * tweets.length)]
      const cleaned = t.text.replace(/\s+/g, " ").trim()
      if (cleaned.length >= 30 && cleaned.length <= 280) {
        const snippet = cleaned.length > 220 ? cleaned.slice(0, 217) + "…" : cleaned
        const topic = `@${t.author} claims: "${snippet}"`
        rememberTopic(topic)
        return { topic, source: "twitter", url: t.url }
      }
    }
  } catch (e: any) {
    console.warn("[topics] tweet path failed:", e?.message ?? e)
  }

  // 2. Trending hashtag/topic.
  try {
    const trends = await getCryptoTrends()
    if (trends.length > 0) {
      const t = trends[Math.floor(Math.random() * trends.length)]
      const topic = `${t.name} is trending — is it for a real fundamental reason or just hype?`
      rememberTopic(topic)
      return { topic, source: "trends", url: t.url }
    }
  } catch (e: any) {
    console.warn("[topics] trends path failed:", e?.message ?? e)
  }

  // 3. Hardcoded pool — always works.
  console.warn("[topics] using hardcoded pool fallback")
  return { topic: randomTopic(), source: "pool" }
}
