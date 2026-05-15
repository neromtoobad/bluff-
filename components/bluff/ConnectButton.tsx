"use client"

import { useEffect, useRef, useState } from "react"
import { ARC_CHAIN_ID, ARC_CHAIN_ID_HEX, arcExplorerAddress } from "@/lib/chains"

type Status =
  | "idle"
  | "connecting"
  | "switching"
  | "adding"
  | "connected"
  | "error"

function short(a: string): string {
  return `${a.slice(0, 6)}…${a.slice(-4)}`
}

type Props = { className?: string }

export default function ConnectButton({ className }: Props) {
  const [address, setAddress] = useState<string | null>(null)
  const [status, setStatus] = useState<Status>("idle")
  const [error, setError] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const a = sessionStorage.getItem("arc:walletAddress")
      if (a && /^0x[a-fA-F0-9]{40}$/.test(a)) {
        setAddress(a)
        setStatus("connected")
      }
    } catch {}
  }, [])

  useEffect(() => {
    const eth = (window as any).ethereum
    if (!eth || typeof eth.on !== "function") return
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
        setMenuOpen(false)
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

  useEffect(() => {
    if (!menuOpen) return
    const onPointer = (e: PointerEvent) => {
      const node = wrapRef.current
      if (node && !node.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false)
    }
    document.addEventListener("pointerdown", onPointer)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("pointerdown", onPointer)
      document.removeEventListener("keydown", onKey)
    }
  }, [menuOpen])

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

  function disconnect() {
    try {
      sessionStorage.removeItem("arc:walletAddress")
      sessionStorage.removeItem("arc:walletMode")
      sessionStorage.removeItem("arc:chainId")
    } catch {}
    setAddress(null)
    setStatus("idle")
    setMenuOpen(false)
    setError(null)
  }

  async function copyAddress() {
    if (!address) return
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {}
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

  const isBusy =
    status === "connecting" || status === "switching" || status === "adding"
  const isConnected = status === "connected" && address !== null

  return (
    <div ref={wrapRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => {
          if (isBusy) return
          if (isConnected) {
            setMenuOpen((v) => !v)
          } else {
            handleConnect()
          }
        }}
        disabled={isBusy}
        className={`${baseCls} disabled:opacity-60`}
      >
        {label}
      </button>

      {isConnected && menuOpen && address ? (
        <div className="absolute right-0 top-full z-[70] mt-2 w-64 overflow-hidden rounded-xl border-2 border-[color:var(--border-soft)] bg-[color:var(--surface-2)]/95 shadow-[0_18px_60px_-20px_rgba(0,0,0,0.7)] backdrop-blur">
          <div className="border-b border-[color:var(--border)] px-3 py-3">
            <p className="font-ui-label text-[9px] tracking-widest text-[color:var(--text-mute)]">
              Connected · Arc Testnet
            </p>
            <p className="mt-1 break-all font-mono text-[11px] leading-snug text-[color:var(--gold-1)]">
              {address}
            </p>
          </div>
          <button
            type="button"
            onClick={copyAddress}
            className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left font-ui-label text-[11px] tracking-widest text-[color:var(--text)] hover:bg-[color:var(--lime)]/10"
          >
            {copied ? "Copied ✓" : "Copy address"}
          </button>
          <a
            href={arcExplorerAddress(address)}
            target="_blank"
            rel="noreferrer"
            onClick={() => setMenuOpen(false)}
            className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left font-ui-label text-[11px] tracking-widest text-[color:var(--text)] hover:bg-[color:var(--lime)]/10"
          >
            View on Arc explorer ↗
          </a>
          <button
            type="button"
            onClick={disconnect}
            className="flex w-full items-center justify-between gap-3 border-t border-[color:var(--border)] px-3 py-2.5 text-left font-ui-label text-[11px] tracking-widest text-rose-300 hover:bg-rose-500/15"
          >
            Disconnect
          </button>
        </div>
      ) : null}

      {error ? (
        <span className="ml-2 font-ui-label text-[9px] tracking-widest text-rose-300">
          {error}
        </span>
      ) : null}
    </div>
  )
}
