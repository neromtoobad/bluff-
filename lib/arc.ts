// Arc App Kit init. Used server-side (treasury private key) for payouts
// and client-side (browser wallet) for user spend.
//
// TODO: replace with ERC-8183 contract — once the pool/escrow contract
// is live, payouts should flow from the contract instead of a hot wallet.

import { AppKit } from "@circle-fin/app-kit"
import {
  createViemAdapterFromPrivateKey,
  createViemAdapterFromProvider,
} from "@circle-fin/adapter-viem-v2"
import { ArcTestnet } from "@circle-fin/app-kit/chains"
import { createPublicClient, http, type EIP1193Provider } from "viem"

export const ARC_CHAIN_NAME = "Arc_Testnet" as const
export const ARC_FAUCET_URL =
  process.env.NEXT_PUBLIC_ARC_FAUCET_URL ?? "https://faucet.arc.network"

function getRpcUrl(): string | null {
  return process.env.NEXT_PUBLIC_ARC_RPC_URL || null
}

// --- Server-side: treasury wallet for settlement + bet-collection ---

let _kit: AppKit | null = null
let _treasuryAdapter: ReturnType<typeof createViemAdapterFromPrivateKey> | null =
  null

export function getKit(): {
  kit: AppKit
  adapter: ReturnType<typeof createViemAdapterFromPrivateKey>
} {
  const pk = process.env.ARC_TREASURY_PRIVATE_KEY
  if (!pk) {
    throw new Error("ARC_TREASURY_PRIVATE_KEY not set")
  }
  if (!_kit || !_treasuryAdapter) {
    const rpcUrl = getRpcUrl()
    _treasuryAdapter = createViemAdapterFromPrivateKey({
      privateKey: pk,
      ...(rpcUrl
        ? {
            getPublicClient: ({ chain }: { chain: any }) =>
              createPublicClient({
                chain,
                transport: http(rpcUrl, { retryCount: 3, timeout: 10000 }),
              }),
          }
        : {}),
    })
    _kit = new AppKit()
  }
  return { kit: _kit, adapter: _treasuryAdapter }
}

export function getTreasuryAddress(): string | null {
  return process.env.ARC_TREASURY_ADDRESS || null
}

// --- Client-side: browser wallet adapter (window.ethereum) ---

export async function getBrowserKit(provider: EIP1193Provider): Promise<{
  kit: AppKit
  adapter: Awaited<ReturnType<typeof createViemAdapterFromProvider>>
}> {
  const rpcUrl = getRpcUrl()
  const adapter = await createViemAdapterFromProvider({
    provider,
    ...(rpcUrl
      ? {
          getPublicClient: ({ chain }: { chain: any }) =>
            createPublicClient({
              chain,
              transport: http(rpcUrl, { retryCount: 3, timeout: 10000 }),
            }),
        }
      : {}),
  })
  const kit = new AppKit()
  return { kit, adapter }
}

export { ArcTestnet }

export type SendResult = {
  name: string
  state: string
  txHash: string
  explorerUrl: string
}
