"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import AgentCard from "@/components/bluff/AgentCard"
import ClaimDisplay from "@/components/bluff/ClaimDisplay"
import BetButtons, { type Pick } from "@/components/bluff/BetButtons"
import Reveal from "@/components/bluff/Reveal"
import StreakBadge from "@/components/bluff/StreakBadge"
import FullscreenFlash from "@/components/bluff/FullscreenFlash"
import Confetti from "@/components/bluff/Confetti"
import { ChestMascot, OracleMascot } from "@/components/bluff/Mascots"
import TopNav from "@/components/bluff/TopNav"
import * as audio from "@/lib/audio"

type Phase = "idle" | "loading" | "streaming" | "betting" | "revealed"

type RevealData = { liar: "A" | "B"; truth: string; source: string }

type PlacedBet = {
  pick: Pick
  amount: number
  txHash?: string
  explorerUrl?: string
  pending?: boolean
  error?: string
}

type SettleReceipt = {
  walletAddress: string
  won: boolean
  payout: string
  multiplier: number
  streakAfter: number
  txHash?: string
  explorerUrl?: string
}

export default function PlayPage() {
  const [autoStart, setAutoStart] = useState(false)
  const [phase, setPhase] = useState<Phase>("idle")
  const [topic, setTopic] = useState<string>("")
  const [claimA, setClaimA] = useState("")
  const [claimB, setClaimB] = useState("")
  const [speaking, setSpeaking] = useState<"A" | "B" | null>(null)
  const [deadline, setDeadline] = useState<number>(0)
  const [now, setNow] = useState<number>(Date.now())
  const [bet, setBet] = useState<PlacedBet | null>(null)
  const [reveal, setReveal] = useState<RevealData | null>(null)
  const [tell, setTell] = useState<string | null>(null)
  const [streak, setStreak] = useState<number>(0)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [settleReceipt, setSettleReceipt] = useState<SettleReceipt | null>(null)
  const [flash, setFlash] = useState<
    | { tone: "win" | "loss"; title: string; subtitle?: string }
    | null
  >(null)
  const [confetti, setConfetti] = useState(false)
  const [topicUrl, setTopicUrl] = useState<string | null>(null)
  const [amount, setAmount] = useState<number>(0.5)
  const roundIdRef = useRef<string | null>(null)
  const roundTokenRef = useRef<string | null>(null)
  const esRef = useRef<EventSource | null>(null)
  const autoStartedRef = useRef(false)

  // Read ?auto=1 once on mount (client-only — avoids Suspense boundary).
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      if (params.get("auto") === "1") setAutoStart(true)
    } catch {}
  }, [])

  // Wallet + streak.
  useEffect(() => {
    try {
      const addr = sessionStorage.getItem("arc:walletAddress")
      if (addr) {
        setWalletAddress(addr)
        fetch(`/api/streak?walletAddress=${addr}`)
          .then((r) => r.json())
          .then((j) => setStreak(j.streak ?? 0))
          .catch(() => {})
      }
    } catch {}
  }, [])

  // Countdown tick.
  useEffect(() => {
    if (phase !== "streaming" && phase !== "betting") return
    const t = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(t)
  }, [phase])

  useEffect(() => () => esRef.current?.close(), [])

  const settle = useCallback(
    async (roundId: string, currentBet: PlacedBet | null, liar: "A" | "B") => {
      try {
        const res = await fetch("/api/round/settle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roundId,
            roundToken: roundTokenRef.current,
            // Fallback for Vercel cross-lambda: if the settle lambda has no
            // in-memory record of this user's bet, this lets it settle anyway.
            userBet:
              currentBet && walletAddress
                ? {
                    walletAddress,
                    pick: currentBet.pick,
                    amount: currentBet.amount.toFixed(2),
                    txHash: currentBet.txHash,
                    explorerUrl: currentBet.explorerUrl,
                  }
                : undefined,
          }),
        })
        const json = await res.json()
        if (json?.tell) setTell(json.tell)
        const receipts = (json?.receipts ?? []) as SettleReceipt[]
        const mine = walletAddress
          ? receipts.find(
              (r) => r.walletAddress.toLowerCase() === walletAddress.toLowerCase(),
            )
          : null
        if (mine) {
          setSettleReceipt(mine)
          setStreak(mine.streakAfter)
          if (mine.won) {
            setConfetti(true)
            try { audio.winnerReveal() } catch {}
            setFlash({
              tone: "win",
              title: "HOT STREAK",
              subtitle: `×${mine.multiplier} — PAYOUT $${mine.payout}`,
            })
          } else if (currentBet) {
            const priorStreak = streak
            if (priorStreak >= 3) {
              setFlash({ tone: "loss", title: "STREAK BROKEN" })
            } else {
              setFlash({ tone: "loss", title: "BLUFF MISSED" })
            }
            try { audio.roundEnd() } catch {}
          }
        } else if (currentBet) {
          // No wallet — local outcome. User picks the TRUTH-teller now,
          // so they win iff they did NOT pick the liar.
          const won = currentBet.pick !== liar
          if (won) {
            setStreak((s) => s + 1)
            setConfetti(true)
            try { audio.winnerReveal() } catch {}
            setFlash({ tone: "win", title: "YOU WIN" })
          } else {
            if (streak >= 3) setFlash({ tone: "loss", title: "STREAK BROKEN" })
            else setFlash({ tone: "loss", title: "BLUFF MISSED" })
            try { audio.roundEnd() } catch {}
            setStreak(0)
          }
        }
      } catch {}
    },
    [walletAddress, streak],
  )

  const startRound = useCallback(async () => {
    // Tear down any in-flight stream before starting a new one.
    // React strict-mode + auto-start can race; this prevents the
    // duplicate-token bug where two streams write to the same claim.
    esRef.current?.close()
    esRef.current = null

    setPhase("loading")
    setClaimA("")
    setClaimB("")
    setBet(null)
    setReveal(null)
    setSettleReceipt(null)
    setSpeaking(null)
    setTell(null)
    setConfetti(false)

    try { audio.roundBell() } catch {}
    try { audio.startCrowdAmbience(0.04) } catch {}

    const res = await fetch("/api/round/start", { method: "POST" })
    if (!res.ok) {
      setPhase("idle")
      return
    }
    const { roundId, topic: t, topicUrl: tu, liarRevealedAt, roundToken } =
      await res.json()
    roundIdRef.current = roundId
    roundTokenRef.current = roundToken ?? null
    setTopic(t)
    setTopicUrl(tu ?? null)
    setDeadline(liarRevealedAt)
    setPhase("streaming")

    // Pass roundToken so the stream can serve even from a cold lambda.
    const streamUrl =
      `/api/round/stream?roundId=${encodeURIComponent(roundId)}` +
      (roundToken ? `&roundToken=${encodeURIComponent(roundToken)}` : "")
    const es = new EventSource(streamUrl)
    esRef.current = es

    es.addEventListener("agent_start", (e) => {
      const { agent } = JSON.parse((e as MessageEvent).data)
      setSpeaking(agent)
    })
    es.addEventListener("agent_token", (e) => {
      const { agent, token } = JSON.parse((e as MessageEvent).data)
      if (agent === "A") setClaimA((s) => s + token)
      else setClaimB((s) => s + token)
    })
    es.addEventListener("agent_done", () => setSpeaking(null))
    es.addEventListener("betting_open", (e) => {
      const { deadline: d } = JSON.parse((e as MessageEvent).data)
      setDeadline(d)
      setPhase("betting")
    })
    es.addEventListener("reveal", (e) => {
      const data = JSON.parse((e as MessageEvent).data) as RevealData
      setReveal(data)
      setPhase("revealed")
      es.close()
      setTimeout(() => {
        setBet((current) => {
          settle(roundId, current, data.liar)
          return current
        })
      }, 50)
    })
    es.onerror = () => es.close()
  }, [settle])

  // Auto-start when navigated from /lobby?auto=1.
  useEffect(() => {
    if (autoStart && !autoStartedRef.current && phase === "idle") {
      autoStartedRef.current = true
      startRound()
    }
  }, [autoStart, phase, startRound])

  // No more auto-restart — the user chooses Play Again or Leave on Reveal.

  const placeBet = async (pick: Pick, amount: number) => {
    if (phase !== "betting") return
    const roundId = roundIdRef.current
    if (!roundId) return

    if (!walletAddress) {
      setBet({ pick, amount, error: "no wallet — simulated bet only" })
      return
    }

    const escrow = process.env.NEXT_PUBLIC_ARENA_ESCROW_ADDRESS as
      | string
      | undefined
    if (!escrow || !/^0x[a-fA-F0-9]{40}$/.test(escrow)) {
      setBet({ pick, amount, error: "escrow address not configured" })
      return
    }

    const walletMode = (() => {
      try { return sessionStorage.getItem("arc:walletMode") } catch { return null }
    })()

    // ── Circle SCA path ────────────────────────────────────────────────
    // walletMode === "circle" → user signed up via email, key is held by
    // Circle. Use the contract-execution challenge API instead of
    // window.ethereum: backend creates challenge → SDK execute (PIN) →
    // poll Circle for the on-chain tx hash → /api/round/bet verifies it.
    if (walletMode === "circle") {
      const userId = sessionStorage.getItem("arc:circleUserId") ?? ""
      const walletId = sessionStorage.getItem("arc:circleWalletId") ?? ""
      if (!userId || !walletId) {
        setBet({
          pick,
          amount,
          error: "Circle session missing — sign in again at /sign-in",
        })
        return
      }
      setBet({ pick, amount, pending: true })
      try {
        const amountStr = amount.toFixed(2)
        const challengeRes = await fetch("/api/circle/bet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, walletId, escrow, amount: amountStr }),
        })
        const challengeJson = await challengeRes.json()
        if (!challengeRes.ok) {
          throw new Error(challengeJson?.error ?? "Circle bet challenge failed")
        }
        const { challengeId, transactionId } = challengeJson as {
          challengeId: string
          transactionId?: string
        }

        // Prompt PIN via the Circle Web SDK.
        const mod = await import("@circle-fin/w3s-pw-web-sdk")
        const W3SSdk: any = (mod as any).W3SSdk ?? (mod as any).default
        const sdk = new W3SSdk({
          appSettings: { appId: process.env.NEXT_PUBLIC_CIRCLE_APP_ID ?? "" },
        })
        // Re-issue a userToken so the SDK can auth this challenge. The
        // server already refreshed/has one stashed for createContractExecution,
        // so we just need the latest pair. Refresh by calling /api/auth/init
        // with a sentinel — or simpler: ask /api/auth/verify (it doesn't
        // expose tokens); instead, drive the SDK with the same token chain
        // by re-fetching via /api/circle/bet response (it doesn't return
        // userToken). Cleanest: piggyback on init's session — we kept the
        // userToken server-side. So fetch a fresh /api/auth/init keyed by
        // userId? We don't expose that. Best path: have the bet endpoint
        // also return the userToken+encryptionKey so the SDK can authenticate.
        // For now, fetch them via a session-refresh ping.
        const ping = await fetch("/api/circle/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        })
        const pingJson = await ping.json()
        if (!ping.ok || !pingJson?.userToken || !pingJson?.encryptionKey) {
          throw new Error("Circle session refresh failed")
        }
        try {
          let deviceId = ""
          try { deviceId = localStorage.getItem("circle:deviceId") ?? "" } catch {}
          if (!deviceId) {
            deviceId = await sdk.getDeviceId()
            try { localStorage.setItem("circle:deviceId", deviceId) } catch {}
          }
        } catch {}
        sdk.setAuthentication({
          userToken: pingJson.userToken,
          encryptionKey: pingJson.encryptionKey,
        })

        // Capture any tx id the SDK callback surfaces — varies by SDK version.
        let executeTxId: string | null = null
        await new Promise<void>((resolve, reject) => {
          sdk.execute(challengeId, (err: any, result: any) => {
            if (err) {
              reject(new Error(err?.message ?? "PIN approval failed"))
              return
            }
            executeTxId =
              result?.data?.id ??
              result?.data?.transactionId ??
              result?.transactionId ??
              result?.id ??
              null
            const s = (result?.status ?? "").toUpperCase()
            if (s === "COMPLETE" || s === "COMPLETED" || s === "IN_PROGRESS") {
              resolve()
            } else {
              reject(new Error(`Circle execute status: ${result?.status ?? "?"}`))
            }
          })
        })

        // Resolve a tx id from (a) the original challenge response,
        // (b) the sdk.execute callback, or (c) listing the user's most
        // recent transactions for this wallet.
        let txId: string | null = transactionId ?? executeTxId ?? null
        if (!txId) {
          const latest = await fetch(
            `/api/circle/latest-tx?userId=${encodeURIComponent(userId)}&walletId=${encodeURIComponent(walletId)}`,
          )
          const latestJson = await latest.json()
          if (latest.ok && latestJson?.id) {
            txId = latestJson.id
          }
        }
        if (!txId) {
          throw new Error("Circle did not return a transactionId")
        }
        const chains = await import("@/lib/chains")
        const { arcExplorerTx } = chains
        const deadline = Date.now() + 90_000
        let txHash: string | null = null
        while (Date.now() < deadline) {
          const tr = await fetch(
            `/api/circle/tx?userId=${encodeURIComponent(userId)}&id=${encodeURIComponent(txId)}`,
          )
          const trJson = await tr.json()
          const state = String(trJson?.state ?? "").toUpperCase()
          if (trJson?.txHash) {
            txHash = trJson.txHash
            if (state === "CONFIRMED" || state === "COMPLETE") break
            // SENT — txHash is set, on-chain receipt may not be final yet.
            // /api/round/bet's verifyUSDCTransfer will waitForTransactionReceipt.
            break
          }
          if (state === "FAILED" || state === "DENIED" || state === "CANCELLED") {
            throw new Error(`Circle tx ${state.toLowerCase()}`)
          }
          await new Promise((r) => setTimeout(r, 1500))
        }
        if (!txHash) throw new Error("Circle tx timed out without a txHash")

        setBet({
          pick,
          amount,
          pending: true,
          txHash,
          explorerUrl: arcExplorerTx(txHash),
        })

        const res = await fetch("/api/round/bet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roundId,
            roundToken: roundTokenRef.current,
            walletAddress,
            pick,
            amount: amountStr,
            txHash,
            explorerUrl: arcExplorerTx(txHash),
          }),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json?.error ?? "bet rejected")
        setBet({
          pick,
          amount,
          txHash: json.bet?.txHash ?? txHash,
          explorerUrl: json.bet?.explorerUrl ?? arcExplorerTx(txHash),
        })
      } catch (err: any) {
        const msg = err?.shortMessage ?? err?.message ?? "bet failed"
        setBet({ pick, amount, error: msg })
      }
      return
    }

    // ── Browser-EOA path (MetaMask et al.) ────────────────────────────
    if (!(window as any).ethereum) {
      setBet({ pick, amount, error: "no wallet provider — install MetaMask" })
      return
    }

    setBet({ pick, amount, pending: true })
    try {
      const [{ createWalletClient, custom, erc20Abi, parseUnits, createPublicClient, http }, chains] =
        await Promise.all([import("viem"), import("@/lib/chains")])
      const { arcTestnet, USDC_ADDRESS, USDC_DECIMALS, arcExplorerTx } = chains

      // Ensure the wallet is on Arc Testnet before signing.
      try {
        await (window as any).ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: chains.ARC_CHAIN_ID_HEX }],
        })
      } catch (e: any) {
        if (e?.code === 4902) {
          await (window as any).ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: chains.ARC_CHAIN_ID_HEX,
                chainName: "Arc Testnet",
                nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
                rpcUrls: ["https://rpc.testnet.arc.network"],
                blockExplorerUrls: ["https://testnet.arcscan.app"],
              },
            ],
          })
        } else {
          throw e
        }
      }

      const walletClient = createWalletClient({
        chain: arcTestnet,
        transport: custom((window as any).ethereum),
      })
      const publicClient = createPublicClient({
        chain: arcTestnet,
        transport: http(),
      })

      const amountStr = amount.toFixed(2)
      const hash = await walletClient.writeContract({
        account: walletAddress as `0x${string}`,
        address: USDC_ADDRESS,
        abi: erc20Abi,
        functionName: "transfer",
        args: [escrow as `0x${string}`, parseUnits(amountStr, USDC_DECIMALS)],
      })

      // Wait for on-chain confirmation before telling the server.
      setBet({ pick, amount, pending: true, txHash: hash, explorerUrl: arcExplorerTx(hash) })
      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
        timeout: 60_000,
        pollingInterval: 1500,
      })
      if (receipt.status !== "success") {
        throw new Error(`transfer reverted (status=${receipt.status})`)
      }

      const res = await fetch("/api/round/bet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roundId,
          roundToken: roundTokenRef.current,
          walletAddress,
          pick,
          amount: amountStr,
          txHash: hash,
          explorerUrl: arcExplorerTx(hash),
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error ?? "bet rejected")
      setBet({
        pick,
        amount,
        txHash: json.bet?.txHash ?? hash,
        explorerUrl: json.bet?.explorerUrl ?? arcExplorerTx(hash),
      })
    } catch (err: any) {
      const msg = err?.shortMessage ?? err?.message ?? "bet failed"
      const rejected =
        err?.code === 4001 || /user (rejected|denied)/i.test(msg)
      setBet({
        pick,
        amount,
        error: rejected ? "Bet cancelled in wallet." : msg,
      })
    }
  }

  const playAgainNow = () => {
    startRound()
  }

  const secondsLeft = Math.max(0, Math.ceil((deadline - now) / 1000))

  return (
    <main className="relative flex min-h-screen flex-col gap-6 pb-24 pt-0">
      <div className="rays-bg" />
      <div className="forest-ridge" />
      <FullscreenFlash
        show={flash != null}
        tone={flash?.tone ?? "win"}
        title={flash?.title ?? ""}
        subtitle={flash?.subtitle}
        onDone={() => setFlash(null)}
      />
      <Confetti show={confetti} />

      <TopNav compact />

      <div className="relative z-10 flex items-center justify-end gap-3 px-4 pb-2 sm:px-6">
        <StreakBadge streak={streak} />
        {(phase === "streaming" || (phase === "betting" && !bet)) && (
          <span className="rounded-full border border-[color:var(--gold-2)]/50 bg-[color:var(--gold-2)]/10 px-3 py-1 font-display text-lg text-[color:var(--gold-1)]">
            {secondsLeft}s
          </span>
        )}
        {phase === "betting" && bet && !bet.pending && !bet.error && (
          <span className="rounded-full border border-[color:var(--lime)]/50 bg-[color:var(--lime)]/10 px-3 py-1 font-ui-label text-[10px] tracking-widest text-[color:var(--lime)]">
            REVEALING…
          </span>
        )}
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col gap-5 px-4 sm:gap-6 sm:px-6">

      {phase === "idle" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <p className="max-w-md text-center font-ui-label text-xs tracking-widest text-[color:var(--text-mute)]">
            Two agents make a claim. One is lying. Spot the bluff.
          </p>
          {!walletAddress && (
            <p className="text-center font-ui-label text-[10px] text-[color:var(--amber)]/80">
              No wallet connected — bets run in mock mode.{" "}
              <a href="/" className="underline">
                sign in
              </a>
            </p>
          )}
          <button onClick={startRound} className="lime-cta rounded-2xl px-14 py-6 font-display text-4xl tracking-tight">
            DEAL ME IN
          </button>
        </div>
      )}

      {phase === "loading" && (
        <div className="flex flex-1 items-center justify-center font-ui-label text-xs tracking-widest text-[color:var(--gold-1)]">
          ◆ SHUFFLING THE DECK…
        </div>
      )}

      {phase !== "idle" && phase !== "loading" && (
        <>
          <section className="relative z-10 rounded-2xl border-2 border-[color:var(--border-soft)] bg-[color:var(--surface)]/85 p-3 backdrop-blur sm:p-4">
            <p className="font-ui-label text-[10px] uppercase tracking-widest text-[color:var(--lime)]">
              ◆ CLAIM UNDER DEBATE
            </p>
            <p className="mt-1 font-display text-lg leading-snug sm:text-2xl">{topic}</p>
          </section>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <AgentCard
              agent="A"
              isSpeaking={speaking === "A"}
              flipped={phase === "revealed" && reveal?.liar === "A"}
              selectable={phase === "betting" && !bet}
              selected={bet?.pick === "A"}
              onSelect={(p) => placeBet(p, amount)}
              hint={phase === "betting" && !bet ? `BET $${amount.toFixed(2)} → A` : undefined}
              highlight={
                phase === "revealed" && reveal
                  ? reveal.liar === "A"
                    ? "loser"
                    : "winner"
                  : null
              }
            >
              <ClaimDisplay text={claimA} active={speaking === "A"} agent="A" />
            </AgentCard>
            <AgentCard
              agent="B"
              isSpeaking={speaking === "B"}
              flipped={phase === "revealed" && reveal?.liar === "B"}
              selectable={phase === "betting" && !bet}
              selected={bet?.pick === "B"}
              onSelect={(p) => placeBet(p, amount)}
              hint={phase === "betting" && !bet ? `BET $${amount.toFixed(2)} → B` : undefined}
              highlight={
                phase === "revealed" && reveal
                  ? reveal.liar === "B"
                    ? "loser"
                    : "winner"
                  : null
              }
            >
              <ClaimDisplay text={claimB} active={speaking === "B"} agent="B" />
            </AgentCard>
          </section>

          {phase !== "revealed" && (
            <div className="space-y-2">
              <BetButtons
                enabled={phase === "betting" && !bet}
                amount={amount}
                onAmountChange={setAmount}
                placed={
                  bet && !bet.error
                    ? { pick: bet.pick, amount: bet.amount }
                    : null
                }
              />
              {bet?.pending && (
                <p className="text-center font-ui-label text-[10px] text-[color:var(--text-mute)]">
                  Escrowing your USDC on Arc…
                </p>
              )}
              {bet?.error && (
                <p className="text-center font-ui-label text-[10px] text-rose-300">
                  {bet.error}
                </p>
              )}
              {bet && !bet.pending && !bet.error && (
                <p className="text-center font-ui-label text-[10px] text-[color:var(--green)]">
                  Bet locked ✓{" "}
                  {bet.explorerUrl && (
                    <a
                      href={bet.explorerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="underline"
                    >
                      view on Arc explorer
                    </a>
                  )}
                </p>
              )}
            </div>
          )}

          {phase === "revealed" && reveal && (
            <>
              <Reveal
                liar={reveal.liar}
                truth={reveal.truth}
                source={reveal.source}
                topicUrl={topicUrl}
                userPick={bet?.pick ?? null}
                userAmount={bet?.amount ?? 0}
                tell={tell}
                onNext={playAgainNow}
                onLeave={() => {
                  esRef.current?.close()
                  esRef.current = null
                  window.location.href = "/lobby"
                }}
              />
              {settleReceipt?.won && settleReceipt.explorerUrl && (
                <p className="text-center font-ui-label text-[10px] text-[color:var(--green)]">
                  Payout sent ·{" "}
                  <a
                    href={settleReceipt.explorerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    view on Arc explorer
                  </a>
                </p>
              )}
            </>
          )}
        </>
      )}

      </div>

      <ChestMascot />
      <OracleMascot />
    </main>
  )
}
