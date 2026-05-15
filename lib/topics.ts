// lib/topics.ts
// 200 crypto/web3 debate topics for BLUFF
// Each is a binary statement Claude can verify via web search at runtime.

export type TopicEntry = {
  topic: string
  category: TopicCategory
}

export type TopicCategory =
  | 'bitcoin'
  | 'ethereum'
  | 'solana'
  | 'stablecoins'
  | 'layer2'
  | 'defi'
  | 'nfts'
  | 'memecoins'
  | 'exchanges'
  | 'regulation'
  | 'founders'
  | 'hacks'
  | 'adoption'
  | 'tokens'
  | 'arc'
  | 'newchains'
  | 'culture'

export const TOPIC_POOL: TopicEntry[] = [
  // ─── BITCOIN (15) ───────────────────────────────
  { topic: 'Bitcoin hit an all-time high above $126,000 in October 2025', category: 'bitcoin' },
  { topic: 'MicroStrategy holds over 250,000 BTC as of mid-2025', category: 'bitcoin' },
  { topic: 'The October 10, 2025 liquidation wiped out over $20B in leveraged positions', category: 'bitcoin' },
  { topic: 'The 2024 halving cut Bitcoin block rewards from 6.25 to 3.125 BTC', category: 'bitcoin' },
  { topic: 'US spot Bitcoin ETFs launched on January 11, 2024', category: 'bitcoin' },
  { topic: "BlackRock's IBIT became the fastest ETF to reach $50B in assets", category: 'bitcoin' },
  { topic: 'El Salvador adopted Bitcoin as legal tender in September 2021', category: 'bitcoin' },
  { topic: "Bitcoin's market cap surpassed silver's market cap in 2024", category: 'bitcoin' },
  { topic: "Satoshi's wallet holds around 1 million BTC untouched since 2010", category: 'bitcoin' },
  { topic: 'Bitcoin daily transactions peaked above 700,000 in 2024', category: 'bitcoin' },
  { topic: 'The Mt. Gox creditor distribution started releasing BTC in July 2024', category: 'bitcoin' },
  { topic: "Bitcoin's hash rate crossed 1 zettahash per second in 2025", category: 'bitcoin' },
  { topic: 'Bitcoin hit $100,000 for the first time in December 2024', category: 'bitcoin' },
  { topic: 'The German government sold around 50,000 seized BTC in mid-2024', category: 'bitcoin' },
  { topic: 'Coinbase Custody holds the majority of US spot Bitcoin ETF reserves', category: 'bitcoin' },

  // ─── ETHEREUM (15) ──────────────────────────────
  { topic: "Ethereum's Dencun upgrade dropped L2 fees by over 90% in March 2024", category: 'ethereum' },
  { topic: 'Total ETH staked crossed 35 million by late 2024', category: 'ethereum' },
  { topic: "Ethereum's annual issuance turned net deflationary after the Merge", category: 'ethereum' },
  { topic: 'Vitalik Buterin personally owns less than 250,000 ETH', category: 'ethereum' },
  { topic: 'Ethereum mainnet processes roughly 1 million transactions per day', category: 'ethereum' },
  { topic: 'Lido controls roughly 30% of all staked ETH', category: 'ethereum' },
  { topic: 'The Pectra upgrade launched on Ethereum in 2025', category: 'ethereum' },
  { topic: "Ethereum's market cap stayed below 25% of Bitcoin's throughout 2025", category: 'ethereum' },
  { topic: 'Ethereum gas fees averaged under $1 for most of 2024 after Dencun', category: 'ethereum' },
  { topic: 'Lido, Coinbase, and Binance together control over 50% of staked ETH', category: 'ethereum' },
  { topic: 'Ethereum had over 1 million active validators by late 2024', category: 'ethereum' },
  { topic: 'The Ethereum Foundation holds around 250,000 ETH in its treasury', category: 'ethereum' },
  { topic: "Ethereum's daily burn rate hit zero multiple times in 2024", category: 'ethereum' },
  { topic: "BlackRock's tokenized fund BUIDL launched on Ethereum in 2024", category: 'ethereum' },
  { topic: 'ETH dropped below $1,400 in April 2025 before recovering', category: 'ethereum' },

  // ─── SOLANA (12) ────────────────────────────────
  { topic: 'Solana hit an all-time high above $290 in early 2025', category: 'solana' },
  { topic: 'Solana had zero full network outages in 2024', category: 'solana' },
  { topic: 'Solana processed over 100 million daily transactions multiple times in 2024', category: 'solana' },
  { topic: "Solana's largest validator controls less than 3% of total stake", category: 'solana' },
  { topic: "Solana's TVL crossed $10 billion for the first time in 2024", category: 'solana' },
  { topic: 'Phantom wallet had over 15 million monthly users by mid-2025', category: 'solana' },
  { topic: "Solana's Firedancer client went live on mainnet in 2025", category: 'solana' },
  { topic: 'Pump.fun launched on Solana in January 2024', category: 'solana' },
  { topic: 'Solana DEX volume surpassed Ethereum DEX volume multiple times in 2024', category: 'solana' },
  { topic: 'Tether launched native USDT on Solana in 2024', category: 'solana' },
  { topic: 'Jito MEV rewards distributed over $200M to Solana stakers in 2024', category: 'solana' },
  { topic: 'SIMD-0228 reduced SOL inflation in 2025', category: 'solana' },

  // ─── STABLECOINS (12) ───────────────────────────
  { topic: "Tether's market cap surpassed $140 billion in 2025", category: 'stablecoins' },
  { topic: "USDC's market cap recovered above $60 billion by mid-2025", category: 'stablecoins' },
  { topic: 'Stablecoins settled more than $10 trillion in total volume in 2024', category: 'stablecoins' },
  { topic: 'Tether held over $97 billion in US Treasuries by mid-2024', category: 'stablecoins' },
  { topic: 'The GENIUS Act regulating stablecoins passed Congress in 2025', category: 'stablecoins' },
  { topic: "Circle's IPO valued the company above $10 billion in 2025", category: 'stablecoins' },
  { topic: "PayPal's PYUSD stablecoin supply stayed under $1 billion in 2024", category: 'stablecoins' },
  { topic: 'USDT volume on Tron exceeds USDT volume on Ethereum', category: 'stablecoins' },
  { topic: 'Stablecoins represent over 90% of all crypto transaction volume', category: 'stablecoins' },
  { topic: "Ethena's USDe synthetic dollar reached $5 billion supply in 2024", category: 'stablecoins' },
  { topic: "BlackRock's BUIDL became the largest tokenized US Treasury fund in 2024", category: 'stablecoins' },
  { topic: 'World Liberty Financial launched a stablecoin in 2025', category: 'stablecoins' },

  // ─── LAYER 2 (12) ───────────────────────────────
  { topic: 'Base became the #1 L2 by daily active users in 2024', category: 'layer2' },
  { topic: 'Arbitrum had the highest TVL of any L2 throughout 2024', category: 'layer2' },
  { topic: "Coinbase's Base L2 generated over $100 million in revenue in 2024", category: 'layer2' },
  { topic: 'Linea launched its token airdrop in 2025', category: 'layer2' },
  { topic: 'Optimism Superchain includes more than 30 chains by 2025', category: 'layer2' },
  { topic: "ZKsync's 2024 airdrop distributed tokens to over 600,000 wallets", category: 'layer2' },
  { topic: "Polygon's POL token replaced MATIC as the native token in 2024", category: 'layer2' },
  { topic: 'Scroll mainnet launched in October 2023', category: 'layer2' },
  { topic: 'Blast accumulated over $2 billion in TVL before its mainnet launch', category: 'layer2' },
  { topic: 'Optimism collected over $90 million in sequencer revenue in 2024', category: 'layer2' },
  { topic: "StarkNet's STRK token launched in February 2024", category: 'layer2' },
  { topic: 'Mantle Network reached $1 billion in TVL within its first year', category: 'layer2' },

  // ─── DEFI (10) ──────────────────────────────────
  { topic: "Aave's total deposits exceeded $40 billion in 2025", category: 'defi' },
  { topic: "Uniswap's cumulative volume surpassed $2 trillion in 2024", category: 'defi' },
  { topic: 'MakerDAO rebranded to Sky in 2024', category: 'defi' },
  { topic: 'Hyperliquid did over $1 trillion in cumulative perpetual volume in 2024', category: 'defi' },
  { topic: "Hyperliquid's HYPE airdrop in November 2024 was worth over $10,000 to many recipients", category: 'defi' },
  { topic: 'GMX V2 launched on Arbitrum and Avalanche in 2023', category: 'defi' },
  { topic: "Pendle's TVL crossed $5 billion in 2024", category: 'defi' },
  { topic: 'Friend.tech shut down its smart contracts in 2024', category: 'defi' },
  { topic: 'Total DeFi TVL crossed $200 billion in late 2024', category: 'defi' },
  { topic: 'Curve Finance recovered after the 2023 founder loan crisis', category: 'defi' },

  // ─── NFTS (8) ───────────────────────────────────
  { topic: "Bored Ape Yacht Club's floor dropped below 10 ETH in 2024", category: 'nfts' },
  { topic: 'NFT trading volume in 2024 was less than 10% of its 2022 peak', category: 'nfts' },
  { topic: "CryptoPunks' floor touched below 30 ETH in 2025", category: 'nfts' },
  { topic: 'Pudgy Penguins surpassed Bored Apes in floor price in 2024', category: 'nfts' },
  { topic: "OpenSea's NFT volume was overtaken by Blur in 2023", category: 'nfts' },
  { topic: "Beeple's Everydays sold for $69 million as the most expensive NFT ever", category: 'nfts' },
  { topic: 'Magic Eden launched its ME token in late 2024', category: 'nfts' },
  { topic: 'Yuga Labs laid off 25% of its staff in 2024', category: 'nfts' },

  // ─── MEMECOINS (10) ─────────────────────────────
  { topic: 'Pump.fun generated over $700 million in fees by mid-2025', category: 'memecoins' },
  { topic: "DOGE's market cap stayed above SHIB's throughout 2024", category: 'memecoins' },
  { topic: 'The TRUMP memecoin on Solana hit $14 billion FDV at peak', category: 'memecoins' },
  { topic: 'PEPE returned over 1000x for early holders in 2024', category: 'memecoins' },
  { topic: 'WIF (Dogwifhat) hit a $5 billion market cap in March 2024', category: 'memecoins' },
  { topic: 'BONK was airdropped to Solana NFT holders in December 2022', category: 'memecoins' },
  { topic: 'Memecoin volume on Solana exceeded Ethereum in 2024', category: 'memecoins' },
  { topic: 'The MOTHER token tied to Iggy Azalea launched in 2024', category: 'memecoins' },
  { topic: "Murad's supercycle thesis influenced memecoin trading in 2024", category: 'memecoins' },
  { topic: 'The October 10, 2025 crash wiped out over 80% of memecoin market cap', category: 'memecoins' },

  // ─── EXCHANGES (10) ─────────────────────────────
  { topic: 'Binance settled with US authorities for $4.3 billion in November 2023', category: 'exchanges' },
  { topic: 'CZ pleaded guilty and served 4 months in US federal prison', category: 'exchanges' },
  { topic: 'FTX collapsed on November 11, 2022', category: 'exchanges' },
  { topic: 'Sam Bankman-Fried was sentenced to 25 years in prison in March 2024', category: 'exchanges' },
  { topic: 'Coinbase generated over $1 billion in quarterly revenue multiple times in 2024', category: 'exchanges' },
  { topic: 'Hyperliquid surpassed Coinbase in derivatives volume in 2024', category: 'exchanges' },
  { topic: 'Kraken filed confidentially for an IPO in 2025', category: 'exchanges' },
  { topic: 'Robinhood Crypto generated over $300M in revenue in Q1 2025', category: 'exchanges' },
  { topic: 'Bybit was hacked for $1.5 billion in February 2025', category: 'exchanges' },
  { topic: 'Bitstamp was acquired by Robinhood in 2024', category: 'exchanges' },

  // ─── REGULATION (10) ────────────────────────────
  { topic: 'The SEC approved the first US spot Bitcoin ETFs in January 2024', category: 'regulation' },
  { topic: 'The SEC approved the first US spot Ethereum ETFs in July 2024', category: 'regulation' },
  { topic: 'Gary Gensler stepped down as SEC chair in January 2025', category: 'regulation' },
  { topic: 'Paul Atkins became the new SEC chair in 2025', category: 'regulation' },
  { topic: 'The FIT21 crypto market structure bill passed the US House in May 2024', category: 'regulation' },
  { topic: 'MiCA stablecoin rules took effect in the EU in June 2024', category: 'regulation' },
  { topic: 'Ripple won its SEC lawsuit on programmatic XRP sales in July 2023', category: 'regulation' },
  { topic: 'IRS Form 1099-DA for crypto reporting starts in 2025', category: 'regulation' },
  { topic: 'OFAC sanctions against Tornado Cash were partially overturned in 2024', category: 'regulation' },
  { topic: 'Donald Trump signed pro-crypto executive orders in his first 100 days in 2025', category: 'regulation' },

  // ─── FOUNDERS (10) ──────────────────────────────
  { topic: 'Vitalik Buterin co-founded Ethereum in 2013 at age 19', category: 'founders' },
  { topic: 'Justin Sun was named Grenadian ambassador to the WTO in 2021', category: 'founders' },
  { topic: "Saylor's MicroStrategy bought its first Bitcoin in August 2020", category: 'founders' },
  { topic: 'Do Kwon was extradited to the US in late 2024 after years in Montenegro', category: 'founders' },
  { topic: 'Su Zhu of Three Arrows Capital was arrested in Singapore in 2023', category: 'founders' },
  { topic: 'Caroline Ellison received a 2-year sentence for her role in FTX', category: 'founders' },
  { topic: 'Anatoly Yakovenko founded Solana in 2017', category: 'founders' },
  { topic: "Adam Back's Blockstream raised funds at a $3.2B valuation in 2024", category: 'founders' },
  { topic: 'Jed McCaleb founded Stellar after leaving Ripple in 2014', category: 'founders' },
  { topic: 'Cobie co-hosts the Up Only podcast with Ledger', category: 'founders' },

  // ─── HACKS (8) ──────────────────────────────────
  { topic: 'The Bybit hack in February 2025 was the largest in crypto history at $1.5B', category: 'hacks' },
  { topic: 'The Ronin bridge hack stole $625 million in March 2022', category: 'hacks' },
  { topic: 'The Lazarus Group from North Korea was attributed to multiple billion-dollar crypto hacks', category: 'hacks' },
  { topic: 'Curve Finance was hacked for $73 million in July 2023', category: 'hacks' },
  { topic: 'The Poly Network hack returned all $610 million in 2021', category: 'hacks' },
  { topic: 'The KuCoin hack of 2020 stole $281 million', category: 'hacks' },
  { topic: 'Euler Finance was hacked for $197 million but had funds returned in 2023', category: 'hacks' },
  { topic: 'Wormhole bridge was hacked for $325 million in February 2022', category: 'hacks' },

  // ─── ADOPTION (8) ───────────────────────────────
  { topic: 'Stripe re-enabled crypto payments in 2024 after a 6-year pause', category: 'adoption' },
  { topic: 'Visa settled over $200 billion in stablecoin payments in 2024', category: 'adoption' },
  { topic: 'Larry Fink publicly endorsed Bitcoin as digital gold in 2024', category: 'adoption' },
  { topic: 'PayPal launched stablecoin transfers globally in 2024', category: 'adoption' },
  { topic: 'Robinhood added Solana, Cardano, and PEPE to its US listings in 2024', category: 'adoption' },
  { topic: "Polymarket's 2024 US election volume exceeded $3.7 billion", category: 'adoption' },
  { topic: 'Argentina President Milei pumped the LIBRA memecoin in February 2025', category: 'adoption' },
  { topic: 'Bhutan became one of the largest sovereign Bitcoin holders by 2025', category: 'adoption' },

  // ─── TOKENS (10) ────────────────────────────────
  { topic: 'HYPE token reached an all-time high above $35 in 2025', category: 'tokens' },
  { topic: 'Ethena (ENA) launched in April 2024', category: 'tokens' },
  { topic: "ONDO's market cap crossed $5 billion in 2024", category: 'tokens' },
  { topic: 'AERO became the highest-revenue protocol on Base in 2024', category: 'tokens' },
  { topic: "VIRTUAL Protocol's market cap crossed $3 billion in December 2024", category: 'tokens' },
  { topic: 'AI16Z launched as an AI agent DAO in late 2024', category: 'tokens' },
  { topic: "FARTCOIN's market cap exceeded $1 billion in 2024", category: 'tokens' },
  { topic: 'The MOG coin returned over 200x for early holders in 2024', category: 'tokens' },
  { topic: 'Goatseus Maximus (GOAT) was inspired by an AI agent in 2024', category: 'tokens' },
  { topic: 'World Liberty Financial token was associated with the Trump family in 2025', category: 'tokens' },

  // ─── ARC / CIRCLE / USDC (17) ───────────────────
  { topic: 'Arc Network uses USDC as its native gas token instead of ETH', category: 'arc' },
  { topic: "Arc's chain ID is 5042002", category: 'arc' },
  { topic: 'Arc launched its public testnet in 2025 with over 100 institutional partners including BlackRock and Visa', category: 'arc' },
  { topic: 'Arc uses the Malachite consensus protocol for sub-second deterministic finality', category: 'arc' },
  { topic: 'Arc supports ERC-8004 for on-chain AI agent identity registration', category: 'arc' },
  { topic: 'Arc supports ERC-8183 for agentic commerce job contracts', category: 'arc' },
  { topic: 'Circle went public on the NYSE under the ticker CRCL in 2025', category: 'arc' },
  { topic: 'Jeremy Allaire co-founded Circle in 2013', category: 'arc' },
  { topic: "Circle's CCTP enables native cross-chain USDC transfers without bridges or wrapped tokens", category: 'arc' },
  { topic: 'Circle Gateway delivers sub-500ms cross-chain USDC transfers via a unified balance', category: 'arc' },
  { topic: "Circle's x402 protocol settles USDC payments as small as $0.000001 between agents", category: 'arc' },
  { topic: 'Circle launched USYC as a tokenized money market fund', category: 'arc' },
  { topic: 'Circle launched EURC as a regulated Euro stablecoin', category: 'arc' },
  { topic: 'USDC was first issued by Circle in September 2018', category: 'arc' },
  { topic: 'USDC briefly depegged to $0.87 during the Silicon Valley Bank crisis in March 2023', category: 'arc' },
  { topic: 'Circle publishes monthly USDC reserve attestations through Deloitte', category: 'arc' },
  { topic: 'The Circle agents marketplace hosts over 38 services across more than 500 endpoints', category: 'arc' },

  // ─── NEW CHAINS / MONAD / MEGAETH / BERA (14) ───
  { topic: 'Monad launched its mainnet on November 24, 2025', category: 'newchains' },
  { topic: 'Monad raised $244 million in funding led by Paradigm', category: 'newchains' },
  { topic: 'Monad achieves around 10,000 TPS through parallel EVM execution', category: 'newchains' },
  { topic: 'The MON token public sale on Coinbase ran from November 17 to 22, 2025', category: 'newchains' },
  { topic: 'Monad was founded in 2022 by veterans from Jump Trading', category: 'newchains' },
  { topic: 'MegaETH targets over 100,000 TPS with 10-millisecond block times', category: 'newchains' },
  { topic: "MegaETH's public token sale raised over $670 million by late October 2025", category: 'newchains' },
  { topic: 'The MEGA token launched on April 30, 2026, opening around $0.22 before dropping', category: 'newchains' },
  { topic: 'MegaETH is publicly backed by Vitalik Buterin and Joseph Lubin', category: 'newchains' },
  { topic: 'The Fluffle NFT collection minted in February 2025 with future MEGA allocations attached', category: 'newchains' },
  { topic: 'Berachain launched its mainnet on February 6, 2025', category: 'newchains' },
  { topic: "Berachain's Proof-of-Liquidity consensus rewards LPs instead of pure stakers", category: 'newchains' },
  { topic: 'BERA dropped over 60% from $13 to around $5 within a week of launch', category: 'newchains' },
  { topic: 'Hyperliquid launched HyperEVM as its programmable layer in 2025', category: 'newchains' },

  // ─── CT CULTURE / KOLs / DRAMA (19) ─────────────
  { topic: 'Nikita Bier revoked X API access for InfoFi apps on January 15, 2026', category: 'culture' },
  { topic: "Kaito's KAITO token dropped around 20% within minutes of the InfoFi ban", category: 'culture' },
  { topic: "The wider InfoFi market cap fell over 10% after Bier's API revocation", category: 'culture' },
  { topic: 'Nikita Bier said Crypto Twitter was "dying from suicide, not from the algorithm"', category: 'culture' },
  { topic: 'ZachXBT leaked a spreadsheet of over 200 KOL pricing details in September 2025', category: 'culture' },
  { topic: 'Some KOLs charge up to $70,000 per promotional post per the ZachXBT leak', category: 'culture' },
  { topic: 'wale.moca briefly ranked top 3 in Crypto Twitter mindshare behind CZ and Vitalik in February 2025', category: 'culture' },
  { topic: 'Crypto became the most-muted topic on X after the snooze feature launched in April 2026', category: 'culture' },
  { topic: 'Kaito sunset its Yaps program in response to the InfoFi API revocation', category: 'culture' },
  { topic: 'Ki Young Ju reported bots generated over 7.7 million crypto posts in a single day in early 2026', category: 'culture' },
  { topic: 'Murad popularized the "memecoin supercycle" thesis throughout 2024', category: 'culture' },
  { topic: 'The TRUMP memecoin launched on Solana three days before his second inauguration', category: 'culture' },
  { topic: 'The KelpDAO rsETH exploit drained around $290 million in April 2026', category: 'culture' },
  { topic: 'The "gm" greeting became a signature daily ritual of Crypto Twitter', category: 'culture' },
  { topic: "Argentina's Milei deleted his LIBRA memecoin tweet shortly after the token collapsed", category: 'culture' },
  { topic: 'Caroline Ellison testified against Sam Bankman-Fried during his FTX trial in October 2023', category: 'culture' },
  { topic: 'Pump.fun launched its PUMP token via airdrop in 2025', category: 'culture' },
  { topic: 'ZachXBT is one of the most well-known on-chain investigators on Crypto Twitter', category: 'culture' },
  { topic: 'The Iggy Azalea MOTHER token launched on Solana in 2024', category: 'culture' },
]

// ─── Rotation helper ────────────────────────────────
// Avoids back-to-back topics from the same category.
// Keeps a short rolling cache so the same topic does not repeat within N rounds.

const RECENT_CACHE_SIZE = 15
const recentTopics: string[] = []
let lastCategory: TopicCategory | null = null

export function pickTopic(): TopicEntry {
  const available = TOPIC_POOL.filter(
    (t) => !recentTopics.includes(t.topic) && t.category !== lastCategory
  )

  // Fallback if filter is too aggressive
  const pool = available.length > 0 ? available : TOPIC_POOL

  const picked = pool[Math.floor(Math.random() * pool.length)]

  // Update rolling cache
  recentTopics.push(picked.topic)
  if (recentTopics.length > RECENT_CACHE_SIZE) recentTopics.shift()
  lastCategory = picked.category

  return picked
}

export function pickTopicsByCategory(category: TopicCategory): TopicEntry[] {
  return TOPIC_POOL.filter((t) => t.category === category)
}

export function getCategories(): TopicCategory[] {
  return Array.from(new Set(TOPIC_POOL.map((t) => t.category)))
}

// ─── Compatibility shim ─────────────────────────────
// /api/round/start still calls getRoundTopic() and destructures
// { topic, source, url }. Wrap pickTopic() to keep that contract.

export type RoundTopic = {
  topic: string
  source: 'twitter' | 'trends' | 'pool'
  url?: string
}

export async function getRoundTopic(): Promise<RoundTopic> {
  const picked = pickTopic()
  return { topic: picked.topic, source: 'pool' }
}
