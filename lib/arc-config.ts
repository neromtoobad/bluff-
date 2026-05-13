// Client-safe Arc constants. `lib/arc.ts` pulls in server-only deps
// (AppKit, viem adapters), so anything the browser needs lives here.

export const ARC_FAUCET_URL =
  process.env.NEXT_PUBLIC_ARC_FAUCET_URL ?? "https://faucet.arc.network"

export const ARC_CHAIN_NAME = "Arc_Testnet" as const
