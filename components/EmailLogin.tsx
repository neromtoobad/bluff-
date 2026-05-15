"use client"

import { useEffect, useRef, useState } from "react"
import WalletBadge from "./WalletBadge"

// Three explicit states the user sees in order.
type Status =
  | { kind: "idle" }
  | { kind: "sending" } //         "Sending code…"
  | { kind: "provisioning" } //    "Setting up your wallet…"
  | { kind: "ready"; address: string } // "Wallet ready ✓"
  | { kind: "error"; message: string }

type Props = {
  onWallet?: (address: string) => void
  /** Where to redirect on success. Defaults to /lobby. Pass null to stay. */
  redirectTo?: string | null
}

const APP_ID = process.env.NEXT_PUBLIC_CIRCLE_APP_ID ?? ""

export default function EmailLogin({ onWallet, redirectTo = "/lobby" }: Props = {}) {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<Status>({ kind: "idle" })
  const sdkRef = useRef<any>(null)
  const sdkReadyRef = useRef(false)

  // Initialize the Circle Web SDK once on mount and grab a device id.
  // Per Circle's user-controlled wallets skill: "You must call
  // sdk.getDeviceId() after SDK initialization … without this call,
  // sdk.execute() will silently fail."
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const mod = await import("@circle-fin/w3s-pw-web-sdk")
        const W3SSdk: any = (mod as any).W3SSdk ?? (mod as any).default
        if (!APP_ID) {
          console.error("[email-login] NEXT_PUBLIC_CIRCLE_APP_ID is not set")
        }
        const sdk = new W3SSdk({ appSettings: { appId: APP_ID } })

        // Cache the device id so we don't re-establish the iframe session
        // on every mount. Circle docs use localStorage here.
        let deviceId = ""
        try {
          deviceId = localStorage.getItem("circle:deviceId") ?? ""
        } catch {}
        if (!deviceId) {
          deviceId = await sdk.getDeviceId()
          try {
            localStorage.setItem("circle:deviceId", deviceId)
          } catch {}
        }

        if (cancelled) return
        sdkRef.current = sdk
        sdkReadyRef.current = true
      } catch (err: any) {
        console.error("[email-login] SDK init failed:", err?.message ?? err)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status.kind === "sending" || status.kind === "provisioning") return

    setStatus({ kind: "sending" })

    let initJson: {
      userId?: string
      userToken?: string
      encryptionKey?: string
      challengeId?: string
      alreadyInitialized?: boolean
      appId?: string
      error?: string
    }
    try {
      const res = await fetch("/api/auth/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      initJson = await res.json()
      if (!res.ok) {
        throw new Error(initJson.error ?? "failed to start sign-up")
      }
    } catch (err: any) {
      setStatus({ kind: "error", message: err?.message ?? "sign-up failed" })
      return
    }

    const { userId, userToken, encryptionKey, challengeId, alreadyInitialized } =
      initJson
    if (!userId || !userToken || !encryptionKey) {
      setStatus({
        kind: "error",
        message: "Circle did not return a session — check server logs",
      })
      return
    }

    setStatus({ kind: "provisioning" })

    try {
      // Returning user — PIN was set previously, wallet already exists. Skip
      // the challenge UI and read the address straight from Circle.
      if (alreadyInitialized) {
        // fall through to /verify
      } else {
        if (!challengeId) {
          throw new Error("Circle did not return a challenge")
        }
        const sdk = sdkRef.current
        if (!sdk || !sdkReadyRef.current) {
          throw new Error("Wallet SDK not ready, try again")
        }
        sdk.setAuthentication({ userToken, encryptionKey })
        await new Promise<void>((resolve, reject) => {
          sdk.execute(challengeId, (err: any, result: any) => {
            if (err) {
              reject(new Error(err?.message ?? "Circle PIN flow failed"))
              return
            }
            const s = (result?.status ?? "").toUpperCase()
            if (s === "COMPLETE" || s === "COMPLETED" || s === "IN_PROGRESS") {
              resolve()
            } else {
              reject(new Error(`Circle PIN flow status: ${result?.status ?? "?"}`))
            }
          })
        })
      }

      // Wallet is provisioned — read the Arc address back from Circle.
      const v = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })
      const vJson = await v.json()
      if (!v.ok) throw new Error(vJson.error ?? "failed to fetch wallet")
      const address: string = vJson.walletAddress
      const walletIdFromCircle: string | undefined = vJson.walletId
      if (!address) throw new Error("wallet address missing from /verify")

      // Persist for ConnectButton / WalletBadge / StatsCard / play-page bet flow.
      // walletMode = "circle" so the bet path routes through the Circle
      // transaction-challenge API instead of window.ethereum.
      try {
        sessionStorage.setItem("arc:walletAddress", address)
        sessionStorage.setItem("arc:walletMode", "circle")
        sessionStorage.setItem("arc:chainId", "5042002")
        sessionStorage.setItem("arc:circleUserId", userId)
        if (walletIdFromCircle) {
          sessionStorage.setItem("arc:circleWalletId", walletIdFromCircle)
        }
      } catch {}

      setStatus({ kind: "ready", address })
      onWallet?.(address)

      if (redirectTo) {
        // Tiny delay so the user sees the "Wallet ready ✓" state before nav.
        setTimeout(() => {
          window.location.href = redirectTo
        }, 800)
      }
    } catch (err: any) {
      setStatus({ kind: "error", message: err?.message ?? "PIN flow failed" })
    }
  }

  if (status.kind === "ready") {
    return (
      <div className="flex flex-col items-center gap-3">
        <p className="font-ui-label text-[11px] tracking-widest text-[color:var(--lime)]">
          ◆ WALLET READY ✓
        </p>
        <WalletBadge address={status.address} />
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm rounded-2xl border-2 border-[color:var(--border-soft)] bg-[color:var(--surface)]/85 p-6 shadow-xl backdrop-blur">
      <p className="font-display text-2xl tracking-tight text-[color:var(--gold-1)]">
        Sign in to play
      </p>
      <p className="mt-1 text-sm text-[color:var(--text-mute)]">
        No seed phrase. Circle creates an Arc Testnet smart wallet for your email.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-3">
        <input
          type="email"
          required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          disabled={status.kind === "sending" || status.kind === "provisioning"}
          className="w-full rounded-lg border border-[color:var(--border)] bg-black/40 px-3 py-2 text-sm outline-none focus:border-[color:var(--lime)] disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={status.kind === "sending" || status.kind === "provisioning"}
          className="lime-cta w-full rounded-xl px-3 py-3 font-display text-lg tracking-wide disabled:opacity-60"
        >
          {status.kind === "sending"
            ? "Sending code…"
            : status.kind === "provisioning"
              ? "Setting up your wallet…"
              : "Create wallet"}
        </button>
      </form>

      {status.kind === "provisioning" && (
        <p className="mt-3 text-xs text-[color:var(--text-mute)]">
          Follow the prompts in Circle's PIN-setup window.
        </p>
      )}

      {status.kind === "error" && (
        <p className="mt-3 text-xs text-rose-300" role="alert">
          {status.message}
        </p>
      )}
    </div>
  )
}
