"use client"

import { useEffect, useState } from "react"

type Props = {
  show: boolean
  tone: "win" | "loss"
  title: string
  subtitle?: string
  onDone?: () => void
  durationMs?: number
}

export default function FullscreenFlash({
  show,
  tone,
  title,
  subtitle,
  onDone,
  durationMs = 1500,
}: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!show) {
      setVisible(false)
      return
    }
    setVisible(true)
    const t = setTimeout(() => {
      setVisible(false)
      onDone?.()
    }, durationMs)
    return () => clearTimeout(t)
  }, [show, durationMs, onDone])

  if (!visible) return null
  const bg =
    tone === "win"
      ? "bg-emerald-500/30"
      : "bg-rose-600/40"
  const ring =
    tone === "win" ? "text-emerald-200" : "text-rose-100"
  return (
    <div
      className={`pointer-events-none fixed inset-0 z-50 flex flex-col items-center justify-center ${bg} backdrop-blur-[2px] animate-[pulse_0.5s_ease-out]`}
    >
      <p className={`font-display text-7xl tracking-tight ${ring}`}>{title}</p>
      {subtitle && (
        <p className={`mt-2 font-ui-label text-base uppercase tracking-widest ${ring}`}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
