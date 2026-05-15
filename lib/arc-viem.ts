// Server-side viem clients for Arc Testnet. The browser uses its own
// walletClient (signed by window.ethereum); this module is the escrow's
// signing surface for payouts and the read-only public client for tx
// verification.

import {
  createPublicClient,
  createWalletClient,
  http,
  parseUnits,
  type Address,
  type Hex,
} from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { arcTestnet, USDC_ADDRESS, USDC_DECIMALS } from "./chains"

export const publicClient = createPublicClient({
  chain: arcTestnet,
  transport: http(),
})

function escrowPrivateKey(): Hex | null {
  // Prefer ARENA_ESCROW_PRIVATE_KEY; fall back to the legacy treasury key
  // (same wallet semantically — paying out the pot).
  const raw =
    process.env.ARENA_ESCROW_PRIVATE_KEY ||
    process.env.ARC_TREASURY_PRIVATE_KEY ||
    ""
  if (!raw) return null
  const hex = raw.startsWith("0x") ? raw : `0x${raw}`
  return hex as Hex
}

export function getEscrowClient() {
  const pk = escrowPrivateKey()
  if (!pk) {
    throw new Error(
      "ARENA_ESCROW_PRIVATE_KEY not set (or ARC_TREASURY_PRIVATE_KEY as fallback)",
    )
  }
  const account = privateKeyToAccount(pk)
  const walletClient = createWalletClient({
    account,
    chain: arcTestnet,
    transport: http(),
  })
  return { walletClient, account }
}

// Minimal ERC-20 ABI fragments we use directly.
export const ERC20_TRANSFER_ABI = [
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const

// Transfer event topic: keccak256("Transfer(address,address,uint256)")
export const TRANSFER_EVENT_TOPIC =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef" as const

// Send `amount` (USDC string) from escrow to `to`. Returns the tx hash.
export async function sendUSDCFromEscrow(
  to: Address,
  amountUSDC: string,
): Promise<Hex> {
  const { walletClient, account } = getEscrowClient()
  const value = parseUnits(amountUSDC, USDC_DECIMALS)
  return walletClient.writeContract({
    account,
    chain: arcTestnet,
    address: USDC_ADDRESS as Address,
    abi: ERC20_TRANSFER_ABI,
    functionName: "transfer",
    args: [to, value],
  })
}

// Verify that a tx hash is a settled USDC transfer of `expectedAmount`
// from `from` to `escrow`. Returns true iff all conditions hold.
export async function verifyUSDCTransfer(opts: {
  hash: Hex
  from: Address
  to: Address
  expectedAmountUSDC: string
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  const { hash, from, to, expectedAmountUSDC } = opts
  let receipt
  try {
    receipt = await publicClient.waitForTransactionReceipt({
      hash,
      timeout: 30_000,
      pollingInterval: 1500,
    })
  } catch (e: any) {
    return { ok: false, reason: `receipt unavailable: ${e?.message ?? e}` }
  }
  if (receipt.status !== "success") {
    return { ok: false, reason: `tx status=${receipt.status}` }
  }
  if (
    (receipt.to ?? "").toLowerCase() !== USDC_ADDRESS.toLowerCase()
  ) {
    return { ok: false, reason: "tx not sent to USDC contract" }
  }

  const expectedValue = parseUnits(expectedAmountUSDC, USDC_DECIMALS)
  const fromTopic = `0x${"0".repeat(24)}${from.slice(2).toLowerCase()}`
  const toTopic = `0x${"0".repeat(24)}${to.slice(2).toLowerCase()}`

  const transferLog = receipt.logs.find((log) => {
    if (log.address.toLowerCase() !== USDC_ADDRESS.toLowerCase()) return false
    if (log.topics[0]?.toLowerCase() !== TRANSFER_EVENT_TOPIC) return false
    if (log.topics[1]?.toLowerCase() !== fromTopic) return false
    if (log.topics[2]?.toLowerCase() !== toTopic) return false
    const value = BigInt(log.data || "0x0")
    return value === expectedValue
  })

  if (!transferLog) {
    return {
      ok: false,
      reason: `no matching USDC Transfer(${from}→${to}, ${expectedAmountUSDC}) in receipt`,
    }
  }
  return { ok: true }
}
