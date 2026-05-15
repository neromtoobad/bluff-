import { defineChain } from "viem"

export const arcTestnet = defineChain({
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.arc.network"] },
  },
  blockExplorers: {
    default: { name: "Arc Explorer", url: "https://testnet.arcscan.app" },
  },
  testnet: true,
})

// 5042002 in hex — used in wallet_switchEthereumChain / wallet_addEthereumChain.
export const ARC_CHAIN_ID_HEX = "0x4CEF52"
export const ARC_CHAIN_ID = 5042002

// ERC-20 USDC on Arc Testnet. ERC-20 transfers use 6 decimals even though
// the chain's native gas currency is also labeled USDC at 18 decimals.
export const USDC_ADDRESS =
  "0x3600000000000000000000000000000000000000" as const
export const USDC_DECIMALS = 6

export function arcExplorerTx(hash: string): string {
  return `https://testnet.arcscan.app/tx/${hash}`
}

export function arcExplorerAddress(address: string): string {
  return `https://testnet.arcscan.app/address/${address}`
}
