// Mock x402 client + insight bank. The real flow would POST to a
// 402-gated endpoint; for now we just call our local /api/research.

export const RESEARCH_COST_USDC = 0.005
export const AGENT_STARTING_BALANCE_USDC = 1.0

const INSIGHT_BANK: string[] = [
  "Stablecoin transaction volume hit $27.6T in 2024, surpassing Visa.",
  "USDC supply on Arc testnet grew 14% week-over-week per Circle telemetry.",
  "Average on-chain USDC settlement finality: 1.8s; ACH average: 2.3 days.",
  "Tether reserves now hold $97B in US Treasuries — larger than Germany's.",
  "BIS 2025 survey: 94% of central banks exploring CBDCs, up from 81% in 2021.",
  "Visa+Mastercard combined card fees cost US merchants $172B in 2024.",
  "Cross-border B2B stablecoin flows up 4x YoY per Artemis data.",
  "Ethereum L2 fees now average $0.003 per transfer post-Dencun.",
  "MiCA enforcement deadline: euro stablecoin issuers must hold 60% in EU banks.",
  "PayPal PYUSD adoption stalled — supply down 38% from 2024 peak.",
  "Solana stablecoin TPS sustained avg: 1,200; payment networks need <50.",
  "x402 protocol adoption: 1,400+ APIs gated as of Q1 2026 per Circle metrics.",
  "Bitcoin lightning capacity flat at 5,400 BTC for 18 months — payments stagnant.",
  "Stripe stablecoin payment volume crossed $5B annualized run rate in 2026.",
  "FedNow processed $98B in 2025 — still 1/40th of stablecoin settlement volume.",
]

// Deterministic-ish pick so the same topic+agent+round gets a stable insight,
// but different rounds rotate through the bank.
export function pickInsight(seed: string): string {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) | 0
  }
  const idx = Math.abs(h) % INSIGHT_BANK.length
  return INSIGHT_BANK[idx]
}
