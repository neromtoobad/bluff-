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
  { id: 'eth_004', topic: 'Vitalik Buterin personally owns less than 250,000 ETH', category: 'ethereum', verdict: 'TRUE', truthSummary: 'Vitalik\'s known wallets hold ~240,000-250,000 ETH per public on-chain analyses; he has stated he owns less than 0.3% of supply.', source: 'https://etherscan.io/address/0xab5801a7d398351b8be11c439e05c5b3259aec9b' },
  { id: 'eth_005', topic: 'Ethereum mainnet processes roughly 1 million transactions per day', category: 'ethereum', verdict: 'TRUE', truthSummary: 'Ethereum L1 has averaged 1.0-1.2M transactions per day through 2024-2025.', source: 'https://etherscan.io/chart/tx' },
  { id: 'eth_006', topic: 'Lido controls roughly 30% of all staked ETH', category: 'ethereum', verdict: 'TRUE', truthSummary: 'Lido\'s share of staked ETH has hovered around 28-30% through 2024-2025, down from a 32% peak.', source: 'https://dune.com/hildobby/eth2-staking' },
  { id: 'eth_007', topic: 'The Pectra upgrade launched on Ethereum in 2025', category: 'ethereum', verdict: 'TRUE', truthSummary: 'The Pectra hard fork activated on Ethereum mainnet on May 7, 2025.', source: 'https://blog.ethereum.org/2025/05/07/pectra-mainnet' },
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
  { id: 'sol_008', topic: 'Pump.fun launched on Solana in January 2024', category: 'solana', verdict: 'TRUE', truthSummary: 'Pump.fun launched on Solana in mid-January 2024 and quickly became the dominant token launchpad.', source: 'https://pump.fun/' },
  { id: 'sol_009', topic: 'Solana DEX volume surpassed Ethereum DEX volume multiple times in 2024', category: 'solana', verdict: 'TRUE', truthSummary: 'Solana DEX volume exceeded Ethereum\'s on numerous days throughout 2024, driven by Jupiter, Raydium, and memecoin activity.', source: 'https://defillama.com/dexs/chains' },
  { id: 'sol_011', topic: 'Jito MEV rewards distributed over $200M to Solana stakers in 2024', category: 'solana', verdict: 'TRUE', truthSummary: 'Jito\'s MEV tip distributions to validators and stakers exceeded $200M (and reached roughly $300M+) in 2024.', source: 'https://jito.network/' },

  // ─── STABLECOINS (12) ───────────────────────────
  { id: 'stb_001', topic: "Tether's market cap surpassed $140 billion in 2025", category: 'stablecoins', verdict: 'TRUE', truthSummary: 'USDT\'s circulating supply crossed $140B in 2025, making Tether the dominant stablecoin issuer.', source: 'https://www.coingecko.com/en/coins/tether' },
  { id: 'stb_002', topic: "USDC's market cap recovered above $60 billion by mid-2025", category: 'stablecoins', verdict: 'TRUE', truthSummary: 'USDC supply recovered to above $60B by mid-2025, up from a low of ~$24B after the SVB depeg.', source: 'https://www.coingecko.com/en/coins/usd-coin' },
  { id: 'stb_003', topic: 'Stablecoins settled more than $10 trillion in total volume in 2024', category: 'stablecoins', verdict: 'TRUE', truthSummary: 'Adjusted stablecoin settlement volume in 2024 exceeded $10T (and unadjusted gross volume exceeded $27T per Visa Onchain Analytics).', source: 'https://visaonchainanalytics.com/' },
  { id: 'stb_004', topic: 'Tether held over $97 billion in US Treasuries by mid-2024', category: 'stablecoins', verdict: 'TRUE', truthSummary: 'Tether\'s Q2 2024 attestation reported direct/indirect US Treasury exposure of approximately $97.6B.', source: 'https://tether.to/en/transparency' },
  { id: 'stb_005', topic: 'The GENIUS Act regulating stablecoins passed Congress in 2025', category: 'stablecoins', verdict: 'TRUE', truthSummary: 'The GENIUS Act passed the Senate in June 2025 and was signed into law on July 18, 2025.', source: 'https://www.congress.gov/bill/119th-congress/senate-bill/394' },
  { id: 'stb_006', topic: "Circle's IPO valued the company above $10 billion in 2025", category: 'stablecoins', verdict: 'TRUE', truthSummary: 'Circle (CRCL) IPO\'d on NYSE in June 2025 at a ~$8B initial valuation; CRCL traded above a $10B market cap within days.', source: 'https://www.nyse.com/quote/XNYS:CRCL' },
  { id: 'stb_007', topic: "PayPal's PYUSD stablecoin supply stayed under $1 billion in 2024", category: 'stablecoins', verdict: 'TRUE', truthSummary: 'PYUSD supply hovered between $250M and $900M throughout 2024 — never crossed $1B.', source: 'https://www.coingecko.com/en/coins/paypal-usd' },
  { id: 'stb_008', topic: 'USDT volume on Tron exceeds USDT volume on Ethereum', category: 'stablecoins', verdict: 'TRUE', truthSummary: 'Tron has consistently surpassed Ethereum in USDT transfer volume, driven by lower fees and emerging-market remittance flows.', source: 'https://defillama.com/stablecoins' },
  { id: 'stb_010', topic: "Ethena's USDe synthetic dollar reached $5 billion supply in 2024", category: 'stablecoins', verdict: 'TRUE', truthSummary: 'Ethena\'s USDe supply crossed $5B in 2024, making it the third-largest stablecoin by some measures.', source: 'https://ethena.fi/' },
  { id: 'stb_011', topic: "BlackRock's BUIDL became the largest tokenized US Treasury fund in 2024", category: 'stablecoins', verdict: 'TRUE', truthSummary: 'BUIDL surpassed Franklin Templeton\'s FOBXX and Ondo\'s OUSG in 2024 to become the largest tokenized Treasury product on-chain.', source: 'https://app.rwa.xyz/treasuries' },
  { id: 'stb_012', topic: 'World Liberty Financial launched a stablecoin in 2025', category: 'stablecoins', verdict: 'TRUE', truthSummary: 'World Liberty Financial (Trump-affiliated) launched the USD1 stablecoin in March 2025.', source: 'https://worldlibertyfinancial.com/' },

  // ─── LAYER 2 (12) ───────────────────────────────
  { id: 'l2_001', topic: 'Base became the #1 L2 by daily active users in 2024', category: 'layer2', verdict: 'TRUE', truthSummary: 'Base led all Ethereum L2s in daily active addresses for most of 2024, often by a wide margin.', source: 'https://l2beat.com/scaling/activity' },
  { id: 'l2_002', topic: 'Arbitrum had the highest TVL of any L2 throughout 2024', category: 'layer2', verdict: 'TRUE', truthSummary: 'Arbitrum held the #1 spot for L2 TVL through 2024, peaking above $18B.', source: 'https://l2beat.com/scaling/tvl' },
  { id: 'l2_004', topic: 'Linea launched its token airdrop in 2025', category: 'layer2', verdict: 'TRUE', truthSummary: 'Linea announced its LINEA token and airdrop in 2025; the public claim opened in September 2025.', source: 'https://linea.build/' },
  { id: 'l2_006', topic: "ZKsync's 2024 airdrop distributed tokens to over 600,000 wallets", category: 'layer2', verdict: 'TRUE', truthSummary: 'ZK airdrop went to approximately 695,000 eligible wallets in June 2024.', source: 'https://zksync.io/' },
  { id: 'l2_007', topic: "Polygon's POL token replaced MATIC as the native token in 2024", category: 'layer2', verdict: 'TRUE', truthSummary: 'The POL migration began September 4, 2024, replacing MATIC as the native staking and gas token.', source: 'https://polygon.technology/blog/save-the-date-pol-migration-coming-on-september-4th' },
  { id: 'l2_008', topic: 'Scroll mainnet launched in October 2023', category: 'layer2', verdict: 'TRUE', truthSummary: 'Scroll launched its zkEVM mainnet on October 17, 2023.', source: 'https://scroll.io/blog/scaling-ethereum-mainnet' },
  { id: 'l2_009', topic: 'Blast accumulated over $2 billion in TVL before its mainnet launch', category: 'layer2', verdict: 'TRUE', truthSummary: 'Blast deposits exceeded $2B during its pre-launch bridge phase, hitting mainnet in February 2024.', source: 'https://blast.io/' },
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
  { id: 'defi_010', topic: 'Curve Finance recovered after the 2023 founder loan crisis', category: 'defi', verdict: 'TRUE', truthSummary: 'Curve survived the July 2023 Vyper exploit and Egorov\'s overleveraged CRV-backed loan situation; the protocol continued operating.', source: 'https://curve.fi/' },

  // ─── NFTS (8) ───────────────────────────────────
  { id: 'nft_001', topic: "Bored Ape Yacht Club's floor dropped below 10 ETH in 2024", category: 'nfts', verdict: 'TRUE', truthSummary: 'BAYC floor price fell below 10 ETH in mid-2024, down from the 100+ ETH peak of 2022.', source: 'https://opensea.io/collection/boredapeyachtclub' },
  { id: 'nft_002', topic: 'NFT trading volume in 2024 was less than 10% of its 2022 peak', category: 'nfts', verdict: 'TRUE', truthSummary: 'Monthly NFT volume averaged $200-400M in 2024 vs ~$5B+ at the 2022 peak — well below 10%.', source: 'https://dune.com/hildobby/NFTs' },
  { id: 'nft_003', topic: "CryptoPunks' floor touched below 30 ETH in 2025", category: 'nfts', verdict: 'TRUE', truthSummary: 'The CryptoPunks floor dipped under 30 ETH at various points in 2025, down from a 100+ ETH peak.', source: 'https://opensea.io/collection/cryptopunks' },
  { id: 'nft_004', topic: 'Pudgy Penguins surpassed Bored Apes in floor price in 2024', category: 'nfts', verdict: 'TRUE', truthSummary: 'Pudgy Penguins\' floor (~16 ETH) overtook BAYC (~13 ETH) at multiple points in 2024.', source: 'https://opensea.io/collection/pudgypenguins' },
  { id: 'nft_005', topic: "OpenSea's NFT volume was overtaken by Blur in 2023", category: 'nfts', verdict: 'TRUE', truthSummary: 'Blur surpassed OpenSea in NFT trading volume shortly after its February 2023 launch and dominated through most of 2023.', source: 'https://dune.com/hildobby/NFTs' },
  { id: 'nft_006', topic: "Beeple's Everydays sold for $69 million as the most expensive NFT ever", category: 'nfts', verdict: 'TRUE', truthSummary: 'Beeple\'s "Everydays: The First 5000 Days" sold at Christie\'s for $69.3M in March 2021 — still the highest single-piece NFT auction sale.', source: 'https://onlineonly.christies.com/s/beeple-first-5000-days/beeple-b-1981-1/112924' },
  { id: 'nft_007', topic: 'Magic Eden launched its ME token in late 2024', category: 'nfts', verdict: 'TRUE', truthSummary: 'Magic Eden launched the ME token via airdrop and TGE on December 10, 2024.', source: 'https://magiceden.io/' },

  // ─── MEMECOINS (10) ─────────────────────────────
  { id: 'meme_001', topic: 'Pump.fun generated over $700 million in fees by mid-2025', category: 'memecoins', verdict: 'TRUE', truthSummary: 'Pump.fun\'s cumulative fee revenue crossed $700M in mid-2025, making it one of the highest-revenue apps in crypto.', source: 'https://dune.com/hashed_official/pump-fun' },
  { id: 'meme_002', topic: "DOGE's market cap stayed above SHIB's throughout 2024", category: 'memecoins', verdict: 'TRUE', truthSummary: 'Dogecoin\'s market cap remained larger than Shiba Inu\'s every day in 2024.', source: 'https://www.coingecko.com/en/coins/dogecoin' },
  { id: 'meme_006', topic: 'BONK was airdropped to Solana NFT holders in December 2022', category: 'memecoins', verdict: 'TRUE', truthSummary: 'BONK launched and airdropped to Solana NFT holders and ecosystem participants on December 25, 2022.', source: 'https://www.bonkcoin.com/' },
  { id: 'meme_007', topic: 'Memecoin volume on Solana exceeded Ethereum in 2024', category: 'memecoins', verdict: 'TRUE', truthSummary: 'Solana decisively dominated memecoin trading volume in 2024, driven by Pump.fun and WIF/BONK/POPCAT activity.', source: 'https://defillama.com/dexs/chains' },
  { id: 'meme_008', topic: 'The MOTHER token tied to Iggy Azalea launched in 2024', category: 'memecoins', verdict: 'TRUE', truthSummary: 'Iggy Azalea launched MOTHER on Solana in May 2024.', source: 'https://www.coingecko.com/en/coins/mother-iggy' },
  { id: 'meme_009', topic: "Murad's supercycle thesis influenced memecoin trading in 2024", category: 'memecoins', verdict: 'TRUE', truthSummary: 'Murad Mahmudov\'s "memecoin supercycle" thesis from Token2049 Singapore 2024 was widely cited and drove notable memecoin allocation strategies.', source: 'https://twitter.com/MustStopMurad' },

  // ─── EXCHANGES (10) ─────────────────────────────
  { id: 'cex_001', topic: 'Binance settled with US authorities for $4.3 billion in November 2023', category: 'exchanges', verdict: 'TRUE', truthSummary: 'Binance agreed to a $4.3B settlement with DOJ, FinCEN, OFAC, and CFTC in November 2023.', source: 'https://www.justice.gov/opa/pr/binance-and-ceo-plead-guilty-federal-charges-4b-resolution' },
  { id: 'cex_002', topic: 'CZ pleaded guilty and served 4 months in US federal prison', category: 'exchanges', verdict: 'TRUE', truthSummary: 'Changpeng Zhao pleaded guilty in November 2023, was sentenced to four months, and completed his sentence in September 2024.', source: 'https://www.justice.gov/opa/pr/binance-and-ceo-plead-guilty-federal-charges-4b-resolution' },
  { id: 'cex_003', topic: 'FTX collapsed on November 11, 2022', category: 'exchanges', verdict: 'TRUE', truthSummary: 'FTX filed for Chapter 11 bankruptcy on November 11, 2022.', source: 'https://en.wikipedia.org/wiki/Bankruptcy_of_FTX' },
  { id: 'cex_004', topic: 'Sam Bankman-Fried was sentenced to 25 years in prison in March 2024', category: 'exchanges', verdict: 'TRUE', truthSummary: 'SBF was sentenced to 25 years by Judge Lewis Kaplan on March 28, 2024.', source: 'https://www.justice.gov/usao-sdny/pr/samuel-bankman-fried-sentenced-25-years-prison' },
  { id: 'cex_005', topic: 'Coinbase generated over $1 billion in quarterly revenue multiple times in 2024', category: 'exchanges', verdict: 'TRUE', truthSummary: 'Coinbase reported revenue above $1B in every quarter of 2024 — Q1 $1.6B, Q2 $1.4B, Q3 $1.2B, Q4 $2.3B.', source: 'https://investor.coinbase.com/financials/quarterly-results/' },
  { id: 'cex_006', topic: 'Hyperliquid surpassed Coinbase in derivatives volume in 2024', category: 'exchanges', verdict: 'TRUE', truthSummary: 'Hyperliquid\'s daily perpetuals volume eclipsed Coinbase International Exchange derivatives on multiple days throughout 2024.', source: 'https://stats.hyperliquid.xyz/' },
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
  { id: 'adp_003', topic: 'Larry Fink publicly endorsed Bitcoin as digital gold in 2024', category: 'adoption', verdict: 'TRUE', truthSummary: 'BlackRock CEO Larry Fink repeatedly called Bitcoin "digital gold" in 2024 CNBC and Bloomberg interviews.', source: 'https://www.cnbc.com/2024/01/12/blackrock-ceo-larry-fink-says-bitcoin-is-digital-gold.html' },
  { id: 'adp_004', topic: 'PayPal launched stablecoin transfers globally in 2024', category: 'adoption', verdict: 'TRUE', truthSummary: 'PayPal expanded PYUSD transfers and international payment availability throughout 2024.', source: 'https://newsroom.paypal-corp.com/' },
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
  { id: 'nc_005', topic: 'Monad was founded in 2022 by veterans from Jump Trading', category: 'newchains', verdict: 'TRUE', truthSummary: 'Monad was founded in 2022 by Keone Hon and other engineers from Jump Trading.', source: 'https://www.monad.xyz/team' },
  { id: 'nc_006', topic: 'MegaETH targets over 100,000 TPS with 10-millisecond block times', category: 'newchains', verdict: 'TRUE', truthSummary: 'MegaETH targets 100,000+ TPS and 10ms block times via its real-time L2 architecture.', source: 'https://megaeth.com/' },
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

  // ─── DELIBERATELY FALSE — BITCOIN (15) ──────────
  { id: 'btc_f001', topic: 'Bitcoin was created in 2007 by Satoshi Nakamoto', category: 'bitcoin', verdict: 'FALSE', truthSummary: 'The Bitcoin whitepaper was published in October 2008 and the genesis block was mined on January 3, 2009 — not 2007.', source: 'https://bitcoin.org/bitcoin.pdf' },
  { id: 'btc_f002', topic: "Bitcoin's max supply is 22 million coins", category: 'bitcoin', verdict: 'FALSE', truthSummary: 'Bitcoin\'s hard cap is 21 million coins, encoded in the protocol.', source: 'https://en.bitcoin.it/wiki/Controlled_supply' },
  { id: 'btc_f003', topic: 'The 2024 Bitcoin halving cut block rewards from 12.5 to 6.25 BTC', category: 'bitcoin', verdict: 'FALSE', truthSummary: 'The 2024 halving cut rewards from 6.25 to 3.125 BTC. The 12.5→6.25 cut happened in May 2020.', source: 'https://en.wikipedia.org/wiki/Bitcoin#Halving' },
  { id: 'btc_f004', topic: "El Salvador's Bitcoin Law was passed in 2019", category: 'bitcoin', verdict: 'FALSE', truthSummary: 'El Salvador\'s Bitcoin Law was passed in June 2021 and took effect on September 7, 2021.', source: 'https://en.wikipedia.org/wiki/Bitcoin_in_El_Salvador' },
  { id: 'btc_f005', topic: "Bitcoin's first halving happened in 2010", category: 'bitcoin', verdict: 'FALSE', truthSummary: 'The first halving occurred on November 28, 2012, dropping the subsidy from 50 to 25 BTC.', source: 'https://en.wikipedia.org/wiki/Bitcoin#Halving' },
  { id: 'btc_f006', topic: 'The Mt. Gox hack occurred in 2018', category: 'bitcoin', verdict: 'FALSE', truthSummary: 'Mt. Gox collapsed in February 2014 after losing roughly 850,000 BTC to long-running thefts.', source: 'https://en.wikipedia.org/wiki/Mt._Gox' },
  { id: 'btc_f007', topic: "Bitcoin's genesis block was mined in 2010", category: 'bitcoin', verdict: 'FALSE', truthSummary: 'The genesis block (block 0) was mined by Satoshi on January 3, 2009.', source: 'https://en.bitcoin.it/wiki/Genesis_block' },
  { id: 'btc_f008', topic: "BlackRock's IBIT spot ETF launched in 2023", category: 'bitcoin', verdict: 'FALSE', truthSummary: 'IBIT began trading on January 11, 2024 after the SEC approved spot Bitcoin ETFs on January 10.', source: 'https://www.blackrock.com/us/individual/products/333011/ishares-bitcoin-trust' },
  { id: 'btc_f009', topic: 'Bitcoin uses Proof-of-Stake consensus', category: 'bitcoin', verdict: 'FALSE', truthSummary: 'Bitcoin uses Proof-of-Work — miners expend computational energy to find valid block hashes.', source: 'https://bitcoin.org/bitcoin.pdf' },
  { id: 'btc_f010', topic: "Satoshi Nakamoto's identity was publicly revealed in 2017", category: 'bitcoin', verdict: 'FALSE', truthSummary: 'Satoshi Nakamoto\'s true identity has never been publicly verified. Several claims exist but none confirmed.', source: 'https://en.wikipedia.org/wiki/Satoshi_Nakamoto' },
  { id: 'btc_f011', topic: 'The Bitcoin whitepaper is 31 pages long', category: 'bitcoin', verdict: 'FALSE', truthSummary: 'The Bitcoin whitepaper is 9 pages long, including references.', source: 'https://bitcoin.org/bitcoin.pdf' },
  { id: 'btc_f012', topic: 'Bitcoin Pizza Day commemorates a 5,000 BTC purchase', category: 'bitcoin', verdict: 'FALSE', truthSummary: 'Bitcoin Pizza Day commemorates Laszlo Hanyecz buying two pizzas for 10,000 BTC on May 22, 2010.', source: 'https://en.bitcoin.it/wiki/Laszlo_Hanyecz' },
  { id: 'btc_f013', topic: 'The 2020 Bitcoin halving reduced rewards to 12.5 BTC', category: 'bitcoin', verdict: 'FALSE', truthSummary: 'The May 2020 halving reduced rewards from 12.5 BTC to 6.25 BTC.', source: 'https://en.wikipedia.org/wiki/Bitcoin#Halving' },
  { id: 'btc_f014', topic: 'China banned Bitcoin mining in 2017', category: 'bitcoin', verdict: 'FALSE', truthSummary: 'China banned crypto mining and trading in 2021. The 2017 action was an ICO/exchange crackdown.', source: 'https://www.reuters.com/world/china/china-central-bank-vows-crackdown-cryptocurrency-trading-2021-09-24/' },
  { id: 'btc_f015', topic: "Bitcoin's block time targets 1 minute", category: 'bitcoin', verdict: 'FALSE', truthSummary: 'Bitcoin\'s difficulty adjusts to maintain an average block time of 10 minutes.', source: 'https://en.bitcoin.it/wiki/Block_timestamp' },

  // ─── DELIBERATELY FALSE — ETHEREUM (15) ─────────
  { id: 'eth_f001', topic: "Ethereum's Merge to Proof-of-Stake happened in 2021", category: 'ethereum', verdict: 'FALSE', truthSummary: 'The Merge transitioned Ethereum from PoW to PoS on September 15, 2022.', source: 'https://blog.ethereum.org/2022/09/15/merge-mainnet-ready' },
  { id: 'eth_f002', topic: 'Vitalik Buterin founded Ethereum alone', category: 'ethereum', verdict: 'FALSE', truthSummary: 'Ethereum was co-founded by Vitalik Buterin with Gavin Wood, Joseph Lubin, Charles Hoskinson, and several others.', source: 'https://en.wikipedia.org/wiki/Ethereum' },
  { id: 'eth_f003', topic: 'Ethereum mainnet launched in 2013', category: 'ethereum', verdict: 'FALSE', truthSummary: 'Ethereum mainnet (Frontier) launched on July 30, 2015. The whitepaper was 2013.', source: 'https://blog.ethereum.org/2015/07/30/ethereum-launches' },
  { id: 'eth_f004', topic: 'The Dencun upgrade activated in 2023', category: 'ethereum', verdict: 'FALSE', truthSummary: 'Dencun activated on Ethereum mainnet on March 13, 2024 (EIP-4844 blobs).', source: 'https://blog.ethereum.org/2024/02/27/dencun-mainnet-announcement' },
  { id: 'eth_f005', topic: "Ethereum's London upgrade introduced Proof-of-Stake", category: 'ethereum', verdict: 'FALSE', truthSummary: 'London (August 2021) introduced EIP-1559 fee burn. Proof-of-Stake came with the Merge in September 2022.', source: 'https://ethereum.org/en/history/' },
  { id: 'eth_f006', topic: 'The DAO hack happened in 2014', category: 'ethereum', verdict: 'FALSE', truthSummary: 'The DAO hack drained 3.6M ETH in June 2016, leading to the Ethereum/Ethereum Classic chain split.', source: 'https://en.wikipedia.org/wiki/The_DAO_(organization)' },
  { id: 'eth_f007', topic: 'Ethereum Classic was created before Ethereum', category: 'ethereum', verdict: 'FALSE', truthSummary: 'Ethereum Classic is the original (unforked) chain post-DAO incident in July 2016. Ethereum launched in 2015.', source: 'https://ethereumclassic.org/' },
  { id: 'eth_f008', topic: 'EIP-1559 was activated in 2020', category: 'ethereum', verdict: 'FALSE', truthSummary: 'EIP-1559 (base fee burn) activated as part of the London hard fork on August 5, 2021.', source: 'https://eips.ethereum.org/EIPS/eip-1559' },
  { id: 'eth_f009', topic: 'Ethereum gas fees are denominated directly in dollars', category: 'ethereum', verdict: 'FALSE', truthSummary: 'Gas is denominated in gwei (10⁻⁹ ETH). The dollar cost depends on ETH price.', source: 'https://ethereum.org/en/developers/docs/gas/' },
  { id: 'eth_f010', topic: "The Pectra upgrade raised the max validator stake to 64 ETH", category: 'ethereum', verdict: 'FALSE', truthSummary: 'Pectra\'s EIP-7251 raised the max effective balance from 32 to 2048 ETH (not 64).', source: 'https://eips.ethereum.org/EIPS/eip-7251' },
  { id: 'eth_f011', topic: 'Vitalik Buterin was born in the United States', category: 'ethereum', verdict: 'FALSE', truthSummary: 'Vitalik Buterin was born in Russia in 1994 and moved to Canada with his family as a child.', source: 'https://en.wikipedia.org/wiki/Vitalik_Buterin' },
  { id: 'eth_f012', topic: "Ethereum's block time is 30 seconds", category: 'ethereum', verdict: 'FALSE', truthSummary: 'Ethereum slots are 12 seconds. Pre-Merge block time was ~13-15 seconds.', source: 'https://ethereum.org/en/developers/docs/blocks/' },
  { id: 'eth_f013', topic: 'The Beacon Chain genesis happened in 2021', category: 'ethereum', verdict: 'FALSE', truthSummary: 'The Beacon Chain went live at genesis on December 1, 2020.', source: 'https://ethereum.org/en/roadmap/beacon-chain/' },
  { id: 'eth_f014', topic: 'The Shanghai upgrade enabled staking withdrawals in 2024', category: 'ethereum', verdict: 'FALSE', truthSummary: 'Shanghai/Capella activated April 12, 2023, enabling validator withdrawals.', source: 'https://blog.ethereum.org/2023/03/28/shapella-mainnet-announcement' },
  { id: 'eth_f015', topic: 'Ethereum has a hard cap of 100 million ETH', category: 'ethereum', verdict: 'FALSE', truthSummary: 'Ethereum has no hard cap on total supply. Issuance and burns determine net supply changes.', source: 'https://ultrasound.money/' },

  // ─── DELIBERATELY FALSE — SOLANA (12) ───────────
  { id: 'sol_f001', topic: 'Solana mainnet launched in 2017', category: 'solana', verdict: 'FALSE', truthSummary: 'Solana mainnet-beta launched on March 16, 2020. The whitepaper was 2017.', source: 'https://solana.com/news/solana-mainnet-beta' },
  { id: 'sol_f002', topic: "Solana's all-time high price was $400", category: 'solana', verdict: 'FALSE', truthSummary: 'SOL\'s all-time high was approximately $295 in January 2025.', source: 'https://www.coingecko.com/en/coins/solana' },
  { id: 'sol_f003', topic: 'Solana uses Proof-of-Work consensus', category: 'solana', verdict: 'FALSE', truthSummary: 'Solana uses Delegated Proof-of-Stake combined with Proof-of-History for ordering.', source: 'https://docs.solana.com/cluster/overview' },
  { id: 'sol_f004', topic: 'Anatoly Yakovenko previously worked at Google', category: 'solana', verdict: 'FALSE', truthSummary: 'Yakovenko was an engineer at Qualcomm before founding Solana.', source: 'https://www.linkedin.com/in/anatoly-yakovenko-572b2810/' },
  { id: 'sol_f005', topic: "Solana's slot time is 1 second", category: 'solana', verdict: 'FALSE', truthSummary: 'Solana\'s slot time is approximately 400 milliseconds.', source: 'https://docs.solana.com/cluster/overview' },
  { id: 'sol_f006', topic: 'Pump.fun launched on Ethereum first', category: 'solana', verdict: 'FALSE', truthSummary: 'Pump.fun launched on Solana in January 2024. Expansion to other chains came later.', source: 'https://pump.fun/' },
  { id: 'sol_f007', topic: 'Phantom is the official wallet built by Solana Labs', category: 'solana', verdict: 'FALSE', truthSummary: 'Phantom is an independent company founded by Brandon Millman, Chris Kalani, and Francesco Agosti, not Solana Labs.', source: 'https://phantom.app/about-us' },
  { id: 'sol_f008', topic: "Solana's average transaction fee is around $1", category: 'solana', verdict: 'FALSE', truthSummary: 'Solana transaction fees average around 5,000 lamports (~$0.0001-0.001), far below a cent.', source: 'https://docs.solana.com/transaction_fees' },
  { id: 'sol_f009', topic: "Jito's JTO airdrop happened in 2024", category: 'solana', verdict: 'FALSE', truthSummary: 'Jito airdropped the JTO token on December 7, 2023.', source: 'https://www.jito.network/' },
  { id: 'sol_f010', topic: 'Solana has a fixed total supply with no inflation', category: 'solana', verdict: 'FALSE', truthSummary: 'Solana is inflationary, with a disinflationary curve starting at ~8% and tapering toward 1.5%.', source: 'https://docs.solana.com/inflation/inflation_schedule' },
  { id: 'sol_f011', topic: 'Solana had 10 full network outages in 2024', category: 'solana', verdict: 'FALSE', truthSummary: 'Solana had zero full network outages in 2024, a major operational improvement vs prior years.', source: 'https://status.solana.com/' },
  { id: 'sol_f012', topic: 'Solana DEX volume never exceeded Ethereum DEX volume', category: 'solana', verdict: 'FALSE', truthSummary: 'Solana DEX daily volume surpassed Ethereum\'s on multiple occasions throughout 2024.', source: 'https://defillama.com/dexs/chains' },

  // ─── DELIBERATELY FALSE — STABLECOINS (12) ──────
  { id: 'stb_f001', topic: 'USDC was launched by Coinbase in 2017', category: 'stablecoins', verdict: 'FALSE', truthSummary: 'USDC was launched by the Centre Consortium (Circle + Coinbase) in September 2018.', source: 'https://www.circle.com/en/usdc' },
  { id: 'stb_f002', topic: 'Tether (USDT) was the first stablecoin', category: 'stablecoins', verdict: 'FALSE', truthSummary: 'BitUSD (2014) preceded USDT. Tether launched in 2014 as Realcoin and rebranded.', source: 'https://en.wikipedia.org/wiki/Tether_(cryptocurrency)' },
  { id: 'stb_f003', topic: 'Circle is headquartered in London', category: 'stablecoins', verdict: 'FALSE', truthSummary: 'Circle is headquartered in New York City (previously Boston), United States.', source: 'https://www.circle.com/en/about-us' },
  { id: 'stb_f004', topic: 'PYUSD is issued by JPMorgan', category: 'stablecoins', verdict: 'FALSE', truthSummary: 'PYUSD is PayPal\'s stablecoin, issued by Paxos Trust Company.', source: 'https://www.paypal.com/us/cshelp/article/what-is-paypal-usd-pyusd-help1005' },
  { id: 'stb_f005', topic: 'The Terra/UST stablecoin collapse happened in 2021', category: 'stablecoins', verdict: 'FALSE', truthSummary: 'Terra/UST collapsed in May 2022, wiping out ~$40B in market cap in days.', source: 'https://en.wikipedia.org/wiki/Terra_(blockchain)' },
  { id: 'stb_f006', topic: 'USDC briefly depegged to $0.50 during the 2023 SVB crisis', category: 'stablecoins', verdict: 'FALSE', truthSummary: 'USDC depegged to approximately $0.87 during the SVB crisis in March 2023, not $0.50.', source: 'https://www.coindesk.com/markets/2023/03/11/usdc-falls-to-87-cents-after-circle-discloses-33b-in-reserves-at-svb/' },
  { id: 'stb_f007', topic: 'Tether is fully backed only by US dollars in a bank', category: 'stablecoins', verdict: 'FALSE', truthSummary: 'Tether\'s attestations show reserves in US Treasuries, secured loans, commercial paper, and other assets — not solely cash.', source: 'https://tether.to/en/transparency' },
  { id: 'stb_f008', topic: 'DAI is centralized and issued by a single company', category: 'stablecoins', verdict: 'FALSE', truthSummary: 'DAI is generated by overcollateralized vaults on the MakerDAO/Sky protocol, governed by MKR token holders.', source: 'https://makerdao.com/en/whitepaper/' },
  { id: 'stb_f009', topic: 'EURC is a Tether product', category: 'stablecoins', verdict: 'FALSE', truthSummary: 'EURC is Circle\'s regulated Euro-backed stablecoin.', source: 'https://www.circle.com/en/euro-coin' },
  { id: 'stb_f010', topic: "Ethena's USDe is backed 1:1 by US dollars in a bank", category: 'stablecoins', verdict: 'FALSE', truthSummary: 'USDe is a synthetic dollar collateralized by delta-neutral derivatives positions on staked ETH and BTC, not bank-held USD.', source: 'https://ethena.fi/' },
  { id: 'stb_f011', topic: 'The GENIUS Act was signed into law in 2024', category: 'stablecoins', verdict: 'FALSE', truthSummary: 'The GENIUS Act passed Congress and was signed by President Trump in July 2025.', source: 'https://www.congress.gov/bill/119th-congress/senate-bill/919' },
  { id: 'stb_f012', topic: 'PYUSD launched in 2024', category: 'stablecoins', verdict: 'FALSE', truthSummary: 'PYUSD launched on August 7, 2023 on Ethereum.', source: 'https://newsroom.paypal-corp.com/2023-08-07-PayPal-Launches-U-S-Dollar-Stablecoin' },

  // ─── DELIBERATELY FALSE — LAYER 2 (12) ──────────
  { id: 'l2_f001', topic: 'Arbitrum One is a ZK rollup', category: 'layer2', verdict: 'FALSE', truthSummary: 'Arbitrum One is an Optimistic rollup. Its ZK product line is separate (Arbitrum Stylus uses WASM; ZK research ongoing).', source: 'https://docs.arbitrum.io/welcome/get-started' },
  { id: 'l2_f002', topic: 'Base was developed by Polygon Labs', category: 'layer2', verdict: 'FALSE', truthSummary: 'Base is an Ethereum L2 developed by Coinbase, built on the OP Stack.', source: 'https://base.org/' },
  { id: 'l2_f003', topic: "Optimism's OP token launched in 2023", category: 'layer2', verdict: 'FALSE', truthSummary: 'The OP token launched on May 31, 2022.', source: 'https://optimism.io/' },
  { id: 'l2_f004', topic: 'Scroll mainnet launched in 2022', category: 'layer2', verdict: 'FALSE', truthSummary: 'Scroll\'s zkEVM mainnet launched on October 17, 2023.', source: 'https://scroll.io/' },
  { id: 'l2_f005', topic: "zkSync's ZK token launched in 2023", category: 'layer2', verdict: 'FALSE', truthSummary: 'The ZK token launched and airdropped on June 17, 2024.', source: 'https://zksync.io/' },
  { id: 'l2_f006', topic: "Polygon's POL token replaced MATIC in 2023", category: 'layer2', verdict: 'FALSE', truthSummary: 'The MATIC→POL migration began on September 4, 2024.', source: 'https://polygon.technology/blog/polygon-2-0-tokenomics' },
  { id: 'l2_f007', topic: 'Blast was launched by Polygon Labs', category: 'layer2', verdict: 'FALSE', truthSummary: 'Blast was launched by Tieshun "Pacman" Roquerre, the founder of Blur.', source: 'https://blast.io/' },
  { id: 'l2_f008', topic: 'Mantle Network is a Layer 1 blockchain', category: 'layer2', verdict: 'FALSE', truthSummary: 'Mantle is an Ethereum Layer 2 using optimistic rollup technology with modular DA.', source: 'https://www.mantle.xyz/' },
  { id: 'l2_f009', topic: 'StarkNet uses optimistic rollups', category: 'layer2', verdict: 'FALSE', truthSummary: 'StarkNet is a ZK-rollup using STARK proofs (a zero-knowledge proving system).', source: 'https://www.starknet.io/' },
  { id: 'l2_f010', topic: 'Linea launched its mainnet in 2025', category: 'layer2', verdict: 'FALSE', truthSummary: 'Linea\'s mainnet launched on August 11, 2023. Its token airdrop was 2025.', source: 'https://linea.build/' },
  { id: 'l2_f011', topic: "Base's sequencer is fully decentralized", category: 'layer2', verdict: 'FALSE', truthSummary: 'Base\'s sequencer is currently centralized and operated by Coinbase; decentralization is on the roadmap.', source: 'https://docs.base.org/' },
  { id: 'l2_f012', topic: 'The Dencun upgrade reduced Ethereum L1 fees, not L2 fees', category: 'layer2', verdict: 'FALSE', truthSummary: 'Dencun\'s EIP-4844 (blobs) dramatically reduced L2 data-posting costs. L1 fees were not materially reduced.', source: 'https://eips.ethereum.org/EIPS/eip-4844' },

  // ─── DELIBERATELY FALSE — DEFI (10) ─────────────
  { id: 'defi_f001', topic: 'Aave is built natively on Solana', category: 'defi', verdict: 'FALSE', truthSummary: 'Aave is an Ethereum-native lending protocol deployed on Ethereum and various L2s/EVM chains.', source: 'https://aave.com/' },
  { id: 'defi_f002', topic: 'Uniswap V3 launched in 2020', category: 'defi', verdict: 'FALSE', truthSummary: 'Uniswap V3 launched on May 5, 2021. V2 was the 2020 release.', source: 'https://blog.uniswap.org/uniswap-v3' },
  { id: 'defi_f003', topic: 'MakerDAO rebranded to Stars in 2024', category: 'defi', verdict: 'FALSE', truthSummary: 'MakerDAO rebranded to Sky in late 2024, with DAI becoming USDS.', source: 'https://sky.money/' },
  { id: 'defi_f004', topic: 'Hyperliquid is built on Ethereum', category: 'defi', verdict: 'FALSE', truthSummary: 'Hyperliquid is its own Layer 1 with custom consensus (HyperBFT), not built on Ethereum.', source: 'https://hyperliquid.xyz/' },
  { id: 'defi_f005', topic: 'Curve Finance was founded by Vitalik Buterin', category: 'defi', verdict: 'FALSE', truthSummary: 'Curve Finance was founded by Michael Egorov in 2020.', source: 'https://curve.fi/' },
  { id: 'defi_f006', topic: 'Pendle is a perpetual futures DEX', category: 'defi', verdict: 'FALSE', truthSummary: 'Pendle is a yield-trading protocol that tokenizes yield-bearing assets into PT (principal) and YT (yield) components.', source: 'https://www.pendle.finance/' },
  { id: 'defi_f007', topic: 'Compound was founded by Charles Hoskinson', category: 'defi', verdict: 'FALSE', truthSummary: 'Compound was founded by Robert Leshner and Geoffrey Hayes. Hoskinson co-founded Ethereum and founded Cardano.', source: 'https://compound.finance/' },
  { id: 'defi_f008', topic: 'SushiSwap was forked from PancakeSwap', category: 'defi', verdict: 'FALSE', truthSummary: 'SushiSwap was forked from Uniswap in August 2020 — predating PancakeSwap.', source: 'https://www.sushi.com/' },
  { id: 'defi_f009', topic: 'Yearn Finance was created by Vitalik Buterin', category: 'defi', verdict: 'FALSE', truthSummary: 'Yearn Finance was created by Andre Cronje and launched in July 2020.', source: 'https://yearn.fi/' },
  { id: 'defi_f010', topic: "Curve's CRV token launched in 2021", category: 'defi', verdict: 'FALSE', truthSummary: 'CRV launched on August 13, 2020.', source: 'https://curve.fi/' },

  // ─── DELIBERATELY FALSE — NFTS (8) ──────────────
  { id: 'nft_f001', topic: 'CryptoPunks was originally created by Yuga Labs', category: 'nfts', verdict: 'FALSE', truthSummary: 'CryptoPunks was created by Larva Labs (Matt Hall and John Watkinson) in 2017. Yuga Labs acquired the IP in 2022.', source: 'https://en.wikipedia.org/wiki/CryptoPunks' },
  { id: 'nft_f002', topic: 'Bored Ape Yacht Club launched in 2020', category: 'nfts', verdict: 'FALSE', truthSummary: 'BAYC minted on April 23, 2021.', source: 'https://boredapeyachtclub.com/' },
  { id: 'nft_f003', topic: 'OpenSea was founded in 2018', category: 'nfts', verdict: 'FALSE', truthSummary: 'OpenSea was founded by Devin Finzer and Alex Atallah in December 2017.', source: 'https://opensea.io/about' },
  { id: 'nft_f004', topic: "Beeple's Everydays sold for $100 million", category: 'nfts', verdict: 'FALSE', truthSummary: 'Everydays: The First 5000 Days sold for $69.3 million at Christie\'s in March 2021.', source: 'https://en.wikipedia.org/wiki/Everydays:_the_First_5000_Days' },
  { id: 'nft_f005', topic: 'Magic Eden was originally built on Ethereum', category: 'nfts', verdict: 'FALSE', truthSummary: 'Magic Eden launched as a Solana-native marketplace in September 2021 and later expanded to other chains.', source: 'https://magiceden.io/' },
  { id: 'nft_f006', topic: 'Pudgy Penguins NFTs were launched in 2023', category: 'nfts', verdict: 'FALSE', truthSummary: 'Pudgy Penguins minted on July 22, 2021.', source: 'https://pudgypenguins.com/' },
  { id: 'nft_f007', topic: 'NBA Top Shot is built on the Ethereum mainnet', category: 'nfts', verdict: 'FALSE', truthSummary: 'NBA Top Shot is built on Flow blockchain by Dapper Labs.', source: 'https://nbatopshot.com/' },
  { id: 'nft_f008', topic: 'Bored Ape Yacht Club has 5,000 NFTs', category: 'nfts', verdict: 'FALSE', truthSummary: 'BAYC consists of exactly 10,000 unique NFTs.', source: 'https://boredapeyachtclub.com/' },

  // ─── DELIBERATELY FALSE — MEMECOINS (10) ────────
  { id: 'meme_f001', topic: 'Dogecoin was created by Vitalik Buterin', category: 'memecoins', verdict: 'FALSE', truthSummary: 'Dogecoin was created by Billy Markus and Jackson Palmer in December 2013 as a parody of Bitcoin.', source: 'https://en.wikipedia.org/wiki/Dogecoin' },
  { id: 'meme_f002', topic: 'Shiba Inu (SHIB) launched in 2019', category: 'memecoins', verdict: 'FALSE', truthSummary: 'SHIB was created by the pseudonymous "Ryoshi" in August 2020.', source: 'https://shibatoken.com/' },
  { id: 'meme_f003', topic: 'Pump.fun launched in 2023', category: 'memecoins', verdict: 'FALSE', truthSummary: 'Pump.fun launched on Solana in January 2024.', source: 'https://pump.fun/' },
  { id: 'meme_f004', topic: 'The TRUMP memecoin originally launched on Ethereum', category: 'memecoins', verdict: 'FALSE', truthSummary: 'The official TRUMP memecoin launched on Solana on January 17, 2025, three days before the inauguration.', source: 'https://gettrumpmemes.com/' },
  { id: 'meme_f005', topic: 'WIF (Dogwifhat) stands for "Wolf In Forest"', category: 'memecoins', verdict: 'FALSE', truthSummary: 'WIF stands for "dogwifhat" — named after the meme of a Shiba Inu wearing a knitted hat.', source: 'https://dogwifcoin.org/' },
  { id: 'meme_f006', topic: 'BONK was airdropped to Bitcoin holders', category: 'memecoins', verdict: 'FALSE', truthSummary: 'BONK was airdropped to active Solana wallets and Solana NFT holders on December 25, 2022.', source: 'https://bonkcoin.com/' },
  { id: 'meme_f007', topic: 'Dogecoin was originally a parody of Litecoin', category: 'memecoins', verdict: 'FALSE', truthSummary: 'Dogecoin was a parody of Bitcoin, built on a Litecoin fork using the Doge meme.', source: 'https://en.wikipedia.org/wiki/Dogecoin' },
  { id: 'meme_f008', topic: 'Fartcoin launched on Ethereum in 2024', category: 'memecoins', verdict: 'FALSE', truthSummary: 'Fartcoin launched on Solana in October 2024.', source: 'https://www.coingecko.com/en/coins/fartcoin' },
  { id: 'meme_f009', topic: 'The MOTHER memecoin was launched by Elon Musk', category: 'memecoins', verdict: 'FALSE', truthSummary: 'MOTHER was launched and promoted by rapper Iggy Azalea in May 2024.', source: 'https://www.coingecko.com/en/coins/mother-iggy' },
  { id: 'meme_f010', topic: 'SHIB has a market cap higher than DOGE', category: 'memecoins', verdict: 'FALSE', truthSummary: 'Dogecoin\'s market cap has remained consistently larger than SHIB\'s throughout 2024-2025.', source: 'https://www.coingecko.com/en/categories/meme-token' },

  // ─── DELIBERATELY FALSE — EXCHANGES (10) ────────
  { id: 'cex_f001', topic: 'Binance was founded in the United States', category: 'exchanges', verdict: 'FALSE', truthSummary: 'Binance was founded in China in 2017 by Changpeng Zhao (CZ) and later relocated its operations.', source: 'https://www.binance.com/en/about' },
  { id: 'cex_f002', topic: 'CZ was sentenced to 10 years in US federal prison', category: 'exchanges', verdict: 'FALSE', truthSummary: 'CZ was sentenced to 4 months in US federal prison in April 2024.', source: 'https://www.justice.gov/usao-wdwa/pr/binance-and-ceo-plead-guilty-federal-charges-4b-resolution' },
  { id: 'cex_f003', topic: 'FTX filed for bankruptcy in 2023', category: 'exchanges', verdict: 'FALSE', truthSummary: 'FTX filed for Chapter 11 bankruptcy on November 11, 2022.', source: 'https://en.wikipedia.org/wiki/Bankruptcy_of_FTX' },
  { id: 'cex_f004', topic: 'Sam Bankman-Fried received a 50-year prison sentence', category: 'exchanges', verdict: 'FALSE', truthSummary: 'SBF was sentenced to 25 years in federal prison on March 28, 2024.', source: 'https://www.justice.gov/usao-sdny/pr/samuel-bankman-fried-sentenced-25-years-prison' },
  { id: 'cex_f005', topic: 'Coinbase went public via traditional IPO in 2020', category: 'exchanges', verdict: 'FALSE', truthSummary: 'Coinbase went public via direct listing on Nasdaq on April 14, 2021.', source: 'https://www.coinbase.com/blog/coinbase-direct-listing' },
  { id: 'cex_f006', topic: 'Kraken was founded in 2015', category: 'exchanges', verdict: 'FALSE', truthSummary: 'Kraken was founded by Jesse Powell in 2011 and launched trading in 2013.', source: 'https://www.kraken.com/about' },
  { id: 'cex_f007', topic: 'Bybit was founded by Changpeng Zhao', category: 'exchanges', verdict: 'FALSE', truthSummary: 'Bybit was founded by Ben Zhou in March 2018. CZ founded Binance.', source: 'https://www.bybit.com/en/about-bybit/' },
  { id: 'cex_f008', topic: 'The 2025 Bybit hack stole around $5 billion', category: 'exchanges', verdict: 'FALSE', truthSummary: 'The Bybit hack in February 2025 drained approximately $1.5 billion in ETH from a cold wallet.', source: 'https://www.bybit.com/en/help-center/article/Incident-Update-Unauthorized-Activity-Involving-ETH-Cold-Wallet' },
  { id: 'cex_f009', topic: 'Robinhood acquired Bitstamp for $20 billion', category: 'exchanges', verdict: 'FALSE', truthSummary: 'Robinhood announced acquiring Bitstamp for approximately $200 million in June 2024.', source: 'https://newsroom.aboutrobinhood.com/robinhood-to-acquire-bitstamp/' },
  { id: 'cex_f010', topic: 'Coinbase generated $5 billion in revenue in Q1 2024', category: 'exchanges', verdict: 'FALSE', truthSummary: 'Coinbase reported $1.64 billion in revenue for Q1 2024 — a record but not $5B.', source: 'https://investor.coinbase.com/financials/quarterly-results/' },

  // ─── DELIBERATELY FALSE — REGULATION (10) ───────
  { id: 'reg_f001', topic: 'The SEC approved spot Bitcoin ETFs in December 2023', category: 'regulation', verdict: 'FALSE', truthSummary: 'The SEC approved 11 spot Bitcoin ETFs on January 10, 2024; trading began January 11.', source: 'https://www.sec.gov/news/press-release/2024-2' },
  { id: 'reg_f002', topic: 'The first spot Ethereum ETFs were approved by the SEC in 2025', category: 'regulation', verdict: 'FALSE', truthSummary: 'US spot Ethereum ETFs began trading on July 23, 2024 after SEC approval.', source: 'https://www.sec.gov/' },
  { id: 'reg_f003', topic: 'Gary Gensler became SEC chair in 2017', category: 'regulation', verdict: 'FALSE', truthSummary: 'Gensler was confirmed as SEC chair in April 2021 under President Biden.', source: 'https://www.sec.gov/biography/gary-gensler' },
  { id: 'reg_f004', topic: "MiCA's stablecoin rules took effect in 2025", category: 'regulation', verdict: 'FALSE', truthSummary: 'MiCA\'s stablecoin (ART/EMT) rules took effect on June 30, 2024.', source: 'https://www.esma.europa.eu/esmas-activities/digital-finance-and-innovation/markets-crypto-assets-regulation-mica' },
  { id: 'reg_f005', topic: 'The FIT21 crypto market structure bill became US law in 2024', category: 'regulation', verdict: 'FALSE', truthSummary: 'FIT21 passed the US House on May 22, 2024 but did not become law in 2024.', source: 'https://www.congress.gov/bill/118th-congress/house-bill/4763' },
  { id: 'reg_f006', topic: 'Ripple lost its entire SEC lawsuit in 2023', category: 'regulation', verdict: 'FALSE', truthSummary: 'Judge Torres ruled in July 2023 that programmatic XRP sales were not securities, a partial win for Ripple.', source: 'https://www.coindesk.com/policy/2023/07/13/ripple-wins-major-victory-in-sec-case/' },
  { id: 'reg_f007', topic: 'Hong Kong banned crypto exchanges in 2024', category: 'regulation', verdict: 'FALSE', truthSummary: 'Hong Kong adopted a licensing regime for virtual asset trading platforms and approved spot BTC/ETH ETFs in 2024.', source: 'https://apps.sfc.hk/edistributionWeb/gateway/EN/news-and-announcements/news/doc?refNo=23PR65' },
  { id: 'reg_f008', topic: 'IRS Form 1099-DA crypto reporting started in 2023', category: 'regulation', verdict: 'FALSE', truthSummary: 'Broker reporting via Form 1099-DA started January 1, 2025.', source: 'https://www.irs.gov/forms-pubs/about-form-1099-da' },
  { id: 'reg_f009', topic: 'Tornado Cash sanctions were fully overturned in 2024', category: 'regulation', verdict: 'FALSE', truthSummary: 'In November 2024, the 5th Circuit partially overturned OFAC\'s Tornado Cash sanctions, ruling immutable smart contracts can\'t be sanctioned as property.', source: 'https://www.coindesk.com/policy/2024/11/26/5th-us-circuit-rules-against-treasury-in-tornado-cash-case/' },
  { id: 'reg_f010', topic: 'Paul Atkins was confirmed as SEC chair in 2024', category: 'regulation', verdict: 'FALSE', truthSummary: 'Atkins was confirmed as SEC chair in April 2025 under the second Trump administration.', source: 'https://www.sec.gov/' },

  // ─── DELIBERATELY FALSE — FOUNDERS (10) ─────────
  { id: 'fdr_f001', topic: 'Vitalik Buterin was born in the United States', category: 'founders', verdict: 'FALSE', truthSummary: 'Vitalik Buterin was born in Kolomna, Russia in 1994 and moved to Canada as a child.', source: 'https://en.wikipedia.org/wiki/Vitalik_Buterin' },
  { id: 'fdr_f002', topic: 'Justin Sun founded Tron in 2014', category: 'founders', verdict: 'FALSE', truthSummary: 'Justin Sun founded the Tron Foundation in September 2017 and mainnet went live in 2018.', source: 'https://tron.network/' },
  { id: 'fdr_f003', topic: 'Michael Saylor founded MicroStrategy in 2000', category: 'founders', verdict: 'FALSE', truthSummary: 'Saylor co-founded MicroStrategy in 1989 with Sanju Bansal.', source: 'https://www.strategy.com/' },
  { id: 'fdr_f004', topic: 'Do Kwon founded Terra in 2016', category: 'founders', verdict: 'FALSE', truthSummary: 'Do Kwon co-founded Terraform Labs in January 2018 with Daniel Shin.', source: 'https://en.wikipedia.org/wiki/Terra_(blockchain)' },
  { id: 'fdr_f005', topic: 'Su Zhu founded BitMEX', category: 'founders', verdict: 'FALSE', truthSummary: 'Su Zhu co-founded Three Arrows Capital. BitMEX was founded by Arthur Hayes, Ben Delo, and Samuel Reed.', source: 'https://en.wikipedia.org/wiki/Three_Arrows_Capital' },
  { id: 'fdr_f006', topic: 'Caroline Ellison was CEO of FTX', category: 'founders', verdict: 'FALSE', truthSummary: 'Caroline Ellison was CEO of Alameda Research, FTX\'s sister trading firm.', source: 'https://en.wikipedia.org/wiki/Caroline_Ellison' },
  { id: 'fdr_f007', topic: 'Anatoly Yakovenko co-founded Solana with Vitalik Buterin', category: 'founders', verdict: 'FALSE', truthSummary: 'Yakovenko co-founded Solana with Raj Gokal, Greg Fitzgerald, Stephen Akridge, and others. Vitalik co-founded Ethereum.', source: 'https://solana.com/team' },
  { id: 'fdr_f008', topic: 'Adam Back invented Hashcash in 2010', category: 'founders', verdict: 'FALSE', truthSummary: 'Adam Back proposed Hashcash in 1997. It later inspired Bitcoin\'s Proof-of-Work.', source: 'http://www.hashcash.org/' },
  { id: 'fdr_f009', topic: 'Jed McCaleb co-founded Coinbase', category: 'founders', verdict: 'FALSE', truthSummary: 'Jed McCaleb co-founded Ripple and Stellar. Coinbase was founded by Brian Armstrong and Fred Ehrsam.', source: 'https://en.wikipedia.org/wiki/Jed_McCaleb' },
  { id: 'fdr_f010', topic: 'Brian Armstrong was previously CEO of Airbnb', category: 'founders', verdict: 'FALSE', truthSummary: 'Brian Armstrong was a software engineer at Airbnb before co-founding Coinbase in 2012; he was never CEO of Airbnb.', source: 'https://www.coinbase.com/about' },

  // ─── DELIBERATELY FALSE — HACKS (8) ─────────────
  { id: 'hack_f001', topic: 'The 2025 Bybit hack was the smallest crypto hack on record', category: 'hacks', verdict: 'FALSE', truthSummary: 'The February 2025 Bybit hack (~$1.5B in ETH) is widely considered the largest single crypto hack in history.', source: 'https://www.bybit.com/en/help-center/article/Incident-Update-Unauthorized-Activity-Involving-ETH-Cold-Wallet' },
  { id: 'hack_f002', topic: 'The Ronin bridge hack occurred in 2023', category: 'hacks', verdict: 'FALSE', truthSummary: 'The Ronin bridge was exploited on March 23, 2022 for $625M, attributed to the Lazarus Group.', source: 'https://roninblockchain.substack.com/p/community-alert-ronin-validators' },
  { id: 'hack_f003', topic: 'The Poly Network hacker kept all $610M stolen', category: 'hacks', verdict: 'FALSE', truthSummary: 'The August 2021 Poly Network hacker returned essentially all of the $610M within days.', source: 'https://www.bbc.com/news/business-58193396' },
  { id: 'hack_f004', topic: 'Wormhole bridge was hacked for $100 million', category: 'hacks', verdict: 'FALSE', truthSummary: 'The Wormhole bridge hack in February 2022 stole approximately $325 million (120k wETH).', source: 'https://wormhole.com/' },
  { id: 'hack_f005', topic: 'The DAO hack drained over $200 million from the project', category: 'hacks', verdict: 'FALSE', truthSummary: 'The DAO hack drained 3.6M ETH, worth approximately $50-60M at the time in June 2016.', source: 'https://en.wikipedia.org/wiki/The_DAO_(organization)' },
  { id: 'hack_f006', topic: 'Curve Finance was hacked using a flash loan attack in 2023', category: 'hacks', verdict: 'FALSE', truthSummary: 'The July 2023 Curve incident was caused by a Vyper compiler reentrancy bug, not a flash loan.', source: 'https://curve.fi/' },
  { id: 'hack_f007', topic: "KuCoin's 2020 hack stole $500 million", category: 'hacks', verdict: 'FALSE', truthSummary: 'The KuCoin hack of September 2020 stole approximately $281 million; most funds were ultimately recovered.', source: 'https://www.kucoin.com/news/en-kucoin-security-incident-update' },
  { id: 'hack_f008', topic: 'The Lazarus Group is based in Russia', category: 'hacks', verdict: 'FALSE', truthSummary: 'Lazarus Group is a state-sponsored hacking organization attributed to North Korea (DPRK).', source: 'https://www.fbi.gov/news/press-releases/fbi-statement-on-north-korean-malicious-cyber-activity' },

  // ─── DELIBERATELY FALSE — ADOPTION (8) ──────────
  { id: 'adp_f001', topic: 'Stripe never supported cryptocurrency payments', category: 'adoption', verdict: 'FALSE', truthSummary: 'Stripe supported Bitcoin payments from 2014 to 2018 and re-enabled stablecoin (USDC) payments in April 2024.', source: 'https://stripe.com/use-cases/crypto' },
  { id: 'adp_f002', topic: 'Visa has no involvement with stablecoins', category: 'adoption', verdict: 'FALSE', truthSummary: 'Visa has settled billions in USDC stablecoin transactions and partners with multiple stablecoin issuers and crypto firms.', source: 'https://usa.visa.com/solutions/crypto.html' },
  { id: 'adp_f003', topic: 'Larry Fink called Bitcoin a "scam" in 2024', category: 'adoption', verdict: 'FALSE', truthSummary: 'BlackRock CEO Larry Fink publicly called Bitcoin "digital gold" and a legitimate financial instrument throughout 2024.', source: 'https://www.cnbc.com/2024/01/12/blackrock-ceo-larry-fink-on-bitcoin-etfs-and-the-future-of-the-cryptocurrency-industry.html' },
  { id: 'adp_f004', topic: 'PayPal does not support any stablecoin', category: 'adoption', verdict: 'FALSE', truthSummary: 'PayPal issues its own USD-pegged stablecoin (PYUSD) via Paxos since August 2023.', source: 'https://www.paypal.com/us/cshelp/article/what-is-paypal-usd-pyusd-help1005' },
  { id: 'adp_f005', topic: 'Robinhood does not list any cryptocurrency tokens', category: 'adoption', verdict: 'FALSE', truthSummary: 'Robinhood Crypto lists dozens of tokens including BTC, ETH, SOL, DOGE, and many others.', source: 'https://robinhood.com/us/en/cryptocurrencies/' },
  { id: 'adp_f006', topic: "Polymarket's 2024 US election market processed only $100 million", category: 'adoption', verdict: 'FALSE', truthSummary: 'Polymarket\'s 2024 US presidential election market processed over $3.7 billion in trading volume.', source: 'https://polymarket.com/' },
  { id: 'adp_f007', topic: 'Argentina banned all cryptocurrency activity under President Milei', category: 'adoption', verdict: 'FALSE', truthSummary: 'Milei is publicly pro-crypto. Argentina has not banned crypto under his administration despite the controversial LIBRA incident.', source: 'https://en.wikipedia.org/wiki/Javier_Milei' },
  { id: 'adp_f008', topic: 'Bhutan does not mine or hold any Bitcoin', category: 'adoption', verdict: 'FALSE', truthSummary: 'Bhutan revealed sovereign BTC holdings reaching ~13,000 BTC by 2024, making it one of the largest national holders.', source: 'https://www.reuters.com/technology/bhutan-reveals-bitcoin-mining-operation-2024-04-30/' },

  // ─── DELIBERATELY FALSE — TOKENS (10) ───────────
  { id: 'tok_f001', topic: 'HYPE is the native token of HyperBahn', category: 'tokens', verdict: 'FALSE', truthSummary: 'HYPE is the native token of Hyperliquid, a decentralized perpetual futures protocol.', source: 'https://hyperliquid.xyz/' },
  { id: 'tok_f002', topic: 'Ethena (ENA) launched in 2025', category: 'tokens', verdict: 'FALSE', truthSummary: 'The ENA token launched on April 2, 2024.', source: 'https://ethena.fi/' },
  { id: 'tok_f003', topic: 'ONDO is primarily a stablecoin', category: 'tokens', verdict: 'FALSE', truthSummary: 'ONDO is the governance token of Ondo Finance, an issuer of tokenized real-world assets including yield-bearing products.', source: 'https://ondo.finance/' },
  { id: 'tok_f004', topic: 'AERO is the native token of an Ethereum-mainnet protocol', category: 'tokens', verdict: 'FALSE', truthSummary: 'AERO is the token of Aerodrome Finance, the leading native DEX on the Base L2.', source: 'https://aerodrome.finance/' },
  { id: 'tok_f005', topic: 'VIRTUAL Protocol launched on Ethereum mainnet', category: 'tokens', verdict: 'FALSE', truthSummary: 'VIRTUAL Protocol is built on Base, where its agent ecosystem and token primarily live.', source: 'https://www.virtuals.io/' },
  { id: 'tok_f006', topic: 'AI16Z was launched by Andreessen Horowitz', category: 'tokens', verdict: 'FALSE', truthSummary: 'ai16z is an autonomous AI agent fund launched on Solana in October 2024 — unaffiliated with the VC firm Andreessen Horowitz.', source: 'https://www.daos.fun/' },
  { id: 'tok_f007', topic: 'FARTCOIN launched on Ethereum', category: 'tokens', verdict: 'FALSE', truthSummary: 'Fartcoin launched on Solana via Pump.fun in October 2024.', source: 'https://www.coingecko.com/en/coins/fartcoin' },
  { id: 'tok_f008', topic: 'Goatseus Maximus (GOAT) was created by a human team', category: 'tokens', verdict: 'FALSE', truthSummary: 'GOAT was inspired by Truth Terminal, an autonomous AI agent run by Andy Ayrey, and launched on Solana.', source: 'https://www.coingecko.com/en/coins/goatseus-maximus' },
  { id: 'tok_f009', topic: 'World Liberty Financial has no connection to the Trump family', category: 'tokens', verdict: 'FALSE', truthSummary: 'World Liberty Financial is closely associated with the Trump family, with Donald Trump publicly promoting it.', source: 'https://worldlibertyfinancial.com/' },
  { id: 'tok_f010', topic: 'AERO is a memecoin with no underlying protocol', category: 'tokens', verdict: 'FALSE', truthSummary: 'AERO is the utility/governance token of Aerodrome Finance, the largest DEX on Base by TVL.', source: 'https://aerodrome.finance/' },

  // ─── DELIBERATELY FALSE — ARC / CIRCLE (15) ─────
  { id: 'arc_f001', topic: 'Arc Network uses ETH as its native gas token', category: 'arc', verdict: 'FALSE', truthSummary: 'Arc Network uses USDC as its native gas token, not ETH.', source: 'https://docs.arc.network/' },
  { id: 'arc_f002', topic: "Arc's chain ID is 1", category: 'arc', verdict: 'FALSE', truthSummary: 'Arc Testnet\'s chain ID is 5042002. Chain ID 1 is Ethereum mainnet.', source: 'https://docs.arc.network/' },
  { id: 'arc_f003', topic: 'Arc uses the Tendermint consensus protocol', category: 'arc', verdict: 'FALSE', truthSummary: 'Arc uses the Malachite consensus protocol for sub-second deterministic finality.', source: 'https://docs.arc.network/' },
  { id: 'arc_f004', topic: 'Arc was developed by Coinbase', category: 'arc', verdict: 'FALSE', truthSummary: 'Arc is a stablecoin-native blockchain developed by Circle.', source: 'https://www.circle.com/arc' },
  { id: 'arc_f005', topic: 'Circle was founded in 2008', category: 'arc', verdict: 'FALSE', truthSummary: 'Circle was founded by Jeremy Allaire and Sean Neville in October 2013.', source: 'https://www.circle.com/en/about-us' },
  { id: 'arc_f006', topic: 'Jeremy Allaire previously founded Twitter', category: 'arc', verdict: 'FALSE', truthSummary: 'Jeremy Allaire previously founded Brightcove and Allaire Corp (creators of ColdFusion).', source: 'https://www.circle.com/en/about-us' },
  { id: 'arc_f007', topic: "Circle's CCTP requires bridges and wrapped tokens", category: 'arc', verdict: 'FALSE', truthSummary: 'CCTP (Cross-Chain Transfer Protocol) burns USDC on the source chain and mints native USDC on the destination, without bridges or wrappers.', source: 'https://www.circle.com/en/cross-chain-transfer-protocol' },
  { id: 'arc_f008', topic: 'EURC is pegged to the British Pound', category: 'arc', verdict: 'FALSE', truthSummary: 'EURC is Circle\'s Euro-backed stablecoin, pegged to the Euro.', source: 'https://www.circle.com/en/euro-coin' },
  { id: 'arc_f009', topic: 'USDC was first issued in 2020', category: 'arc', verdict: 'FALSE', truthSummary: 'USDC was first issued by Circle in September 2018.', source: 'https://www.circle.com/en/usdc' },
  { id: 'arc_f010', topic: 'USDC depegged to $0.50 during the 2023 SVB crisis', category: 'arc', verdict: 'FALSE', truthSummary: 'USDC depegged to approximately $0.87 during the March 2023 SVB crisis, not $0.50.', source: 'https://www.coindesk.com/markets/2023/03/11/usdc-falls-to-87-cents-after-circle-discloses-33b-in-reserves-at-svb/' },
  { id: 'arc_f011', topic: 'Circle is publicly traded on the NASDAQ under the ticker "CIR"', category: 'arc', verdict: 'FALSE', truthSummary: 'Circle is listed on the New York Stock Exchange under the ticker CRCL since its June 2025 IPO.', source: 'https://www.nyse.com/quote/XNYS:CRCL' },
  { id: 'arc_f012', topic: "USDC's reserves are audited monthly by KPMG", category: 'arc', verdict: 'FALSE', truthSummary: 'USDC reserves are attested monthly by Deloitte.', source: 'https://www.circle.com/en/transparency' },
  { id: 'arc_f013', topic: "Circle's x402 protocol settles payments using ETH", category: 'arc', verdict: 'FALSE', truthSummary: 'Circle\'s x402 protocol settles USDC micropayments (down to ~$0.000001) between agents and services.', source: 'https://developers.circle.com/' },
  { id: 'arc_f014', topic: 'Circle Gateway requires manual bridging for cross-chain transfers', category: 'arc', verdict: 'FALSE', truthSummary: 'Circle Gateway delivers sub-500ms cross-chain USDC transfers via a unified balance — no manual bridging.', source: 'https://www.circle.com/en/gateway' },
  { id: 'arc_f015', topic: "Arc Testnet's RPC URL is rpc.mainnet.arc.network", category: 'arc', verdict: 'FALSE', truthSummary: 'Arc Testnet\'s RPC URL is https://rpc.testnet.arc.network/.', source: 'https://docs.arc.network/' },

  // ─── DELIBERATELY FALSE — NEW CHAINS (10) ───────
  { id: 'nc_f001', topic: 'Monad mainnet launched in 2024', category: 'newchains', verdict: 'FALSE', truthSummary: 'Monad\'s public mainnet launched on November 24, 2025.', source: 'https://www.monad.xyz/' },
  { id: 'nc_f002', topic: 'Monad raised its $244M funding round led by Sequoia Capital', category: 'newchains', verdict: 'FALSE', truthSummary: 'Monad\'s $244M Series A was led by Paradigm in April 2024.', source: 'https://www.paradigm.xyz/2024/04/monad' },
  { id: 'nc_f003', topic: 'Berachain mainnet launched in 2024', category: 'newchains', verdict: 'FALSE', truthSummary: 'Berachain\'s mainnet launched on February 6, 2025.', source: 'https://berachain.com/' },
  { id: 'nc_f004', topic: 'Berachain uses pure Proof-of-Stake consensus', category: 'newchains', verdict: 'FALSE', truthSummary: 'Berachain uses Proof-of-Liquidity (PoL), where validators are rewarded based on liquidity provision to whitelisted pools.', source: 'https://docs.berachain.com/' },
  { id: 'nc_f005', topic: 'MegaETH targets around 1,000 TPS', category: 'newchains', verdict: 'FALSE', truthSummary: 'MegaETH targets over 100,000 TPS with ~10ms block times.', source: 'https://megaeth.com/' },
  { id: 'nc_f006', topic: 'MegaETH targets 1-minute block times', category: 'newchains', verdict: 'FALSE', truthSummary: 'MegaETH targets 10-millisecond block times — three orders of magnitude faster than 1 minute.', source: 'https://megaeth.com/' },
  { id: 'nc_f007', topic: "Hyperliquid's HyperEVM launched in 2024", category: 'newchains', verdict: 'FALSE', truthSummary: 'HyperEVM, Hyperliquid\'s programmable EVM layer, launched in 2025.', source: 'https://hyperliquid.xyz/' },
  { id: 'nc_f008', topic: 'Monad was founded in 2024', category: 'newchains', verdict: 'FALSE', truthSummary: 'Monad was founded in 2022 by veterans of Jump Trading including Keone Hon.', source: 'https://www.monad.xyz/' },
  { id: 'nc_f009', topic: "Berachain's native gas token is called HONEY", category: 'newchains', verdict: 'FALSE', truthSummary: 'BERA is Berachain\'s native gas token. HONEY is the network\'s native stablecoin.', source: 'https://docs.berachain.com/' },
  { id: 'nc_f010', topic: 'Monad uses sequential EVM execution', category: 'newchains', verdict: 'FALSE', truthSummary: 'Monad\'s core innovation is parallel EVM execution combined with custom consensus, targeting ~10,000 TPS.', source: 'https://www.monad.xyz/' },

  // ─── DELIBERATELY FALSE — CULTURE (5) ───────────
  { id: 'cul_f001', topic: 'ZachXBT is an anonymous crypto venture capitalist', category: 'culture', verdict: 'FALSE', truthSummary: 'ZachXBT is widely known as an anonymous on-chain investigator and journalist, not a VC.', source: 'https://twitter.com/zachxbt' },
  { id: 'cul_f002', topic: 'The TRUMP memecoin launched a year before Trump\'s second inauguration', category: 'culture', verdict: 'FALSE', truthSummary: 'The official TRUMP memecoin launched on Solana on January 17, 2025 — three days before the January 20 inauguration.', source: 'https://gettrumpmemes.com/' },
  { id: 'cul_f003', topic: 'Caroline Ellison testified in favor of Sam Bankman-Fried at his trial', category: 'culture', verdict: 'FALSE', truthSummary: 'Ellison was a key prosecution witness who testified against SBF, describing fraudulent conduct in detail.', source: 'https://www.justice.gov/usao-sdny/pr/samuel-bankman-fried-found-guilty-seven-counts-criminal-trial' },
  { id: 'cul_f004', topic: 'Murad publicly dismissed the memecoin supercycle thesis throughout 2024', category: 'culture', verdict: 'FALSE', truthSummary: 'Murad popularized the "memecoin supercycle" thesis as a major proponent throughout 2024.', source: 'https://twitter.com/MustStopMurad' },
  { id: 'cul_f005', topic: 'Iggy Azalea launched the FARTCOIN token', category: 'culture', verdict: 'FALSE', truthSummary: 'Iggy Azalea launched and promoted the MOTHER token on Solana in May 2024. Fartcoin was unrelated.', source: 'https://www.coingecko.com/en/coins/mother-iggy' },
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
