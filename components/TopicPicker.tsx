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
        <p className="text-xs uppercase tracking-widest text-zinc-500">
          Step 1 of 2
        </p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight">
          Pick a topic
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
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
                "group flex h-28 items-center justify-center rounded-2xl border bg-zinc-900/70 px-4 text-center transition",
                "hover:border-emerald-500/60 hover:bg-zinc-900 hover:-translate-y-0.5",
                isActive
                  ? "border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/40"
                  : "border-zinc-800",
              ].join(" ")}
            >
              <span
                className={[
                  "text-sm font-bold leading-snug",
                  isActive
                    ? "text-emerald-100"
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
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-emerald-500"
        />
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-base font-bold text-zinc-950 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Start the Fight →
      </button>
    </form>
  )
}
