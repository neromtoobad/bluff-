"use client"

import { useEffect, useState } from "react"
import { createPublicClient, erc20Abi, formatUnits, http, type Address } from "viem"
import {
  arcExplorerAddress,
  arcTestnet,
  USDC_ADDRESS,
  USDC_DECIMALS,
} from "@/lib/chains"

type Props = {
  address: string
  // Allow callers to pass a precomputed balance to skip the live fetch.
  // When omitted (the default), this component reads it from the Arc RPC
  // every 5s.
  usdcBalance?: string
}

function truncate(addr: string) {
  if (addr.length <= 12) return addr
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

const publicClient = createPublicClient({
  chain: arcTestnet,
  transport: http(),
})

const FAUCET_URL = "https://faucet.circle.com?chain=arc-testnet"

export default function WalletBadge({ address, usdcBalance }: Props) {
  const [balance, setBalance] = useState<string | null>(usdcBalance ?? null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (usdcBalance !== undefined) {
      setBalance(usdcBalance)
      return
    }
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) return
    let live = true

    const fetchBalance = async () => {
      try {
        const raw = (await publicClient.readContract({
          address: USDC_ADDRESS as Address,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [address as Address],
        })) as bigint
        if (!live) return
        setBalance(Number(formatUnits(raw, USDC_DECIMALS)).toFixed(2))
        setError(null)
      } catch (e: any) {
        if (!live) return
        setError(e?.message ?? "balance fetch failed")
      }
    }

    fetchBalance()
    const id = setInterval(fetchBalance, 5000)
    return () => {
      live = false
      clearInterval(id)
    }
  }, [address, usdcBalance])

  const isZero = balance != null && Number(balance) === 0
  const showBalance = balance != null && !error

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border-soft)] bg-[color:var(--surface)]/85 px-3 py-1.5 text-[11px] backdrop-blur">
      <span
        className="h-2 w-2 rounded-full bg-[color:var(--arc-blue)]"
        style={{ boxShadow: "0 0 8px rgba(78,161,255,0.85)" }}
        aria-label="Connected to Arc Testnet"
      />
      <span className="font-mono text-[color:var(--text)]">{truncate(address)}</span>
      <span className="text-[color:var(--border-soft)]">·</span>
      {showBalance ? (
        <span className="font-mono text-[color:var(--gold-1)]">
          ${balance} USDC
        </span>
      ) : error ? (
        <span className="font-mono text-rose-300" title={error}>
          balance unavailable
        </span>
      ) : (
        <span className="font-mono text-[color:var(--text-mute)]">loading…</span>
      )}
      <a
        href={arcExplorerAddress(address)}
        target="_blank"
        rel="noreferrer"
        className="ml-1 font-ui-label text-[9px] tracking-widest text-[color:var(--text-mute)] hover:text-[color:var(--arc-blue)]"
      >
        ↗ ARC
      </a>
      {isZero && (
        <a
          href={FAUCET_URL}
          target="_blank"
          rel="noreferrer"
          className="ml-1 rounded-full border border-[color:var(--lime)]/40 bg-[color:var(--lime)]/10 px-2 py-0.5 font-ui-label text-[9px] tracking-widest text-[color:var(--lime)] hover:bg-[color:var(--lime)]/20"
        >
          Get testnet USDC →
        </a>
      )}
    </div>
  )
}
