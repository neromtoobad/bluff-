"use client"

import { useEffect, useState } from "react"
import { ARC_CHAIN_ID, ARC_CHAIN_ID_HEX } from "@/lib/chains"

type Status =
  | "idle"
  | "connecting"
  | "switching"
  | "adding"
  | "connected"
  | "error"

function short(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`
}

export default function ConnectButton({ className }: { className?: string }) {
  const [address, setAddress] = useState<string | null>(null)
  const [status, setStatus] = useState<Status>("idle")
  const [error, setError] = useState<string | null>(null)

  // Bootstrap from sessionStorage on mount.
  useEffect(() => {
    try {
      const a = sessionStorage.getItem("arc:walletAddress")
      if (a && /^0x[a-fA-F0-9]{40}$/.test(a)) {
        setAddress(a)
        setStatus("connected")
      }
    } catch {}
  }, [])

  // Wallet events.
  useEffect(() => {
    const eth = (window as any).ethereum
    if (!eth?.on) return
    const onAccountsChanged = (accounts: string[]) => {
      const next = accounts?.[0]
      if (!next) {
        try {
          sessionStorage.removeItem("arc:walletAddress")
          sessionStorage.removeItem("arc:walletMode")
          sessionStorage.removeItem("arc:chainId")
        } catch {}
        setAddress(null)
        setStatus("idle")
        return
      }
      try { sessionStorage.setItem("arc:walletAddress", next) } catch {}
      setAddress(next)
      setStatus("connected")
    }
    const onChainChanged = (chainIdHex: string) => {
      try {
        sessionStorage.setItem("arc:chainId", String(parseInt(chainIdHex, 16)))
      } catch {}
      if (chainIdHex.toLowerCase() !== ARC_CHAIN_ID_HEX.toLowerCase()) {
        setError("Switch your wallet back to Arc Testnet to keep playing.")
        setStatus("error")
      } else {
        setError(null)
        if (address) setStatus("connected")
      }
    }
    eth.on("accountsChanged", onAccountsChanged)
    eth.on("chainChanged", onChainChanged)
    return () => {
      eth.removeListener?.("accountsChanged", onAccountsChanged)
      eth.removeListener?.("chainChanged", onChainChanged)
    }
  }, [address])

  async function handleConnect() {
    setError(null)
    const eth = (window as any).ethereum
    if (!eth) {
      setError("Install MetaMask or Rabby to connect")
      setStatus("error")
      return
    }
    try {
      setStatus("connecting")
      const accounts = (await eth.request({
        method: "eth_requestAccounts",
      })) as string[]
      const addr = accounts?.[0]
      if (!addr) throw new Error("no account returned")

      setStatus("switching")
      try {
        await eth.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: ARC_CHAIN_ID_HEX }],
        })
      } catch (err: any) {
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

      try {
        sessionStorage.setItem("arc:walletMode", "browser")
        sessionStorage.setItem("arc:walletAddress", addr)
        sessionStorage.setItem("arc:chainId", String(ARC_CHAIN_ID))
      } catch {}
      setAddress(addr)
      setStatus("connected")
    } catch (err: any) {
      const msg = err?.shortMessage ?? err?.message ?? "wallet connect failed"
      const rejected = err?.code === 4001 || /user (rejected|denied)/i.test(msg)
      setError(rejected ? "Connection rejected. Try again." : msg)
      setStatus("error")
    }
  }

  const label =
    status === "connecting"
      ? "Connecting…"
      : status === "switching"
        ? "Switching to Arc…"
        : status === "adding"
          ? "Adding Arc Testnet…"
          : status === "connected" && address
            ? short(address)
            : "Select Wallet"

  const baseCls =
    className ??
    "lime-cta rounded-lg px-4 py-2 font-ui-label text-[11px] tracking-widest"

  return (
    <>
      <button
        type="button"
        onClick={handleConnect}
        disabled={status === "connecting" || status === "switching" || status === "adding"}
        className={`${baseCls} disabled:opacity-60`}
      >
        {label}
      </button>
      {error && (
        <span className="ml-2 font-ui-label text-[9px] tracking-widest text-rose-300">
          {error}
        </span>
      )}
    </>
  )
}
