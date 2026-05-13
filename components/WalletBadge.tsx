"use client"

type Props = {
  address: string
  usdcBalance?: string
}

function truncate(addr: string) {
  if (addr.length <= 12) return addr
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

export default function WalletBadge({ address, usdcBalance = "0.00" }: Props) {
  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm">
      <span className="h-2 w-2 rounded-full bg-emerald-400" />
      <span className="font-mono text-zinc-200">{truncate(address)}</span>
      <span className="h-4 w-px bg-zinc-700" />
      <span className="text-zinc-400">
        <span className="text-zinc-100 font-semibold">{usdcBalance}</span> USDC
      </span>
    </div>
  )
}
