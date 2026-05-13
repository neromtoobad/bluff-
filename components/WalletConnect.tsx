"use client"

import { useState } from "react"
import type { EIP1193Provider } from "viem"

declare global {
  interface Window {
    ethereum?: EIP1193Provider
  }
}

type Props = {
  onConnect: (address: string) => void
}

export default function WalletConnect({ onConnect }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConnect() {
    setError(null)
    if (typeof window === "undefined" || !window.ethereum) {
      setError(
        "No browser wallet detected. Install MetaMask or another EIP-1193 wallet.",
      )
      return
    }
    setLoading(true)
    try {
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[]
      const address = accounts?.[0]
      if (!address) throw new Error("no account returned")
      // Mark this wallet as a browser-connected EOA so betting can spend real
      // USDC. The arena page stores this in sessionStorage and the bet panel
      // reads it.
      try {
        sessionStorage.setItem("arc:walletMode", "browser")
        sessionStorage.setItem("arc:walletAddress", address)
      } catch {}
      onConnect(address)
    } catch (err: any) {
      setError(err?.message ?? "wallet connect failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-card)] p-5">
      <h2 className="text-sm font-black tracking-widest uppercase text-[color:var(--accent)]">
        Connect wallet
      </h2>
      <p className="mt-1 text-xs text-zinc-400">
        Use your browser wallet (MetaMask / Rabby / Coinbase Wallet) with Arc
        testnet USDC.
      </p>
      <button
        type="button"
        onClick={handleConnect}
        disabled={loading}
        className="mt-4 w-full rounded-md bg-[color:var(--accent)] py-2.5 text-sm font-black tracking-wider uppercase text-black hover:brightness-110 disabled:opacity-40"
      >
        {loading ? "Connecting…" : "Connect wallet"}
      </button>
      {error && (
        <p className="mt-3 text-xs text-[color:var(--bear)]" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
