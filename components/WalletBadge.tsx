"use client"

type Props = {
  address: string
  usdcBalance?: string
}

function truncate(addr: string) {
  if (addr.length <= 12) return addr
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

export default function WalletBadge({ address, usdcBalance }: Props) {
  return (
    <div className="inline-flex items-center gap-2 rounded-md border border-[color:var(--border-soft)] bg-[color:var(--bg-card)] px-2.5 py-1.5 text-[11px]">
      <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent)] dot-pulse" />
      <span className="font-mono text-zinc-200">{truncate(address)}</span>
      {usdcBalance && (
        <>
          <span className="text-zinc-700">·</span>
          <span className="font-mono text-zinc-300">${usdcBalance}</span>
        </>
      )}
    </div>
  )
}
