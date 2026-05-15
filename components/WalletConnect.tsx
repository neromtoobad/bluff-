"use client"

import { useEffect, useState } from "react"
import type { EIP1193Provider } from "viem"
import { ARC_CHAIN_ID_HEX, ARC_CHAIN_ID } from "@/lib/chains"

declare global {
  interface Window {
    ethereum?: EIP1193Provider & {
      on?: (event: string, handler: (...args: any[]) => void) => void
      removeListener?: (event: string, handler: (...args: any[]) => void) => void
    }
  }
}

type Status =
  | "idle"
  | "connecting"
  | "switching"
  | "adding"
  | "connected"
  | "error"

type Props = {
  onConnect: (address: string) => void
}

export default function WalletConnect({ onConnect }: Props) {
  const [status, setStatus] = useState<Status>("idle")
  const [error, setError] = useState<string | null>(null)
  const [address, setAddress] = useState<string | null>(null)

  // Listen for account / chain changes so we don't keep stale state.
  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum?.on) return
    const eth = window.ethereum

    const onAccountsChanged = (accounts: string[]) => {
      const next = accounts?.[0] ?? null
      if (!next) {
        // disconnected
        try {
          sessionStorage.removeItem("arc:walletAddress")
          sessionStorage.removeItem("arc:walletMode")
          sessionStorage.removeItem("arc:chainId")
        } catch {}
        setAddress(null)
        setStatus("idle")
        return
      }
      try {
        sessionStorage.setItem("arc:walletAddress", next)
      } catch {}
      setAddress(next)
      onConnect(next)
    }

    const onChainChanged = (chainIdHex: string) => {
      try {
        const id = parseInt(chainIdHex, 16)
        sessionStorage.setItem("arc:chainId", String(id))
      } catch {}
      // If they navigated away from Arc, surface an error.
      if (chainIdHex.toLowerCase() !== ARC_CHAIN_ID_HEX.toLowerCase()) {
        setError("Wallet switched off Arc Testnet — switch back to keep playing.")
        setStatus("error")
      } else {
        setError(null)
        if (address) setStatus("connected")
      }
    }

    eth.on?.("accountsChanged", onAccountsChanged)
    eth.on?.("chainChanged", onChainChanged)
    return () => {
      eth.removeListener?.("accountsChanged", onAccountsChanged)
      eth.removeListener?.("chainChanged", onChainChanged)
    }
  }, [address, onConnect])

  async function handleConnect() {
    setError(null)
    if (typeof window === "undefined" || !window.ethereum) {
      setError("Install MetaMask or Rabby to connect")
      setStatus("error")
      return
    }
    const eth = window.ethereum

    try {
      // 1. Request accounts
      setStatus("connecting")
      const accounts = (await eth.request({
        method: "eth_requestAccounts",
      })) as string[]
      const addr = accounts?.[0]
      if (!addr) throw new Error("no account returned")

      // 2. Try to switch to Arc Testnet
      setStatus("switching")
      try {
        await eth.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: ARC_CHAIN_ID_HEX }],
        })
      } catch (err: any) {
        // 3. Chain doesn't exist in the wallet — add it then it's auto-selected.
        if (err?.code === 4902 || /Unrecognized chain/i.test(err?.message ?? "")) {
          setStatus("adding")
          await eth.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: ARC_CHAIN_ID_HEX,
                chainName: "Arc Testnet",
                nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
                rpcUrls: ["https://rpc.testnet.arc.network"],
                blockExplorerUrls: ["https://testnet.arcscan.app"],
              },
            ],
          })
        } else {
          throw err
        }
      }

      // 4. Persist + notify
      try {
        sessionStorage.setItem("arc:walletMode", "browser")
        sessionStorage.setItem("arc:walletAddress", addr)
        sessionStorage.setItem("arc:chainId", String(ARC_CHAIN_ID))
      } catch {}
      setAddress(addr)
      setStatus("connected")
      onConnect(addr)
    } catch (err: any) {
      // User rejection codes vary by wallet (4001 / -32603 / "user rejected")
      const msg = err?.message ?? "wallet connect failed"
      const code = err?.code
      const rejected = code === 4001 || /user (rejected|denied)/i.test(msg)
      setError(rejected ? "Connection rejected. Try again when you're ready." : msg)
      setStatus("error")
    }
  }

  const buttonLabel =
    status === "connecting"
      ? "Connecting…"
      : status === "switching"
        ? "Switching to Arc Testnet…"
        : status === "adding"
          ? "Adding Arc Testnet to your wallet…"
          : status === "connected"
            ? `Connected ✓ ${address ? short(address) : ""}`
            : "Connect wallet"

  return (
    <div className="w-full max-w-sm rounded-2xl border-2 border-[color:var(--border-soft)] bg-[color:var(--surface)]/85 p-5 backdrop-blur">
      <p className="font-display text-lg tracking-widest text-[color:var(--lime)]">
        ◆ CONNECT WALLET
      </p>
      <p className="mt-1 text-xs text-[color:var(--text-mute)]">
        MetaMask / Rabby / Coinbase Wallet — we'll add Arc Testnet automatically.
      </p>
      <button
        type="button"
        onClick={handleConnect}
        disabled={status === "connecting" || status === "switching" || status === "adding"}
        className="lime-cta mt-4 w-full rounded-xl px-4 py-3 font-display text-lg tracking-wide disabled:opacity-60"
      >
        {buttonLabel}
      </button>
      {error && (
        <p className="mt-3 text-xs text-rose-300" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

function short(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`
}
