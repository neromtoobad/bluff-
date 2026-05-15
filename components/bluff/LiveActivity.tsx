"use client"

import { useEffect, useState } from "react"

type FeedEvent = {
  id: string
  walletAddress: string
  amountUSDC: number
  streak: number
  multiplier: number
  ts?: number
}

function shortAddr(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`
}

function relTime(ts: number) {
  const diff = Math.max(0, Date.now() - ts)
  const s = Math.floor(diff / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  return `${h}h ago`
}

function streakEmoji(streak: number) {
  if (streak >= 10) return "💀"
  if (streak >= 5) return "🔥"
  if (streak >= 3) return "⚡"
  return "🎯"
}

export default function LiveActivity({ className }: { className?: string }) {
  const [events, setEvents] = useState<FeedEvent[]>([])

  useEffect(() => {
    const es = new EventSource("/api/feed")
    es.addEventListener("snapshot", (e) => {
      try {
        const arr = JSON.parse((e as MessageEvent).data) as FeedEvent[]
        setEvents([...arr].reverse().slice(0, 40))
      } catch {}
    })
    es.addEventListener("win", (e) => {
      try {
        const ev = JSON.parse((e as MessageEvent).data) as FeedEvent
        setEvents((cur) => [ev, ...cur].slice(0, 40))
      } catch {}
    })
    es.onerror = () => {}
    return () => es.close()
  }, [])

  return (
    <aside
      className={`rounded-2xl border-2 border-[color:var(--border-soft)] bg-[color:var(--surface)]/85 p-4 backdrop-blur ${className ?? ""}`}
    >
      <div className="flex items-center justify-between">
        <p className="font-display text-lg tracking-widest text-[color:var(--lime)]">
          ◆ LIVE FEED
        </p>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--lime)]/40 bg-[color:var(--lime)]/10 px-2 py-0.5 font-ui-label text-[9px] tracking-widest text-[color:var(--lime)]">
          <span className="arc-live-dot" /> LIVE
        </span>
      </div>

      <ul className="mt-3 max-h-[420px] space-y-2 overflow-y-auto pr-1">
        {events.length === 0 ? (
          <li className="rounded-xl border border-[color:var(--border)] bg-black/30 p-3 text-center font-ui-label text-[10px] tracking-widest text-[color:var(--text-mute)]">
            waiting for the first winner of the night…
          </li>
        ) : (
          events.map((e, i) => (
            <li
              key={e.id ?? `${e.walletAddress}-${i}`}
              className="flex items-start gap-3 rounded-xl border border-[color:var(--border)] bg-black/30 p-3"
            >
              <span className="mt-0.5 text-2xl leading-none">{streakEmoji(e.streak)}</span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-base tracking-tight text-[color:var(--text)]">
                  <span className="text-[color:var(--gold-1)]">
                    {shortAddr(e.walletAddress)}
                  </span>{" "}
                  hit <span className="text-[color:var(--lime)]">${e.amountUSDC.toFixed(2)}</span>
                </p>
                <p className="font-ui-label text-[10px] tracking-widest text-[color:var(--text-mute)]">
                  {e.streak}-streak · {e.multiplier}× ·{" "}
                  {e.ts ? relTime(e.ts) : "now"}
                </p>
              </div>
            </li>
          ))
        )}
      </ul>
    </aside>
  )
}
