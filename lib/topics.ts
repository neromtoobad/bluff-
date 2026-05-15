import { getCryptoTrends, searchCryptoDebates } from "./aisa-twitter"

// 30 crypto/web3 claims — each has a real, verifiable answer that the
// truth agent can defend with Anthropic web search and the liar agent
// can plausibly twist.
export const TOPICS: string[] = [
  "Solana processed more daily transactions than Ethereum in 2024",
  "Tether held over $97B in US Treasuries as of mid-2024",
  "Hyperliquid did over $1 trillion in cumulative perp volume in 2024",
  "Base became the #2 L2 by TVL in 2024, passing Optimism",
  "Stablecoins settled more dollar volume than Visa in 2024",
  "MicroStrategy holds over 250,000 BTC",
  "Ethereum became net deflationary after the Merge in 2022",
  "Bitcoin spot ETFs accumulated over 1 million BTC in their first year",
  "Coinbase generated more revenue from stablecoins than from trading in Q4 2024",
  "Tron processes more USDT transfer volume than Ethereum",
  "Worldcoin's verified user count crossed 10 million in 2024",
  "Polymarket processed over $3 billion in election bets in 2024",
  "EigenLayer's restaking TVL peaked above $20 billion",
  "Pump.fun launched more tokens daily than the rest of Ethereum combined",
  "MEV bots extracted over $700 million from Ethereum users in 2024",
  "Friend.tech generated over $20M in fees in its first month",
  "Telegram trading bots out-volumed centralized DEXes in late 2024",
  "Aave became the first DeFi protocol to cross $30B in TVL",
  "Circle filed to go public at a valuation above $5 billion",
  "BlackRock's BUIDL became the largest tokenized treasury product on-chain",
  "Trump's $TRUMP memecoin peaked above $14 billion market cap",
  "Layer 2s collectively settled more transactions than Ethereum mainnet in 2024",
  "Tether's annual profit exceeded Goldman Sachs' in 2024",
  "Saylor's average BTC cost basis is under $40,000",
  "Worldwide stablecoin supply crossed $200 billion in 2024",
  "Bitcoin's hash rate doubled in the year after the 2024 halving",
  "Solana validators required less than $300/month in hardware in 2024",
  "Hyperliquid's airdrop was the largest single-day token distribution in crypto",
  "USDC market cap surpassed USDT for the first time in 2025",
  "Vitalik Buterin's wallet sent over $100M of tokens to charity in 2024",
]

export function randomTopic(): string {
  return TOPICS[Math.floor(Math.random() * TOPICS.length)]
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
        return {
          topic: `@${t.author} claims: "${snippet}"`,
          source: "twitter",
          url: t.url,
        }
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
      return {
        topic: `${t.name} is trending — is it for a real fundamental reason or just hype?`,
        source: "trends",
        url: t.url,
      }
    }
  } catch (e: any) {
    console.warn("[topics] trends path failed:", e?.message ?? e)
  }

  // 3. Hardcoded pool — always works.
  console.warn("[topics] using hardcoded pool fallback")
  return { topic: randomTopic(), source: "pool" }
}
