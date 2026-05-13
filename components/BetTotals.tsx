"use client"

import { useEffect, useRef, useState } from "react"

type Totals = {
  A: { amount: string; bettors: number }
  B: { amount: string; bettors: number }
  pot: string
}

const POLL_MS = 3000

function useTweenedNumber(target: number, durationMs = 700): number {
  const [value, setValue] = useState(target)
  const fromRef = useRef(target)
  const startRef = useRef<number>(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    fromRef.current = value
    startRef.current = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - startRef.current) / durationMs)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(fromRef.current + (target - fromRef.current) * eased)
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
    }
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, durationMs])

  return value
}

export default function BetTotals({ variant = "panel" }: { variant?: "panel" | "compact" } = {}) {
  const [totals, setTotals] = useState<Totals | null>(null)

  useEffect(() => {
    let cancelled = false
    async function tick() {
      try {
        const res = await fetch("/api/bet/totals", { cache: "no-store" })
        if (!res.ok) return
        const json = (await res.json()) as Totals
        if (!cancelled) setTotals(json)
      } catch {}
    }
    tick()
    const id = setInterval(tick, POLL_MS)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  const potTarget = Number(totals?.pot ?? 0)
  const potTween = useTweenedNumber(potTarget)
  const aAmount = Number(totals?.A.amount ?? 0)
  const bAmount = Number(totals?.B.amount ?? 0)
  const aBettors = totals?.A.bettors ?? 0
  const bBettors = totals?.B.bettors ?? 0

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-3 rounded-md border border-[color:var(--border-soft)] bg-[color:var(--bg-card)] px-3 py-1.5 text-[11px]">
        <span className="text-zinc-500 uppercase tracking-widest">Pot</span>
        <span className="font-mono text-base font-bold text-[color:var(--accent)] tabular-nums">
          ${potTween.toFixed(2)}
        </span>
        <span className="hidden sm:inline text-zinc-700">|</span>
        <span className="hidden sm:inline text-zinc-400">
          <span className="text-[color:var(--bull)] font-mono">{aBettors}</span>·
          <span className="text-[color:var(--bear)] font-mono">{bBettors}</span>
        </span>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--bg-card)] p-3">
      <div className="flex items-baseline justify-between">
        <span className="text-[10px] uppercase tracking-widest text-zinc-500">
          Total pot
        </span>
        <span className="font-mono text-xl font-bold text-[color:var(--accent)] tabular-nums">
          ${potTween.toFixed(2)}
        </span>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
        <div className="rounded border border-[color:var(--border-soft)] bg-black/40 px-2 py-1.5">
          <div className="text-[color:var(--bull)] font-bold">BULL</div>
          <div className="font-mono text-zinc-200">${aAmount.toFixed(2)}</div>
          <div className="text-zinc-500">{aBettors} {aBettors === 1 ? "bettor" : "bettors"}</div>
        </div>
        <div className="rounded border border-[color:var(--border-soft)] bg-black/40 px-2 py-1.5">
          <div className="text-[color:var(--bear)] font-bold">BEAR</div>
          <div className="font-mono text-zinc-200">${bAmount.toFixed(2)}</div>
          <div className="text-zinc-500">{bBettors} {bBettors === 1 ? "bettor" : "bettors"}</div>
        </div>
      </div>
    </div>
  )
}

export function usePotTotals() {
  const [totals, setTotals] = useState<Totals | null>(null)
  useEffect(() => {
    let cancelled = false
    async function tick() {
      try {
        const res = await fetch("/api/bet/totals", { cache: "no-store" })
        if (!res.ok) return
        const json = (await res.json()) as Totals
        if (!cancelled) setTotals(json)
      } catch {}
    }
    tick()
    const id = setInterval(tick, POLL_MS)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])
  return totals
}
