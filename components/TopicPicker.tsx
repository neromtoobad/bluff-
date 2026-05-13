"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

const PRESET_TOPICS = [
  "BTC hits $1M before 2027",
  "ETH will flip BTC",
  "Solana will kill Ethereum",
  "NFTs are permanently dead",
  "AI will replace crypto developers",
  "Stablecoins will kill Visa and Mastercard",
  "DeFi is just gambling with extra steps",
  "The next bull run already started",
]

type Props = {
  arenaId?: string
}

export default function TopicPicker({ arenaId = "1" }: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)
  const [custom, setCustom] = useState("")

  function pick(topic: string) {
    setSelected(topic)
    setCustom("")
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const topic = custom.trim() || selected
    if (!topic) return
    const qs = new URLSearchParams({ topic }).toString()
    router.push(`/arena/${arenaId}?${qs}`)
  }

  const canSubmit = Boolean(custom.trim() || selected)

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl space-y-6">
      <div className="text-center">
        <p className="font-ui-label text-[10px] text-[color:var(--text-mute)]">
          Step 1 of 2
        </p>
        <h2 className="mt-2 font-display text-5xl leading-none">
          PICK A TOPIC
        </h2>
        <p className="mt-2 text-sm text-zinc-400">
          The bull and the bear will fight over it. You bet on who wins.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {PRESET_TOPICS.map((topic) => {
          const isActive = selected === topic && !custom.trim()
          return (
            <button
              key={topic}
              type="button"
              onClick={() => pick(topic)}
              className={[
                "group flex h-28 items-center justify-center rounded-2xl border bg-[color:var(--bg-card)] px-4 text-center transition",
                "hover:border-[color:var(--accent)]/60 hover:bg-[color:var(--bg-card-2)] hover:-translate-y-0.5",
                isActive
                  ? "border-[color:var(--accent)] bg-[color:var(--accent-soft)] ring-2 ring-[color:var(--accent)]/40"
                  : "border-[color:var(--border)]",
              ].join(" ")}
            >
              <span
                className={[
                  "font-mono text-sm font-medium leading-snug",
                  isActive
                    ? "text-[color:var(--accent)]"
                    : "text-zinc-100 group-hover:text-white",
                ].join(" ")}
              >
                {topic}
              </span>
            </button>
          )
        })}
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
        <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-2">
          Or type your own
        </label>
        <input
          type="text"
          value={custom}
          onChange={(e) => {
            setCustom(e.target.value)
            if (e.target.value.trim()) setSelected(null)
          }}
          placeholder="or type your own topic..."
          className="w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--bg-deep)] px-3 py-2 text-sm font-mono outline-none focus:border-[color:var(--accent)]"
        />
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="cta-glow w-full rounded-xl bg-[color:var(--accent)] py-3.5 font-display text-2xl tracking-[0.1em] text-black hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        START THE FIGHT →
      </button>
    </form>
  )
}
