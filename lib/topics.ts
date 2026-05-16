// lib/topics.ts
// Pre-verified crypto/web3 debate topics for BLUFF.
//
// Each entry can carry its own verdict / truthSummary / source — when present,
// /api/round/start skips the runtime web-search fetchTruth call and feeds these
// directly into the agent prompts. Result: faster rounds, no hallucinated
// truths, deterministic source URLs on the reveal screen.

export type Verdict = "TRUE" | "FALSE" | "UNCLEAR"

export type TopicEntry = {
  id?: string
  topic: string
  category: TopicCategory
  // Pre-verified fields. If verdict + truthSummary are present, /api/round/start
  // uses them instead of calling fetchTruth.
  verdict?: Verdict
  truthSummary?: string
  source?: string
  subcategory?: string
  difficulty?: 1 | 2 | 3
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
  { id: 'btc_001', topic: 'Bitcoin hit an all-time high above $126,000 in October 2025', category: 'bitcoin', verdict: 'TRUE', truthSummary: 'Bitcoin set a new all-time high around $126,200 on October 6, 2025, per major price trackers.', source: 'https://www.coingecko.com/en/coins/bitcoin' },
  { id: 'btc_002', topic: 'MicroStrategy holds over 250,000 BTC as of mid-2025', category: 'bitcoin', verdict: 'TRUE', truthSummary: 'MicroStrategy (rebranded "Strategy") held well above 250,000 BTC by mid-2025 — actual holdings exceeded 500,000 BTC.', source: 'https://www.strategy.com/' },
  { id: 'btc_003', topic: 'The October 10, 2025 liquidation wiped out over $20B in leveraged positions', category: 'bitcoin', verdict: 'UNCLEAR', truthSummary: 'A large leverage flush hit crypto markets in October 2025, but the exact dollar figure of liquidations on October 10 is not independently confirmed at the $20B level.', source: 'https://www.coinglass.com/LiquidationData' },
  { id: 'btc_004', topic: 'The 2024 halving cut Bitcoin block rewards from 6.25 to 3.125 BTC', category: 'bitcoin', verdict: 'TRUE', truthSummary: 'The fourth Bitcoin halving on April 19-20, 2024 reduced the block subsidy from 6.25 BTC to 3.125 BTC.', source: 'https://en.wikipedia.org/wiki/Bitcoin#Halving' },
  { id: 'btc_005', topic: 'US spot Bitcoin ETFs launched on January 11, 2024', category: 'bitcoin', verdict: 'TRUE', truthSummary: 'Eleven US spot Bitcoin ETFs began trading on January 11, 2024 after the SEC approved them on January 10.', source: 'https://www.sec.gov/news/statement/gensler-statement-spot-bitcoin-011023' },
  { id: 'btc_006', topic: "BlackRock's IBIT became the fastest ETF to reach $50B in assets", category: 'bitcoin', verdict: 'TRUE', truthSummary: 'IBIT crossed $50B AUM in about 11 months, the fastest ETF in history to that milestone.', source: 'https://www.blackrock.com/us/individual/products/333011/ishares-bitcoin-trust' },
  { id: 'btc_007', topic: 'El Salvador adopted Bitcoin as legal tender in September 2021', category: 'bitcoin', verdict: 'TRUE', truthSummary: 'El Salvador\'s Bitcoin Law took effect on September 7, 2021, making it the first country to adopt BTC as legal tender.', source: 'https://en.wikipedia.org/wiki/Bitcoin_in_El_Salvador' },
  { id: 'btc_008', topic: "Bitcoin's market cap surpassed silver's market cap in 2024", category: 'bitcoin', verdict: 'TRUE', truthSummary: 'Bitcoin\'s market cap passed silver\'s (~$1.5T vs ~$1.4T) in 2024, briefly making it the world\'s eighth-largest asset.', source: 'https://companiesmarketcap.com/assets-by-market-cap/' },
  { id: 'btc_009', topic: "Satoshi's wallet holds around 1 million BTC untouched since 2010", category: 'bitcoin', verdict: 'TRUE', truthSummary: 'Analysis of early Bitcoin mining patterns suggests Satoshi controls roughly 1.0-1.1 million BTC that has never been moved.', source: 'https://www.coindesk.com/markets/2020/09/22/satoshis-1-million-btc-stash-may-be-up-to-1100000/' },
  { id: 'btc_010', topic: 'Bitcoin daily transactions peaked above 700,000 in 2024', category: 'bitcoin', verdict: 'TRUE', truthSummary: 'Bitcoin saw multiple days with over 700,000 daily transactions during the Runes / Ordinals activity in 2024.', source: 'https://www.blockchain.com/explorer/charts/n-transactions' },
  { id: 'btc_011', topic: 'The Mt. Gox creditor distribution started releasing BTC in July 2024', category: 'bitcoin', verdict: 'TRUE', truthSummary: 'The Mt. Gox trustee began distributing BTC/BCH to creditors in early July 2024 after years of bankruptcy proceedings.', source: 'https://www.mtgox.com/' },
  { id: 'btc_012', topic: "Bitcoin's hash rate crossed 1 zettahash per second in 2025", category: 'bitcoin', verdict: 'TRUE', truthSummary: 'Bitcoin\'s network hash rate crossed the 1 ZH/s (1,000 EH/s) threshold in 2025, up from ~800 EH/s at the end of 2024.', source: 'https://www.blockchain.com/explorer/charts/hash-rate' },
  { id: 'btc_013', topic: 'Bitcoin hit $100,000 for the first time in December 2024', category: 'bitcoin', verdict: 'TRUE', truthSummary: 'Bitcoin first crossed $100,000 on December 5, 2024.', source: 'https://www.coindesk.com/markets/2024/12/05/bitcoin-tops-100k-for-first-time/' },
  { id: 'btc_014', topic: 'The German government sold around 50,000 seized BTC in mid-2024', category: 'bitcoin', verdict: 'TRUE', truthSummary: 'Germany sold approximately 50,000 BTC (worth ~$3B) seized from Movie2k operators between June and July 2024.', source: 'https://www.reuters.com/technology/german-government-finishes-selling-bitcoin-2024-07-12/' },
  { id: 'btc_015', topic: 'Coinbase Custody holds the majority of US spot Bitcoin ETF reserves', category: 'bitcoin', verdict: 'TRUE', truthSummary: 'Coinbase Custody is the named custodian for 8 of 11 US spot Bitcoin ETFs, holding the majority of pooled reserves.', source: 'https://www.coinbase.com/institutional/custody' },

  // ─── ETHEREUM (15) ──────────────────────────────
  { id: 'eth_001', topic: "Ethereum's Dencun upgrade dropped L2 fees by over 90% in March 2024", category: 'ethereum', verdict: 'TRUE', truthSummary: 'Dencun activated on Ethereum mainnet on March 13, 2024 (EIP-4844 blobs), and most L2 transaction fees fell 90%+ within days.', source: 'https://blog.ethereum.org/2024/02/27/dencun-mainnet-announcement' },
  { id: 'eth_002', topic: 'Total ETH staked crossed 35 million by late 2024', category: 'ethereum', verdict: 'TRUE', truthSummary: 'Total ETH staked passed 35 million by Q3 2024 and continued growing through year-end.', source: 'https://beaconcha.in/charts/staked_ether' },
  { id: 'eth_003', topic: "Ethereum's annual issuance turned net deflationary after the Merge", category: 'ethereum', verdict: 'UNCLEAR', truthSummary: 'Post-Merge ETH was deflationary in some periods (high activity) and inflationary in others (post-Dencun, low burn). Not consistently net-negative.', source: 'https://ultrasound.money/' },
  { id: 'eth_004', topic: 'Vitalik Buterin personally owns less than 250,000 ETH', category: 'ethereum', verdict: 'TRUE', truthSummary: 'Vitalik\'s known wallets hold ~240,000-250,000 ETH per public on-chain analyses; he has stated he owns less than 0.3% of supply.', source: 'https://etherscan.io/address/0xab5801a7d398351b8be11c439e05c5b3259aec9b' },
  { id: 'eth_005', topic: 'Ethereum mainnet processes roughly 1 million transactions per day', category: 'ethereum', verdict: 'TRUE', truthSummary: 'Ethereum L1 has averaged 1.0-1.2M transactions per day through 2024-2025.', source: 'https://etherscan.io/chart/tx' },
  { id: 'eth_006', topic: 'Lido controls roughly 30% of all staked ETH', category: 'ethereum', verdict: 'TRUE', truthSummary: 'Lido\'s share of staked ETH has hovered around 28-30% through 2024-2025, down from a 32% peak.', source: 'https://dune.com/hildobby/eth2-staking' },
  { id: 'eth_007', topic: 'The Pectra upgrade launched on Ethereum in 2025', category: 'ethereum', verdict: 'TRUE', truthSummary: 'The Pectra hard fork activated on Ethereum mainnet on May 7, 2025.', source: 'https://blog.ethereum.org/2025/05/07/pectra-mainnet' },
  { id: 'eth_008', topic: "Ethereum's market cap stayed below 25% of Bitcoin's throughout 2025", category: 'ethereum', verdict: 'UNCLEAR', truthSummary: 'The ETH/BTC market cap ratio varied between roughly 15% and 25% in 2025; not consistently below 25%.', source: 'https://www.coingecko.com/en/coins/ethereum' },
  { id: 'eth_009', topic: 'Ethereum gas fees averaged under $1 for most of 2024 after Dencun', category: 'ethereum', verdict: 'UNCLEAR', truthSummary: 'Average ETH L1 gas for simple transfers was often below $1 in 2024 but contract interactions ran higher; depends on tx type.', source: 'https://ycharts.com/indicators/ethereum_average_transaction_fee' },
  { id: 'eth_010', topic: 'Lido, Coinbase, and Binance together control over 50% of staked ETH', category: 'ethereum', verdict: 'FALSE', truthSummary: 'Lido (~28-30%), Coinbase (~13-14%), and Binance (~3-4%) combined control around 45-47% of staked ETH — under 50%.', source: 'https://dune.com/hildobby/eth2-staking' },
  { id: 'eth_011', topic: 'Ethereum had over 1 million active validators by late 2024', category: 'ethereum', verdict: 'TRUE', truthSummary: 'Active validator count crossed 1 million in early 2024 and stayed above that level through year-end.', source: 'https://beaconcha.in/charts/validators' },
  { id: 'eth_012', topic: 'The Ethereum Foundation holds around 250,000 ETH in its treasury', category: 'ethereum', verdict: 'TRUE', truthSummary: 'EF\'s 2024 disclosures showed treasury holdings of roughly 256,000 ETH plus stablecoins.', source: 'https://blog.ethereum.org/2024/10/03/ef-financials-2024' },
  { id: 'eth_013', topic: "Ethereum's daily burn rate hit zero multiple times in 2024", category: 'ethereum', verdict: 'TRUE', truthSummary: 'Post-Dencun, several days in 2024 saw net-zero or negative burn as base fees dropped below issuance.', source: 'https://ultrasound.money/' },
  { id: 'eth_014', topic: "BlackRock's tokenized fund BUIDL launched on Ethereum in 2024", category: 'ethereum', verdict: 'TRUE', truthSummary: 'BlackRock\'s BUIDL fund launched on Ethereum on March 20, 2024 in partnership with Securitize.', source: 'https://www.blackrock.com/us/individual/literature/press-release/blackrock-launches-first-tokenized-fund-on-ethereum-network.pdf' },
  { id: 'eth_015', topic: 'ETH dropped below $1,400 in April 2025 before recovering', category: 'ethereum', verdict: 'TRUE', truthSummary: 'Ethereum briefly traded under $1,400 in early April 2025 before rebounding later that quarter.', source: 'https://www.coingecko.com/en/coins/ethereum' },

  // ─── SOLANA (12) ────────────────────────────────
  { id: 'sol_001', topic: 'Solana hit an all-time high above $290 in early 2025', category: 'solana', verdict: 'TRUE', truthSummary: 'SOL set a new all-time high of approximately $295 on January 19, 2025.', source: 'https://www.coingecko.com/en/coins/solana' },
  { id: 'sol_002', topic: 'Solana had zero full network outages in 2024', category: 'solana', verdict: 'TRUE', truthSummary: 'Solana experienced performance degradations but no full network halts in 2024 — the last full outage was February 2023.', source: 'https://status.solana.com/' },
  { id: 'sol_003', topic: 'Solana processed over 100 million daily transactions multiple times in 2024', category: 'solana', verdict: 'TRUE', truthSummary: 'Including vote transactions, Solana routinely processed 60-100M+ daily transactions and crossed 100M on multiple peak days in 2024.', source: 'https://explorer.solana.com/' },
  { id: 'sol_004', topic: "Solana's largest validator controls less than 3% of total stake", category: 'solana', verdict: 'TRUE', truthSummary: 'The largest single Solana validator holds roughly 2-3% of active stake; Solana\'s validator distribution is much flatter than many L1s.', source: 'https://www.validators.app/' },
  { id: 'sol_005', topic: "Solana's TVL crossed $10 billion for the first time in 2024", category: 'solana', verdict: 'TRUE', truthSummary: 'Solana DeFi TVL passed $10B in late 2024, up from ~$1.5B at start of year.', source: 'https://defillama.com/chain/Solana' },
  { id: 'sol_006', topic: 'Phantom wallet had over 15 million monthly users by mid-2025', category: 'solana', verdict: 'UNCLEAR', truthSummary: 'Phantom has publicly cited 15M+ MAU at various points, but exact mid-2025 figure not consistently reported.', source: 'https://phantom.app/' },
  { id: 'sol_007', topic: "Solana's Firedancer client went live on mainnet in 2025", category: 'solana', verdict: 'UNCLEAR', truthSummary: '"Frankendancer" (partial Firedancer) ran on mainnet starting 2024; the full Firedancer client rollout was still ongoing through 2025.', source: 'https://jumpcrypto.com/firedancer/' },
  { id: 'sol_008', topic: 'Pump.fun launched on Solana in January 2024', category: 'solana', verdict: 'TRUE', truthSummary: 'Pump.fun launched on Solana in mid-January 2024 and quickly became the dominant token launchpad.', source: 'https://pump.fun/' },
  { id: 'sol_009', topic: 'Solana DEX volume surpassed Ethereum DEX volume multiple times in 2024', category: 'solana', verdict: 'TRUE', truthSummary: 'Solana DEX volume exceeded Ethereum\'s on numerous days throughout 2024, driven by Jupiter, Raydium, and memecoin activity.', source: 'https://defillama.com/dexs/chains' },
  { id: 'sol_010', topic: 'Tether launched native USDT on Solana in 2024', category: 'solana', verdict: 'FALSE', truthSummary: 'Native USDT has been on Solana since 2021 — not 2024. By 2024 it was already one of the larger stablecoin deployments on Solana.', source: 'https://tether.to/en/' },
  { id: 'sol_011', topic: 'Jito MEV rewards distributed over $200M to Solana stakers in 2024', category: 'solana', verdict: 'TRUE', truthSummary: 'Jito\'s MEV tip distributions to validators and stakers exceeded $200M (and reached roughly $300M+) in 2024.', source: 'https://jito.network/' },
  { id: 'sol_012', topic: 'SIMD-0228 reduced SOL inflation in 2025', category: 'solana', verdict: 'FALSE', truthSummary: 'SIMD-0228 (the proposed dynamic inflation curve) was voted on but did NOT pass — SOL inflation continued under the original schedule in 2025.', source: 'https://github.com/solana-foundation/solana-improvement-documents' },

  // ─── STABLECOINS (12) ───────────────────────────
  { id: 'stb_001', topic: "Tether's market cap surpassed $140 billion in 2025", category: 'stablecoins', verdict: 'TRUE', truthSummary: 'USDT\'s circulating supply crossed $140B in 2025, making Tether the dominant stablecoin issuer.', source: 'https://www.coingecko.com/en/coins/tether' },
  { id: 'stb_002', topic: "USDC's market cap recovered above $60 billion by mid-2025", category: 'stablecoins', verdict: 'TRUE', truthSummary: 'USDC supply recovered to above $60B by mid-2025, up from a low of ~$24B after the SVB depeg.', source: 'https://www.coingecko.com/en/coins/usd-coin' },
  { id: 'stb_003', topic: 'Stablecoins settled more than $10 trillion in total volume in 2024', category: 'stablecoins', verdict: 'TRUE', truthSummary: 'Adjusted stablecoin settlement volume in 2024 exceeded $10T (and unadjusted gross volume exceeded $27T per Visa Onchain Analytics).', source: 'https://visaonchainanalytics.com/' },
  { id: 'stb_004', topic: 'Tether held over $97 billion in US Treasuries by mid-2024', category: 'stablecoins', verdict: 'TRUE', truthSummary: 'Tether\'s Q2 2024 attestation reported direct/indirect US Treasury exposure of approximately $97.6B.', source: 'https://tether.to/en/transparency' },
  { id: 'stb_005', topic: 'The GENIUS Act regulating stablecoins passed Congress in 2025', category: 'stablecoins', verdict: 'TRUE', truthSummary: 'The GENIUS Act passed the Senate in June 2025 and was signed into law on July 18, 2025.', source: 'https://www.congress.gov/bill/119th-congress/senate-bill/394' },
  { id: 'stb_006', topic: "Circle's IPO valued the company above $10 billion in 2025", category: 'stablecoins', verdict: 'TRUE', truthSummary: 'Circle (CRCL) IPO\'d on NYSE in June 2025 at a ~$8B initial valuation; CRCL traded above a $10B market cap within days.', source: 'https://www.nyse.com/quote/XNYS:CRCL' },
  { id: 'stb_007', topic: "PayPal's PYUSD stablecoin supply stayed under $1 billion in 2024", category: 'stablecoins', verdict: 'TRUE', truthSummary: 'PYUSD supply hovered between $250M and $900M throughout 2024 — never crossed $1B.', source: 'https://www.coingecko.com/en/coins/paypal-usd' },
  { id: 'stb_008', topic: 'USDT volume on Tron exceeds USDT volume on Ethereum', category: 'stablecoins', verdict: 'TRUE', truthSummary: 'Tron has consistently surpassed Ethereum in USDT transfer volume, driven by lower fees and emerging-market remittance flows.', source: 'https://defillama.com/stablecoins' },
  { id: 'stb_009', topic: 'Stablecoins represent over 90% of all crypto transaction volume', category: 'stablecoins', verdict: 'UNCLEAR', truthSummary: 'Stablecoins are the majority of on-chain transfer volume but the exact share varies (60-80% depending on methodology and chain mix).', source: 'https://visaonchainanalytics.com/' },
  { id: 'stb_010', topic: "Ethena's USDe synthetic dollar reached $5 billion supply in 2024", category: 'stablecoins', verdict: 'TRUE', truthSummary: 'Ethena\'s USDe supply crossed $5B in 2024, making it the third-largest stablecoin by some measures.', source: 'https://ethena.fi/' },
  { id: 'stb_011', topic: "BlackRock's BUIDL became the largest tokenized US Treasury fund in 2024", category: 'stablecoins', verdict: 'TRUE', truthSummary: 'BUIDL surpassed Franklin Templeton\'s FOBXX and Ondo\'s OUSG in 2024 to become the largest tokenized Treasury product on-chain.', source: 'https://app.rwa.xyz/treasuries' },
  { id: 'stb_012', topic: 'World Liberty Financial launched a stablecoin in 2025', category: 'stablecoins', verdict: 'TRUE', truthSummary: 'World Liberty Financial (Trump-affiliated) launched the USD1 stablecoin in March 2025.', source: 'https://worldlibertyfinancial.com/' },

  // ─── LAYER 2 (12) ───────────────────────────────
  { id: 'l2_001', topic: 'Base became the #1 L2 by daily active users in 2024', category: 'layer2', verdict: 'TRUE', truthSummary: 'Base led all Ethereum L2s in daily active addresses for most of 2024, often by a wide margin.', source: 'https://l2beat.com/scaling/activity' },
  { id: 'l2_002', topic: 'Arbitrum had the highest TVL of any L2 throughout 2024', category: 'layer2', verdict: 'TRUE', truthSummary: 'Arbitrum held the #1 spot for L2 TVL through 2024, peaking above $18B.', source: 'https://l2beat.com/scaling/tvl' },
  { id: 'l2_003', topic: "Coinbase's Base L2 generated over $100 million in revenue in 2024", category: 'layer2', verdict: 'UNCLEAR', truthSummary: 'Base sequencer revenue in 2024 has been estimated in the $80-120M range; precise public figure not consistently confirmed.', source: 'https://dune.com/oplabspbc/op-stack-chains' },
  { id: 'l2_004', topic: 'Linea launched its token airdrop in 2025', category: 'layer2', verdict: 'TRUE', truthSummary: 'Linea announced its LINEA token and airdrop in 2025; the public claim opened in September 2025.', source: 'https://linea.build/' },
  { id: 'l2_005', topic: 'Optimism Superchain includes more than 30 chains by 2025', category: 'layer2', verdict: 'UNCLEAR', truthSummary: 'The Superchain has 20+ live chains and more announced; whether the active count exceeds 30 in 2025 depends on how partner chains are counted.', source: 'https://www.superchain.eco/' },
  { id: 'l2_006', topic: "ZKsync's 2024 airdrop distributed tokens to over 600,000 wallets", category: 'layer2', verdict: 'TRUE', truthSummary: 'ZK airdrop went to approximately 695,000 eligible wallets in June 2024.', source: 'https://zksync.io/' },
  { id: 'l2_007', topic: "Polygon's POL token replaced MATIC as the native token in 2024", category: 'layer2', verdict: 'TRUE', truthSummary: 'The POL migration began September 4, 2024, replacing MATIC as the native staking and gas token.', source: 'https://polygon.technology/blog/save-the-date-pol-migration-coming-on-september-4th' },
  { id: 'l2_008', topic: 'Scroll mainnet launched in October 2023', category: 'layer2', verdict: 'TRUE', truthSummary: 'Scroll launched its zkEVM mainnet on October 17, 2023.', source: 'https://scroll.io/blog/scaling-ethereum-mainnet' },
  { id: 'l2_009', topic: 'Blast accumulated over $2 billion in TVL before its mainnet launch', category: 'layer2', verdict: 'TRUE', truthSummary: 'Blast deposits exceeded $2B during its pre-launch bridge phase, hitting mainnet in February 2024.', source: 'https://blast.io/' },
  { id: 'l2_010', topic: 'Optimism collected over $90 million in sequencer revenue in 2024', category: 'layer2', verdict: 'UNCLEAR', truthSummary: 'Optimism mainnet sequencer profit in 2024 was on the order of tens of millions; precise $90M figure not directly verifiable.', source: 'https://dune.com/oplabspbc/optimism-l2' },
  { id: 'l2_011', topic: "StarkNet's STRK token launched in February 2024", category: 'layer2', verdict: 'TRUE', truthSummary: 'STRK officially launched and began trading on February 20, 2024.', source: 'https://www.starknet.io/' },
  { id: 'l2_012', topic: 'Mantle Network reached $1 billion in TVL within its first year', category: 'layer2', verdict: 'TRUE', truthSummary: 'Mantle launched in July 2023 and crossed $1B TVL during 2024, within its first year of mainnet operation.', source: 'https://defillama.com/chain/Mantle' },

  // ─── DEFI (10) ──────────────────────────────────
  { id: 'defi_001', topic: "Aave's total deposits exceeded $40 billion in 2025", category: 'defi', verdict: 'TRUE', truthSummary: 'Aave\'s total deposits across all chains and versions crossed $40B in 2025.', source: 'https://defillama.com/protocol/aave' },
  { id: 'defi_002', topic: "Uniswap's cumulative volume surpassed $2 trillion in 2024", category: 'defi', verdict: 'TRUE', truthSummary: 'Uniswap reported all-time cumulative volume passing $2T in mid-2024.', source: 'https://uniswap.org/' },
  { id: 'defi_003', topic: 'MakerDAO rebranded to Sky in 2024', category: 'defi', verdict: 'TRUE', truthSummary: 'MakerDAO\'s Endgame plan rebranded the protocol to Sky and introduced USDS in August/September 2024.', source: 'https://sky.money/' },
  { id: 'defi_004', topic: 'Hyperliquid did over $1 trillion in cumulative perpetual volume in 2024', category: 'defi', verdict: 'TRUE', truthSummary: 'Hyperliquid crossed $1T in cumulative perpetuals volume in 2024, becoming the dominant on-chain perps venue.', source: 'https://stats.hyperliquid.xyz/' },
  { id: 'defi_005', topic: "Hyperliquid's HYPE airdrop in November 2024 was worth over $10,000 to many recipients", category: 'defi', verdict: 'TRUE', truthSummary: 'HYPE launched on November 29, 2024; many eligible users received allocations valued well above $10,000 at launch and substantially more at peak.', source: 'https://hyperliquid.xyz/' },
  { id: 'defi_006', topic: 'GMX V2 launched on Arbitrum and Avalanche in 2023', category: 'defi', verdict: 'TRUE', truthSummary: 'GMX V2 launched on Arbitrum and Avalanche in August 2023.', source: 'https://gmx.io/' },
  { id: 'defi_007', topic: "Pendle's TVL crossed $5 billion in 2024", category: 'defi', verdict: 'TRUE', truthSummary: 'Pendle TVL peaked above $7B in 2024 — well past the $5B threshold.', source: 'https://defillama.com/protocol/pendle' },
  { id: 'defi_008', topic: 'Friend.tech shut down its smart contracts in 2024', category: 'defi', verdict: 'TRUE', truthSummary: 'Friend.tech\'s v1 contracts were transferred to a null/community-owned address in September 2024, effectively winding down operations.', source: 'https://www.theblock.co/post/318186/friend-tech-shut-down' },
  { id: 'defi_009', topic: 'Total DeFi TVL crossed $200 billion in late 2024', category: 'defi', verdict: 'FALSE', truthSummary: 'Total DeFi TVL peaked at roughly $130-140B in late 2024 — it did NOT cross $200B (last seen at $200B+ was 2021).', source: 'https://defillama.com/' },
  { id: 'defi_010', topic: 'Curve Finance recovered after the 2023 founder loan crisis', category: 'defi', verdict: 'TRUE', truthSummary: 'Curve survived the July 2023 Vyper exploit and Egorov\'s overleveraged CRV-backed loan situation; the protocol continued operating.', source: 'https://curve.fi/' },

  // ─── NFTS (8) ───────────────────────────────────
  { id: 'nft_001', topic: "Bored Ape Yacht Club's floor dropped below 10 ETH in 2024", category: 'nfts', verdict: 'TRUE', truthSummary: 'BAYC floor price fell below 10 ETH in mid-2024, down from the 100+ ETH peak of 2022.', source: 'https://opensea.io/collection/boredapeyachtclub' },
  { id: 'nft_002', topic: 'NFT trading volume in 2024 was less than 10% of its 2022 peak', category: 'nfts', verdict: 'TRUE', truthSummary: 'Monthly NFT volume averaged $200-400M in 2024 vs ~$5B+ at the 2022 peak — well below 10%.', source: 'https://dune.com/hildobby/NFTs' },
  { id: 'nft_003', topic: "CryptoPunks' floor touched below 30 ETH in 2025", category: 'nfts', verdict: 'TRUE', truthSummary: 'The CryptoPunks floor dipped under 30 ETH at various points in 2025, down from a 100+ ETH peak.', source: 'https://opensea.io/collection/cryptopunks' },
  { id: 'nft_004', topic: 'Pudgy Penguins surpassed Bored Apes in floor price in 2024', category: 'nfts', verdict: 'TRUE', truthSummary: 'Pudgy Penguins\' floor (~16 ETH) overtook BAYC (~13 ETH) at multiple points in 2024.', source: 'https://opensea.io/collection/pudgypenguins' },
  { id: 'nft_005', topic: "OpenSea's NFT volume was overtaken by Blur in 2023", category: 'nfts', verdict: 'TRUE', truthSummary: 'Blur surpassed OpenSea in NFT trading volume shortly after its February 2023 launch and dominated through most of 2023.', source: 'https://dune.com/hildobby/NFTs' },
  { id: 'nft_006', topic: "Beeple's Everydays sold for $69 million as the most expensive NFT ever", category: 'nfts', verdict: 'TRUE', truthSummary: 'Beeple\'s "Everydays: The First 5000 Days" sold at Christie\'s for $69.3M in March 2021 — still the highest single-piece NFT auction sale.', source: 'https://onlineonly.christies.com/s/beeple-first-5000-days/beeple-b-1981-1/112924' },
  { id: 'nft_007', topic: 'Magic Eden launched its ME token in late 2024', category: 'nfts', verdict: 'TRUE', truthSummary: 'Magic Eden launched the ME token via airdrop and TGE on December 10, 2024.', source: 'https://magiceden.io/' },
  { id: 'nft_008', topic: 'Yuga Labs laid off 25% of its staff in 2024', category: 'nfts', verdict: 'UNCLEAR', truthSummary: 'Yuga Labs went through multiple rounds of layoffs in 2024; precise total percentage not consistently confirmed.', source: 'https://yuga.com/' },

  // ─── MEMECOINS (10) ─────────────────────────────
  { id: 'meme_001', topic: 'Pump.fun generated over $700 million in fees by mid-2025', category: 'memecoins', verdict: 'TRUE', truthSummary: 'Pump.fun\'s cumulative fee revenue crossed $700M in mid-2025, making it one of the highest-revenue apps in crypto.', source: 'https://dune.com/hashed_official/pump-fun' },
  { id: 'meme_002', topic: "DOGE's market cap stayed above SHIB's throughout 2024", category: 'memecoins', verdict: 'TRUE', truthSummary: 'Dogecoin\'s market cap remained larger than Shiba Inu\'s every day in 2024.', source: 'https://www.coingecko.com/en/coins/dogecoin' },
  { id: 'meme_003', topic: 'The TRUMP memecoin on Solana hit $14 billion FDV at peak', category: 'memecoins', verdict: 'UNCLEAR', truthSummary: 'TRUMP\'s market cap peaked around $14-15B but FDV (counting locked supply) peaked much higher — claim conflates the two.', source: 'https://www.coingecko.com/en/coins/official-trump' },
  { id: 'meme_004', topic: 'PEPE returned over 1000x for early holders in 2024', category: 'memecoins', verdict: 'UNCLEAR', truthSummary: 'Sniper-tier early PEPE buys saw 1000x+ but most "early" holders saw closer to 200-400x peak. Depends on entry.', source: 'https://www.coingecko.com/en/coins/pepe' },
  { id: 'meme_005', topic: 'WIF (Dogwifhat) hit a $5 billion market cap in March 2024', category: 'memecoins', verdict: 'UNCLEAR', truthSummary: 'WIF peaked at roughly $4.5B market cap in late March 2024 — close to but not clearly above $5B.', source: 'https://www.coingecko.com/en/coins/dogwifcoin' },
  { id: 'meme_006', topic: 'BONK was airdropped to Solana NFT holders in December 2022', category: 'memecoins', verdict: 'TRUE', truthSummary: 'BONK launched and airdropped to Solana NFT holders and ecosystem participants on December 25, 2022.', source: 'https://www.bonkcoin.com/' },
  { id: 'meme_007', topic: 'Memecoin volume on Solana exceeded Ethereum in 2024', category: 'memecoins', verdict: 'TRUE', truthSummary: 'Solana decisively dominated memecoin trading volume in 2024, driven by Pump.fun and WIF/BONK/POPCAT activity.', source: 'https://defillama.com/dexs/chains' },
  { id: 'meme_008', topic: 'The MOTHER token tied to Iggy Azalea launched in 2024', category: 'memecoins', verdict: 'TRUE', truthSummary: 'Iggy Azalea launched MOTHER on Solana in May 2024.', source: 'https://www.coingecko.com/en/coins/mother-iggy' },
  { id: 'meme_009', topic: "Murad's supercycle thesis influenced memecoin trading in 2024", category: 'memecoins', verdict: 'TRUE', truthSummary: 'Murad Mahmudov\'s "memecoin supercycle" thesis from Token2049 Singapore 2024 was widely cited and drove notable memecoin allocation strategies.', source: 'https://twitter.com/MustStopMurad' },
  { id: 'meme_010', topic: 'The October 10, 2025 crash wiped out over 80% of memecoin market cap', category: 'memecoins', verdict: 'UNCLEAR', truthSummary: 'There was significant memecoin drawdown in October 2025, but an 80%+ single-day wipeout figure is not independently confirmed.', source: 'https://www.coingecko.com/en/categories/meme-token' },

  // ─── EXCHANGES (10) ─────────────────────────────
  { id: 'cex_001', topic: 'Binance settled with US authorities for $4.3 billion in November 2023', category: 'exchanges', verdict: 'TRUE', truthSummary: 'Binance agreed to a $4.3B settlement with DOJ, FinCEN, OFAC, and CFTC in November 2023.', source: 'https://www.justice.gov/opa/pr/binance-and-ceo-plead-guilty-federal-charges-4b-resolution' },
  { id: 'cex_002', topic: 'CZ pleaded guilty and served 4 months in US federal prison', category: 'exchanges', verdict: 'TRUE', truthSummary: 'Changpeng Zhao pleaded guilty in November 2023, was sentenced to four months, and completed his sentence in September 2024.', source: 'https://www.justice.gov/opa/pr/binance-and-ceo-plead-guilty-federal-charges-4b-resolution' },
  { id: 'cex_003', topic: 'FTX collapsed on November 11, 2022', category: 'exchanges', verdict: 'TRUE', truthSummary: 'FTX filed for Chapter 11 bankruptcy on November 11, 2022.', source: 'https://en.wikipedia.org/wiki/Bankruptcy_of_FTX' },
  { id: 'cex_004', topic: 'Sam Bankman-Fried was sentenced to 25 years in prison in March 2024', category: 'exchanges', verdict: 'TRUE', truthSummary: 'SBF was sentenced to 25 years by Judge Lewis Kaplan on March 28, 2024.', source: 'https://www.justice.gov/usao-sdny/pr/samuel-bankman-fried-sentenced-25-years-prison' },
  { id: 'cex_005', topic: 'Coinbase generated over $1 billion in quarterly revenue multiple times in 2024', category: 'exchanges', verdict: 'TRUE', truthSummary: 'Coinbase reported revenue above $1B in every quarter of 2024 — Q1 $1.6B, Q2 $1.4B, Q3 $1.2B, Q4 $2.3B.', source: 'https://investor.coinbase.com/financials/quarterly-results/' },
  { id: 'cex_006', topic: 'Hyperliquid surpassed Coinbase in derivatives volume in 2024', category: 'exchanges', verdict: 'TRUE', truthSummary: 'Hyperliquid\'s daily perpetuals volume eclipsed Coinbase International Exchange derivatives on multiple days throughout 2024.', source: 'https://stats.hyperliquid.xyz/' },
  { id: 'cex_007', topic: 'Kraken filed confidentially for an IPO in 2025', category: 'exchanges', verdict: 'UNCLEAR', truthSummary: 'Reports in 2025 suggested Kraken was preparing for an IPO; a confidential filing was rumored but not publicly confirmed by the company.', source: 'https://www.kraken.com/' },
  { id: 'cex_008', topic: 'Robinhood Crypto generated over $300M in revenue in Q1 2025', category: 'exchanges', verdict: 'FALSE', truthSummary: 'Robinhood reported Q1 2025 crypto transaction-based revenue of approximately $252M — close to but under $300M.', source: 'https://investors.robinhood.com/news-events/press-releases/detail/1306/robinhood-reports-first-quarter-2025-results' },
  { id: 'cex_009', topic: 'Bybit was hacked for $1.5 billion in February 2025', category: 'exchanges', verdict: 'TRUE', truthSummary: 'Bybit suffered a ~$1.5B exploit on February 21, 2025 — the largest crypto exchange hack ever.', source: 'https://www.theblock.co/post/342036/bybit-hack-1-5-billion' },
  { id: 'cex_010', topic: 'Bitstamp was acquired by Robinhood in 2024', category: 'exchanges', verdict: 'TRUE', truthSummary: 'Robinhood announced the acquisition of Bitstamp in June 2024; the deal closed in 2025.', source: 'https://investors.robinhood.com/news-events/press-releases/detail/1227/robinhood-markets-inc-to-acquire-bitstamp-ltd' },

  // ─── REGULATION (10) ────────────────────────────
  { id: 'reg_001', topic: 'The SEC approved the first US spot Bitcoin ETFs in January 2024', category: 'regulation', verdict: 'TRUE', truthSummary: 'The SEC approved 11 spot Bitcoin ETFs on January 10, 2024; trading began January 11.', source: 'https://www.sec.gov/news/statement/gensler-statement-spot-bitcoin-011023' },
  { id: 'reg_002', topic: 'The SEC approved the first US spot Ethereum ETFs in July 2024', category: 'regulation', verdict: 'TRUE', truthSummary: 'Spot Ethereum ETFs received final approval and began trading on July 23, 2024.', source: 'https://www.sec.gov/news/press-release/2024-58' },
  { id: 'reg_003', topic: 'Gary Gensler stepped down as SEC chair in January 2025', category: 'regulation', verdict: 'TRUE', truthSummary: 'Gensler departed the SEC on January 20, 2025, the day of the Trump inauguration.', source: 'https://www.sec.gov/news/press-release/2024-188' },
  { id: 'reg_004', topic: 'Paul Atkins became the new SEC chair in 2025', category: 'regulation', verdict: 'TRUE', truthSummary: 'Paul Atkins was sworn in as SEC Chair on April 21, 2025 after Senate confirmation.', source: 'https://www.sec.gov/about/commissioners/atkins.htm' },
  { id: 'reg_005', topic: 'The FIT21 crypto market structure bill passed the US House in May 2024', category: 'regulation', verdict: 'TRUE', truthSummary: 'FIT21 (H.R.4763) passed the US House 279-136 on May 22, 2024.', source: 'https://www.congress.gov/bill/118th-congress/house-bill/4763' },
  { id: 'reg_006', topic: 'MiCA stablecoin rules took effect in the EU in June 2024', category: 'regulation', verdict: 'TRUE', truthSummary: 'MiCA\'s stablecoin (e-money / ART) provisions took effect on June 30, 2024.', source: 'https://www.esma.europa.eu/policy-activities/crypto-assets-and-your-investments/markets-crypto-assets-regulation-mica' },
  { id: 'reg_007', topic: 'Ripple won its SEC lawsuit on programmatic XRP sales in July 2023', category: 'regulation', verdict: 'TRUE', truthSummary: 'Judge Analisa Torres ruled on July 13, 2023 that programmatic XRP sales to retail did not constitute securities offerings.', source: 'https://www.sec.gov/litigation/litreleases/lr-25741' },
  { id: 'reg_008', topic: 'IRS Form 1099-DA for crypto reporting starts in 2025', category: 'regulation', verdict: 'TRUE', truthSummary: 'IRS Form 1099-DA broker reporting requirements began for transactions on or after January 1, 2025.', source: 'https://www.irs.gov/forms-pubs/about-form-1099-da' },
  { id: 'reg_009', topic: 'OFAC sanctions against Tornado Cash were partially overturned in 2024', category: 'regulation', verdict: 'TRUE', truthSummary: 'The Fifth Circuit ruled in November 2024 that Tornado Cash\'s immutable smart contracts could not be sanctioned as "property".', source: 'https://www.ca5.uscourts.gov/opinions/pub/23/23-50669-CV0.pdf' },
  { id: 'reg_010', topic: 'Donald Trump signed pro-crypto executive orders in his first 100 days in 2025', category: 'regulation', verdict: 'TRUE', truthSummary: 'Trump signed multiple crypto-related EOs in early 2025, including a strategic Bitcoin reserve and a crypto working group.', source: 'https://www.whitehouse.gov/presidential-actions/2025/01/strengthening-american-leadership-in-digital-financial-technology/' },

  // ─── FOUNDERS (10) ──────────────────────────────
  { id: 'fnd_001', topic: 'Vitalik Buterin co-founded Ethereum in 2013 at age 19', category: 'founders', verdict: 'TRUE', truthSummary: 'Vitalik (born January 31, 1994) published the Ethereum whitepaper in late 2013 at age 19.', source: 'https://en.wikipedia.org/wiki/Vitalik_Buterin' },
  { id: 'fnd_002', topic: 'Justin Sun was named Grenadian ambassador to the WTO in 2021', category: 'founders', verdict: 'TRUE', truthSummary: 'Sun was appointed Grenada\'s Permanent Representative to the WTO in December 2021.', source: 'https://www.reuters.com/world/asia-pacific/tron-founder-justin-sun-named-grenadas-wto-ambassador-2021-12-16/' },
  { id: 'fnd_003', topic: "Saylor's MicroStrategy bought its first Bitcoin in August 2020", category: 'founders', verdict: 'TRUE', truthSummary: 'MicroStrategy announced its first 21,454 BTC purchase on August 11, 2020.', source: 'https://www.strategy.com/press/microstrategy-adopts-bitcoin-as-primary-treasury-reserve-asset_08-11-2020' },
  { id: 'fnd_004', topic: 'Do Kwon was extradited to the US in late 2024 after years in Montenegro', category: 'founders', verdict: 'TRUE', truthSummary: 'Do Kwon was extradited from Montenegro to the United States on December 31, 2024.', source: 'https://www.justice.gov/usao-sdny/pr/do-hyeong-kwon-co-founder-and-former-ceo-terraform-labs-charged-multi-billion-dollar' },
  { id: 'fnd_005', topic: 'Su Zhu of Three Arrows Capital was arrested in Singapore in 2023', category: 'founders', verdict: 'TRUE', truthSummary: 'Su Zhu was arrested at Singapore\'s Changi Airport in September 2023 and sentenced to four months in prison.', source: 'https://www.bloomberg.com/news/articles/2023-09-29/three-arrows-co-founder-zhu-su-arrested-at-singapore-airport' },
  { id: 'fnd_006', topic: 'Caroline Ellison received a 2-year sentence for her role in FTX', category: 'founders', verdict: 'TRUE', truthSummary: 'Caroline Ellison was sentenced to 24 months in federal prison on September 24, 2024.', source: 'https://www.justice.gov/usao-sdny/pr/caroline-ellison-sentenced-two-years-prison-her-role-multibillion-dollar-fraud-schemes' },
  { id: 'fnd_007', topic: 'Anatoly Yakovenko founded Solana in 2017', category: 'founders', verdict: 'TRUE', truthSummary: 'Yakovenko published the Solana whitepaper in November 2017; Solana Labs was incorporated soon after.', source: 'https://solana.com/news/8-innovations-that-make-solana-the-first-web-scale-blockchain' },
  { id: 'fnd_008', topic: "Adam Back's Blockstream raised funds at a $3.2B valuation in 2024", category: 'founders', verdict: 'TRUE', truthSummary: 'Blockstream raised at a $3.2B valuation in a late-2024 funding round.', source: 'https://blockstream.com/' },
  { id: 'fnd_009', topic: 'Jed McCaleb founded Stellar after leaving Ripple in 2014', category: 'founders', verdict: 'TRUE', truthSummary: 'Jed McCaleb left Ripple in 2013 and co-founded the Stellar Development Foundation in July 2014.', source: 'https://stellar.org/foundation' },
  { id: 'fnd_010', topic: 'Cobie co-hosts the Up Only podcast with Ledger', category: 'founders', verdict: 'TRUE', truthSummary: 'Cobie and Ledger co-host UpOnly, one of the most-listened-to crypto podcasts.', source: 'https://uponly.tv/' },

  // ─── HACKS (8) ──────────────────────────────────
  { id: 'hck_001', topic: 'The Bybit hack in February 2025 was the largest in crypto history at $1.5B', category: 'hacks', verdict: 'TRUE', truthSummary: 'The Bybit cold wallet exploit on February 21, 2025 drained ~$1.5B in ETH — the largest crypto exchange hack ever.', source: 'https://www.bybit.com/' },
  { id: 'hck_002', topic: 'The Ronin bridge hack stole $625 million in March 2022', category: 'hacks', verdict: 'TRUE', truthSummary: 'The Ronin Network exploit on March 23, 2022 stole approximately $625M in ETH and USDC.', source: 'https://roninblockchain.substack.com/p/community-alert-ronin-validators' },
  { id: 'hck_003', topic: 'The Lazarus Group from North Korea was attributed to multiple billion-dollar crypto hacks', category: 'hacks', verdict: 'TRUE', truthSummary: 'The FBI and multiple security firms have attributed Ronin, Atomic Wallet, Harmony, and Bybit hacks to the DPRK-linked Lazarus Group.', source: 'https://www.fbi.gov/news/press-releases/fbi-confirms-lazarus-group-cyber-actors-responsible-for-harmonys-horizon-bridge-currency-theft' },
  { id: 'hck_004', topic: 'Curve Finance was hacked for $73 million in July 2023', category: 'hacks', verdict: 'TRUE', truthSummary: 'The Vyper compiler vulnerability used to drain Curve pools on July 30, 2023 resulted in approximately $73M in losses.', source: 'https://www.theblock.co/post/241261/curve-finance-vulnerability-vyper-compiler' },
  { id: 'hck_005', topic: 'The Poly Network hack returned all $610 million in 2021', category: 'hacks', verdict: 'TRUE', truthSummary: 'In August 2021 the Poly Network attacker returned all ~$610M in stolen funds over the following weeks.', source: 'https://www.theblock.co/post/115032/poly-network-hacker' },
  { id: 'hck_006', topic: 'The KuCoin hack of 2020 stole $281 million', category: 'hacks', verdict: 'TRUE', truthSummary: 'The September 2020 KuCoin hot wallet exploit resulted in roughly $281M in losses, much of which was later recovered.', source: 'https://www.kucoin.com/news/en-kucoin-security-incident-update' },
  { id: 'hck_007', topic: 'Euler Finance was hacked for $197 million but had funds returned in 2023', category: 'hacks', verdict: 'TRUE', truthSummary: 'The March 13, 2023 Euler Finance flash-loan exploit drained ~$197M; the attacker returned essentially all funds in April 2023.', source: 'https://www.euler.finance/blog/recovery-of-stolen-funds' },
  { id: 'hck_008', topic: 'Wormhole bridge was hacked for $325 million in February 2022', category: 'hacks', verdict: 'TRUE', truthSummary: 'The Wormhole Solana-Ethereum bridge exploit on February 2, 2022 drained approximately 120k wETH worth ~$325M at the time.', source: 'https://wormhole.com/' },

  // ─── ADOPTION (8) ───────────────────────────────
  { id: 'adp_001', topic: 'Stripe re-enabled crypto payments in 2024 after a 6-year pause', category: 'adoption', verdict: 'TRUE', truthSummary: 'Stripe re-introduced crypto (USDC) payment acceptance in April 2024 after pausing crypto support in 2018.', source: 'https://stripe.com/blog/crypto-payouts' },
  { id: 'adp_002', topic: 'Visa settled over $200 billion in stablecoin payments in 2024', category: 'adoption', verdict: 'UNCLEAR', truthSummary: 'Visa\'s cumulative stablecoin-settled volume reached tens of billions; the $200B+ in a single year (2024) figure is not consistently confirmed.', source: 'https://visaonchainanalytics.com/' },
  { id: 'adp_003', topic: 'Larry Fink publicly endorsed Bitcoin as digital gold in 2024', category: 'adoption', verdict: 'TRUE', truthSummary: 'BlackRock CEO Larry Fink repeatedly called Bitcoin "digital gold" in 2024 CNBC and Bloomberg interviews.', source: 'https://www.cnbc.com/2024/01/12/blackrock-ceo-larry-fink-says-bitcoin-is-digital-gold.html' },
  { id: 'adp_004', topic: 'PayPal launched stablecoin transfers globally in 2024', category: 'adoption', verdict: 'TRUE', truthSummary: 'PayPal expanded PYUSD transfers and international payment availability throughout 2024.', source: 'https://newsroom.paypal-corp.com/' },
  { id: 'adp_005', topic: 'Robinhood added Solana, Cardano, and PEPE to its US listings in 2024', category: 'adoption', verdict: 'UNCLEAR', truthSummary: 'Robinhood expanded its US crypto listings in 2024 — adding SOL and others — but specific timing and the exact PEPE/Cardano inclusion vary by source.', source: 'https://robinhood.com/us/en/about/crypto/' },
  { id: 'adp_006', topic: "Polymarket's 2024 US election volume exceeded $3.7 billion", category: 'adoption', verdict: 'TRUE', truthSummary: 'Polymarket\'s US presidential election market settled with over $3.7B in total trading volume.', source: 'https://polymarket.com/' },
  { id: 'adp_007', topic: 'Argentina President Milei pumped the LIBRA memecoin in February 2025', category: 'adoption', verdict: 'TRUE', truthSummary: 'On February 14, 2025, Milei posted about LIBRA causing a brief pump and subsequent collapse; he later deleted the tweet.', source: 'https://www.reuters.com/world/americas/argentinas-milei-faces-fraud-claims-after-promoting-cryptocurrency-libra-2025-02-15/' },
  { id: 'adp_008', topic: 'Bhutan became one of the largest sovereign Bitcoin holders by 2025', category: 'adoption', verdict: 'TRUE', truthSummary: 'Bhutan was disclosed as holding approximately 13,000 BTC in 2024, making it one of the top sovereign Bitcoin holders by 2025.', source: 'https://www.forbes.com/sites/digital-assets/2024/09/16/bhutan-is-quietly-becoming-a-bitcoin-superpower/' },

  // ─── TOKENS (10) ────────────────────────────────
  { id: 'tok_001', topic: 'HYPE token reached an all-time high above $35 in 2025', category: 'tokens', verdict: 'TRUE', truthSummary: 'HYPE traded above $35 in 2025, reaching new all-time highs after its November 2024 launch.', source: 'https://www.coingecko.com/en/coins/hyperliquid' },
  { id: 'tok_002', topic: 'Ethena (ENA) launched in April 2024', category: 'tokens', verdict: 'TRUE', truthSummary: 'ENA launched and began trading on April 2, 2024.', source: 'https://ethena.fi/' },
  { id: 'tok_003', topic: "ONDO's market cap crossed $5 billion in 2024", category: 'tokens', verdict: 'TRUE', truthSummary: 'ONDO market cap crossed $5B in late 2024, peaking above $6B during the RWA narrative cycle.', source: 'https://www.coingecko.com/en/coins/ondo-finance' },
  { id: 'tok_004', topic: 'AERO became the highest-revenue protocol on Base in 2024', category: 'tokens', verdict: 'TRUE', truthSummary: 'Aerodrome was the dominant DEX on Base and Base\'s top fee-generating protocol throughout most of 2024.', source: 'https://aerodrome.finance/' },
  { id: 'tok_005', topic: "VIRTUAL Protocol's market cap crossed $3 billion in December 2024", category: 'tokens', verdict: 'TRUE', truthSummary: 'VIRTUAL\'s market cap crossed $3B in December 2024 during the AI agents narrative cycle.', source: 'https://www.coingecko.com/en/coins/virtual-protocol' },
  { id: 'tok_006', topic: 'AI16Z launched as an AI agent DAO in late 2024', category: 'tokens', verdict: 'TRUE', truthSummary: 'ai16z (created by Shaw and the Eliza framework community) launched as an AI-agent-led DAO in October 2024.', source: 'https://www.coingecko.com/en/coins/ai16z' },
  { id: 'tok_007', topic: "FARTCOIN's market cap exceeded $1 billion in 2024", category: 'tokens', verdict: 'TRUE', truthSummary: 'FARTCOIN crossed $1B market cap in December 2024.', source: 'https://www.coingecko.com/en/coins/fartcoin' },
  { id: 'tok_008', topic: 'The MOG coin returned over 200x for early holders in 2024', category: 'tokens', verdict: 'TRUE', truthSummary: 'MOG\'s 2024 peak represented multi-hundred-x returns from its 2023 launch price for early entrants.', source: 'https://www.coingecko.com/en/coins/mog-coin' },
  { id: 'tok_009', topic: 'Goatseus Maximus (GOAT) was inspired by an AI agent in 2024', category: 'tokens', verdict: 'TRUE', truthSummary: 'GOAT was inspired by content generated by the Truth Terminal AI agent and launched in October 2024.', source: 'https://truthterminal.wiki/' },
  { id: 'tok_010', topic: 'World Liberty Financial token was associated with the Trump family in 2025', category: 'tokens', verdict: 'TRUE', truthSummary: 'WLFI is publicly associated with the Trump family; multiple Trumps are listed as principals.', source: 'https://worldlibertyfinancial.com/' },

  // ─── ARC / CIRCLE / USDC (17) ───────────────────
  { id: 'arc_001', topic: 'Arc Network uses USDC as its native gas token instead of ETH', category: 'arc', verdict: 'TRUE', truthSummary: 'Arc, Circle\'s L1 blockchain, uses USDC as its native gas/fee token rather than ETH or a separate gas asset.', source: 'https://www.circle.com/blog/introducing-arc' },
  { id: 'arc_002', topic: "Arc's chain ID is 5042002", category: 'arc', verdict: 'TRUE', truthSummary: 'Arc Testnet has chain ID 5042002 (0x4CEF52).', source: 'https://docs.arc.network/' },
  { id: 'arc_003', topic: 'Arc launched its public testnet in 2025 with over 100 institutional partners including BlackRock and Visa', category: 'arc', verdict: 'TRUE', truthSummary: 'Arc\'s public testnet launched in 2025 with a published list of 100+ institutional partners spanning BlackRock, Visa, and other financial institutions.', source: 'https://www.circle.com/blog/arc-public-testnet' },
  { id: 'arc_004', topic: 'Arc uses the Malachite consensus protocol for sub-second deterministic finality', category: 'arc', verdict: 'TRUE', truthSummary: 'Arc uses the Malachite BFT consensus engine (Informal Systems) to deliver sub-second deterministic finality.', source: 'https://docs.arc.network/concepts/consensus' },
  { id: 'arc_005', topic: 'Arc supports ERC-8004 for on-chain AI agent identity registration', category: 'arc', verdict: 'TRUE', truthSummary: 'Arc supports ERC-8004 as a standard for registering on-chain agent identity.', source: 'https://eips.ethereum.org/EIPS/eip-8004' },
  { id: 'arc_006', topic: 'Arc supports ERC-8183 for agentic commerce job contracts', category: 'arc', verdict: 'TRUE', truthSummary: 'Arc adopted ERC-8183 to standardize job/escrow contracts for agentic commerce.', source: 'https://eips.ethereum.org/EIPS/eip-8183' },
  { id: 'arc_007', topic: 'Circle went public on the NYSE under the ticker CRCL in 2025', category: 'arc', verdict: 'TRUE', truthSummary: 'Circle Internet Group (CRCL) IPO\'d on the NYSE in June 2025.', source: 'https://www.nyse.com/quote/XNYS:CRCL' },
  { id: 'arc_008', topic: 'Jeremy Allaire co-founded Circle in 2013', category: 'arc', verdict: 'TRUE', truthSummary: 'Jeremy Allaire and Sean Neville co-founded Circle in October 2013.', source: 'https://www.circle.com/about' },
  { id: 'arc_009', topic: "Circle's CCTP enables native cross-chain USDC transfers without bridges or wrapped tokens", category: 'arc', verdict: 'TRUE', truthSummary: 'CCTP (Cross-Chain Transfer Protocol) burns USDC on the source chain and mints it natively on the destination — no wrapped USDC, no bridge.', source: 'https://www.circle.com/cross-chain-transfer-protocol' },
  { id: 'arc_010', topic: 'Circle Gateway delivers sub-500ms cross-chain USDC transfers via a unified balance', category: 'arc', verdict: 'TRUE', truthSummary: 'Circle Gateway provides a unified-balance model with cross-chain USDC settlement in under 500ms.', source: 'https://www.circle.com/gateway' },
  { id: 'arc_011', topic: "Circle's x402 protocol settles USDC payments as small as $0.000001 between agents", category: 'arc', verdict: 'TRUE', truthSummary: 'Circle\'s x402 protocol is built for sub-cent USDC micropayments between AI agents and APIs, down to $0.000001.', source: 'https://www.x402.org/' },
  { id: 'arc_012', topic: 'Circle launched USYC as a tokenized money market fund', category: 'arc', verdict: 'TRUE', truthSummary: 'USYC is Circle\'s tokenized money market product (acquired from Hashnote in January 2025).', source: 'https://www.circle.com/blog/circle-acquires-hashnote-and-usyc' },
  { id: 'arc_013', topic: 'Circle launched EURC as a regulated Euro stablecoin', category: 'arc', verdict: 'TRUE', truthSummary: 'Circle launched EURC (originally EUROC) in 2022 as a regulated Euro-pegged stablecoin.', source: 'https://www.circle.com/blog/introducing-euro-coin' },
  { id: 'arc_014', topic: 'USDC was first issued by Circle in September 2018', category: 'arc', verdict: 'TRUE', truthSummary: 'USDC launched on September 26, 2018 via the Centre Consortium (Circle and Coinbase).', source: 'https://www.circle.com/blog/introducing-usd-coin' },
  { id: 'arc_015', topic: 'USDC briefly depegged to $0.87 during the Silicon Valley Bank crisis in March 2023', category: 'arc', verdict: 'TRUE', truthSummary: 'USDC depegged to approximately $0.87 on March 11, 2023 after Circle disclosed SVB exposure; it repegged within days.', source: 'https://www.circle.com/blog/an-update-on-usdc-and-silicon-valley-bank' },
  { id: 'arc_016', topic: 'Circle publishes monthly USDC reserve attestations through Deloitte', category: 'arc', verdict: 'TRUE', truthSummary: 'Circle publishes monthly USDC reserve attestations performed by Deloitte (switched from Grant Thornton in 2023).', source: 'https://www.circle.com/transparency' },
  { id: 'arc_017', topic: 'The Circle agents marketplace hosts over 38 services across more than 500 endpoints', category: 'arc', verdict: 'TRUE', truthSummary: 'Circle\'s agents.circle.com marketplace lists 38 services spanning more than 500 endpoints as of late 2025.', source: 'https://agents.circle.com/services' },

  // ─── NEW CHAINS / MONAD / MEGAETH / BERA (11) ───
  { id: 'nc_001', topic: 'Monad launched its mainnet on November 24, 2025', category: 'newchains', verdict: 'TRUE', truthSummary: 'Monad mainnet went live on November 24, 2025.', source: 'https://www.monad.xyz/' },
  { id: 'nc_002', topic: 'Monad raised $244 million in funding led by Paradigm', category: 'newchains', verdict: 'TRUE', truthSummary: 'Monad raised a $244M Series A led by Paradigm in April 2024.', source: 'https://www.paradigm.xyz/2024/04/announcing-our-investment-in-monad' },
  { id: 'nc_003', topic: 'Monad achieves around 10,000 TPS through parallel EVM execution', category: 'newchains', verdict: 'TRUE', truthSummary: 'Monad targets ~10,000 TPS via parallel EVM execution and a deeply-pipelined consensus.', source: 'https://docs.monad.xyz/' },
  { id: 'nc_004', topic: 'The MON token public sale on Coinbase ran from November 17 to 22, 2025', category: 'newchains', verdict: 'UNCLEAR', truthSummary: 'MON had a public sale around its mainnet launch; the exact dates and venue (Coinbase) require independent confirmation.', source: 'https://www.monad.xyz/' },
  { id: 'nc_005', topic: 'Monad was founded in 2022 by veterans from Jump Trading', category: 'newchains', verdict: 'TRUE', truthSummary: 'Monad was founded in 2022 by Keone Hon and other engineers from Jump Trading.', source: 'https://www.monad.xyz/team' },
  { id: 'nc_006', topic: 'MegaETH targets over 100,000 TPS with 10-millisecond block times', category: 'newchains', verdict: 'TRUE', truthSummary: 'MegaETH targets 100,000+ TPS and 10ms block times via its real-time L2 architecture.', source: 'https://megaeth.com/' },
  { id: 'nc_007', topic: "MegaETH's public token sale raised over $670 million by late October 2025", category: 'newchains', verdict: 'UNCLEAR', truthSummary: 'MegaETH ran a public token sale in 2025; precise $670M+ amount by October needs independent confirmation.', source: 'https://megaeth.com/' },
  { id: 'nc_008', topic: 'MegaETH is publicly backed by Vitalik Buterin and Joseph Lubin', category: 'newchains', verdict: 'TRUE', truthSummary: 'Vitalik Buterin and Joseph Lubin are both publicly listed as backers/investors in MegaETH.', source: 'https://megaeth.com/' },
  { id: 'nc_009', topic: 'Berachain launched its mainnet on February 6, 2025', category: 'newchains', verdict: 'TRUE', truthSummary: 'Berachain mainnet went live on February 6, 2025 alongside the BERA token launch.', source: 'https://www.berachain.com/' },
  { id: 'nc_010', topic: "Berachain's Proof-of-Liquidity consensus rewards LPs instead of pure stakers", category: 'newchains', verdict: 'TRUE', truthSummary: 'Berachain\'s Proof-of-Liquidity model directs validator rewards to liquidity providers rather than pure BERA stakers.', source: 'https://docs.berachain.com/learn/what-is-proof-of-liquidity' },
  { id: 'nc_011', topic: 'Hyperliquid launched HyperEVM as its programmable layer in 2025', category: 'newchains', verdict: 'TRUE', truthSummary: 'HyperEVM launched on Hyperliquid mainnet in February 2025 as the programmable smart-contract layer.', source: 'https://hyperliquid.xyz/' },

  // ─── CT CULTURE / KOLs / DRAMA (8) ──────────────
  { id: 'cul_001', topic: 'Murad popularized the "memecoin supercycle" thesis throughout 2024', category: 'culture', verdict: 'TRUE', truthSummary: 'Murad Mahmudov\'s "memecoin supercycle" framing from Token2049 Singapore 2024 became a widely cited investment thesis.', source: 'https://twitter.com/MustStopMurad' },
  { id: 'cul_002', topic: 'The TRUMP memecoin launched on Solana three days before his second inauguration', category: 'culture', verdict: 'TRUE', truthSummary: 'OFFICIAL TRUMP launched on Solana on January 17, 2025 — three days before the January 20 inauguration.', source: 'https://www.coingecko.com/en/coins/official-trump' },
  { id: 'cul_003', topic: 'The "gm" greeting became a signature daily ritual of Crypto Twitter', category: 'culture', verdict: 'TRUE', truthSummary: '"gm" (good morning) became one of the most-used daily greetings on Crypto Twitter from 2021 onward.', source: 'https://en.wiktionary.org/wiki/gm#Internet_slang' },
  { id: 'cul_004', topic: "Argentina's Milei deleted his LIBRA memecoin tweet shortly after the token collapsed", category: 'culture', verdict: 'TRUE', truthSummary: 'President Milei deleted his LIBRA promotion tweet on February 14-15, 2025 after the token collapsed shortly after launch.', source: 'https://www.reuters.com/world/americas/argentinas-milei-faces-fraud-claims-after-promoting-cryptocurrency-libra-2025-02-15/' },
  { id: 'cul_005', topic: 'Caroline Ellison testified against Sam Bankman-Fried during his FTX trial in October 2023', category: 'culture', verdict: 'TRUE', truthSummary: 'Ellison was the prosecution\'s star witness, testifying over multiple days in October 2023 against SBF.', source: 'https://www.justice.gov/usao-sdny/pr/samuel-bankman-fried-found-guilty-seven-counts-criminal-trial' },
  { id: 'cul_006', topic: 'Pump.fun launched its PUMP token via airdrop in 2025', category: 'culture', verdict: 'TRUE', truthSummary: 'Pump.fun launched the PUMP token in 2025 via a combination of public sale and airdrop to active users.', source: 'https://pump.fun/' },
  { id: 'cul_007', topic: 'ZachXBT is one of the most well-known on-chain investigators on Crypto Twitter', category: 'culture', verdict: 'TRUE', truthSummary: 'ZachXBT is widely recognized as crypto\'s leading independent on-chain investigative analyst.', source: 'https://twitter.com/zachxbt' },
  { id: 'cul_008', topic: 'The Iggy Azalea MOTHER token launched on Solana in 2024', category: 'culture', verdict: 'TRUE', truthSummary: 'MOTHER, promoted by Iggy Azalea, launched on Solana in May 2024.', source: 'https://www.coingecko.com/en/coins/mother-iggy' },
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
// /api/round/start calls getRoundTopic() and destructures { topic, source, url,
// verdict?, truthSummary?, truthSource? }. When the picked entry is pre-
// verified, those last three are populated so the route can skip fetchTruth.

export type RoundTopic = {
  topic: string
  source: 'twitter' | 'trends' | 'pool'
  url?: string
  // Forwarded from the pool entry when present.
  verdict?: Verdict
  truthSummary?: string
  truthSource?: string
}

export async function getRoundTopic(): Promise<RoundTopic> {
  const picked = pickTopic()
  return {
    topic: picked.topic,
    source: 'pool',
    verdict: picked.verdict,
    truthSummary: picked.truthSummary,
    truthSource: picked.source,
  }
}
