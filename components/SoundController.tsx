"use client"

import { useEffect, useRef, useState } from "react"
import * as audio from "@/lib/audio"

type DebateState = {
  status: "idle" | "running" | "judging" | "done" | "error"
  round: number
  verdict: unknown | null
}

type Totals = {
  A?: { bettors?: number }
  B?: { bettors?: number }
}

type LastSnapshot = {
  round: number
  status: string
  verdict: boolean
  bettorTotal: number
}

const POLL_MS = 1200

const CROWD_BASE = 0.06
const CROWD_HEATED = 0.13

export default function SoundController() {
  const [enabled, setEnabled] = useState(false)
  const [showPrompt, setShowPrompt] = useState(true)
  const lastRef = useRef<LastSnapshot | null>(null)

  // Poll for state changes and fire sounds. Skips all sound calls when
  // audio is disabled, but keeps the snapshot ref up to date so the
  // first enabled tick doesn't re-fire stale events.
  useEffect(() => {
    let cancelled = false

    async function tick() {
      try {
        const [stateRes, totalsRes] = await Promise.all([
          fetch("/api/debate/state", { cache: "no-store" }),
          fetch("/api/bet/totals", { cache: "no-store" }),
        ])
        if (!stateRes.ok || !totalsRes.ok) return
        const state = (await stateRes.json()) as DebateState
        const totals = (await totalsRes.json()) as Totals
        const bettorTotal =
          (totals.A?.bettors ?? 0) + (totals.B?.bettors ?? 0)

        if (cancelled) return

        const prev = lastRef.current
        const next: LastSnapshot = {
          round: state.round,
          status: state.status,
          verdict: !!state.verdict,
          bettorTotal,
        }

        if (prev && audio.isAudioEnabled()) {
          // Status transitions
          if (
            state.status === "running" &&
            prev.status !== "running" &&
            prev.status !== "judging"
          ) {
            audio.startCrowdAmbience(CROWD_BASE)
          }

          // Round changed
          if (next.round !== prev.round) {
            if (prev.round > 0) audio.roundEnd()
            if (next.round > 0) audio.roundBell()
            audio.setCrowdLevel(next.round >= 3 ? CROWD_HEATED : CROWD_BASE)
          }

          // Verdict landed
          if (!prev.verdict && next.verdict) {
            audio.winnerReveal()
            audio.stopCrowdAmbience()
          }

          // New bet (anywhere)
          if (next.bettorTotal > prev.bettorTotal) {
            audio.betConfirm()
          }
        }

        lastRef.current = next
      } catch {
        // swallow — keep polling
      }
    }

    tick()
    const id = setInterval(tick, POLL_MS)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  async function toggle() {
    if (enabled) {
      audio.disableAudio()
      setEnabled(false)
      return
    }
    audio.enableAudio()
    setEnabled(true)
    setShowPrompt(false)
    // If a debate is mid-flight when the user opts in, start the
    // crowd ambience immediately so they're not greeted by silence.
    try {
      const res = await fetch("/api/debate/state", { cache: "no-store" })
      if (res.ok) {
        const s = (await res.json()) as DebateState
        if (s.status === "running") {
          audio.startCrowdAmbience(s.round >= 3 ? CROWD_HEATED : CROWD_BASE)
        }
      }
    } catch {}
  }

  return (
    <>
      {/* Mute toggle — fixed top right */}
      <button
        type="button"
        onClick={toggle}
        aria-label={enabled ? "Mute audio" : "Enable audio"}
        title={enabled ? "Mute audio" : "Enable audio"}
        className="fixed top-3 right-3 z-[60] flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900/85 text-base backdrop-blur transition hover:border-[color:var(--accent)]"
      >
        <span aria-hidden="true">{enabled ? "🔊" : "🔇"}</span>
      </button>

      {/* First-load prompt — dismissable */}
      {!enabled && showPrompt && (
        <div
          role="dialog"
          aria-label="Enable sound"
          className="fixed top-16 right-3 z-[60] max-w-[260px] rounded-lg border border-[color:var(--accent)]/40 bg-[color:var(--bg-card)] p-3 shadow-xl"
        >
          <p className="text-xs font-black uppercase tracking-widest text-[color:var(--accent)]">
            🔊 Enable sound
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-zinc-300">
            Round bells, crowd ambience, fanfare on the verdict.
            Off by default.
          </p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={toggle}
              className="rounded bg-[color:var(--accent)] px-2.5 py-1 text-[10px] font-black uppercase text-black hover:brightness-110"
            >
              Turn on
            </button>
            <button
              type="button"
              onClick={() => setShowPrompt(false)}
              className="rounded border border-zinc-700 px-2.5 py-1 text-[10px] uppercase tracking-wider text-zinc-400 hover:text-zinc-200"
            >
              Later
            </button>
          </div>
        </div>
      )}
    </>
  )
}
