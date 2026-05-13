"use client"

import { useState } from "react"
import WalletBadge from "./WalletBadge"

type Step = "email" | "otp" | "provisioning" | "done"

type Props = {
  onWallet?: (address: string) => void
}

export default function EmailLogin({ onWallet }: Props = {}) {
  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [userId, setUserId] = useState<string | null>(null)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hint, setHint] = useState<string | null>(null)

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch("/api/auth/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "failed to send OTP")
      setUserId(json.userId)
      setHint(json.hint ?? null)

      // ---------- REAL CIRCLE PATH ----------
      // If the server returned a userToken + challengeId, we're in the
      // real Web SDK flow. Drive PIN setup through W3SSdk, then ask the
      // server for the provisioned wallet address.
      if (json.userToken && json.encryptionKey && json.challengeId) {
        setStep("provisioning")
        try {
          const mod = await import("@circle-fin/w3s-pw-web-sdk")
          const W3SSdk: any = (mod as any).W3SSdk ?? (mod as any).default
          const sdk = new W3SSdk({
            appSettings: {
              appId:
                json.appId ?? process.env.NEXT_PUBLIC_CIRCLE_APP_ID ?? "",
            },
          })
          sdk.setAuthentication({
            userToken: json.userToken,
            encryptionKey: json.encryptionKey,
          })
          await new Promise<void>((resolve, reject) => {
            sdk.execute(json.challengeId, (err: any, result: any) => {
              if (err) reject(new Error(err?.message ?? "Circle SDK error"))
              else if (
                result?.status === "COMPLETE" ||
                result?.status === "Completed" ||
                result?.status === "IN_PROGRESS"
              ) {
                resolve()
              } else {
                reject(new Error(`Circle SDK status: ${result?.status}`))
              }
            })
          })
          // Wallet is provisioned — ask the server for the address.
          const v = await fetch("/api/auth/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: json.userId }),
          })
          const vJson = await v.json()
          if (!v.ok) throw new Error(vJson.error ?? "failed to fetch wallet")
          setWalletAddress(vJson.walletAddress)
          setStep("done")
          onWallet?.(vJson.walletAddress)
        } catch (sdkErr: any) {
          setStep("email")
          throw sdkErr
        }
        return
      }

      // ---------- MOCK / OTP PATH ----------
      setStep("otp")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) return
    setError(null)
    setLoading(true)
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, otp }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "failed to verify OTP")
      setWalletAddress(json.walletAddress)
      setStep("done")
      onWallet?.(json.walletAddress)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (step === "done" && walletAddress) {
    return (
      <div className="flex flex-col items-center gap-3">
        <p className="text-sm text-zinc-400">Smart wallet ready</p>
        <WalletBadge address={walletAddress} usdcBalance="0.00" />
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-xl">
      <h2 className="text-lg font-semibold mb-1">Sign in to bet</h2>
      <p className="text-sm text-zinc-400 mb-5">
        No seed phrase. No extension. Just email.
      </p>

      {step === "email" && (
        <form onSubmit={handleEmailSubmit} className="space-y-3">
          <input
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 disabled:opacity-50"
          >
            {loading ? "Sending…" : "Send code"}
          </button>
        </form>
      )}

      {step === "provisioning" && (
        <div className="rounded-md border border-[color:var(--accent)]/40 bg-[color:var(--accent-soft)] px-3 py-4 text-center">
          <p className="text-xs uppercase tracking-widest text-[color:var(--accent)] font-semibold">
            Provisioning wallet…
          </p>
          <p className="mt-1 text-xs text-zinc-300">
            Circle is setting up your smart wallet. Follow the prompts in the
            popup.
          </p>
        </div>
      )}

      {step === "otp" && (
        <form onSubmit={handleOtpSubmit} className="space-y-3">
          <p className="text-xs text-zinc-400">
            Code sent to <span className="text-zinc-200">{email}</span>
          </p>
          {hint && (
            <p className="rounded-md border border-amber-700/50 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
              Demo mode — {hint}
            </p>
          )}
          <input
            type="text"
            required
            autoFocus
            inputMode="numeric"
            pattern="[0-9]*"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="6-digit code"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm tracking-widest font-mono outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 disabled:opacity-50"
          >
            {loading ? "Verifying…" : "Verify & create wallet"}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("email")
              setOtp("")
            }}
            className="w-full text-xs text-zinc-400 hover:text-zinc-200"
          >
            Use a different email
          </button>
        </form>
      )}

      {error && (
        <p className="mt-3 text-sm text-rose-400" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
