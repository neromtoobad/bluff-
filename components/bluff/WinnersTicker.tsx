"use client"

import { useEffect, useState } from "react"

type Event = {
  id: string
  walletAddress: string
  amountUSDC: number
  streak: number
  multiplier: number
}

function shortAddr(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`
}

export default function WinnersTicker() {
  const [events, setEvents] = useState<Event[]>([])

  useEffect(() => {
    const es = new EventSource("/api/feed")
    es.addEventListener("snapshot", (e) => {
      try {
        const arr = JSON.parse((e as MessageEvent).data) as Event[]
        setEvents(arr.slice(-20))
      } catch {}
    })
    es.addEventListener("win", (e) => {
      try {
        const ev = JSON.parse((e as MessageEvent).data) as Event
        setEvents((cur) => {
          const next = [...cur, ev]
          return next.length > 30 ? next.slice(-30) : next
        })
      } catch {}
    })
    es.onerror = () => {}
    return () => es.close()
  }, [])

  if (events.length === 0) return null
  const doubled = [...events, ...events]

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 border-t-2 border-[color:var(--border-soft)] bg-gradient-to-r from-[color:var(--bg-deep)] via-[color:var(--surface)] to-[color:var(--bg-deep)] backdrop-blur">
      <div className="overflow-hidden">
        <div className="bluff-marquee-track flex gap-10 py-2.5 font-mono text-[13px] text-[color:var(--text)]">
          {doubled.map((e, i) => (
            <span key={`${e.id}-${i}`} className="flex items-center gap-2 px-2">
              <span className="font-ui-label text-[10px] tracking-widest text-[color:var(--gold-1)]">
                ◆ WIN
              </span>
              <span className="text-[color:var(--text-mute)]">{shortAddr(e.walletAddress)}</span>
              <span>just won</span>
              <span className="font-semibold text-[color:var(--lime)]">
                ${e.amountUSDC.toFixed(2)}
              </span>
              {e.streak >= 3 && (
                <span className="text-[color:var(--gold-1)]">
                  on {e.streak}-streak ✨
                </span>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
