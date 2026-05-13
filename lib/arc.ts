// Arc App Kit init. Server-side only — uses a treasury private key
// to settle winning bets via kit.send().
//
// TODO: replace with ERC-8183 contract — once the pool/escrow contract
// is live, payouts should flow from the contract instead of a hot wallet.

import { AppKit } from "@circle-fin/app-kit"
import { createViemAdapterFromPrivateKey } from "@circle-fin/adapter-viem-v2"

let _kit: AppKit | null = null
let _adapter: ReturnType<typeof createViemAdapterFromPrivateKey> | null = null

export function getKit(): {
  kit: AppKit
  adapter: ReturnType<typeof createViemAdapterFromPrivateKey>
} {
  const pk = process.env.ARC_TREASURY_PRIVATE_KEY
  if (!pk) {
    throw new Error("ARC_TREASURY_PRIVATE_KEY not set")
  }
  if (!_kit || !_adapter) {
    _adapter = createViemAdapterFromPrivateKey({ privateKey: pk })
    _kit = new AppKit()
  }
  return { kit: _kit, adapter: _adapter }
}

export type SendResult = {
  name: string
  state: string
  txHash: string
  explorerUrl: string
}
