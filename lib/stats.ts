// Per-wallet aggregate stats — games played, total won.
// Streak is owned by lib/streaks.ts.

export type WalletStats = {
  played: number
  wins: number
  totalWonUSDC: number // running sum of payouts
}

const g = globalThis as unknown as { __bluffStats?: Map<string, WalletStats> }
const stats: Map<string, WalletStats> =
  g.__bluffStats ?? new Map<string, WalletStats>()
if (!g.__bluffStats) g.__bluffStats = stats

const key = (addr: string) => addr.toLowerCase()

export function recordRound(addr: string, won: boolean, payoutUSDC: number) {
  const k = key(addr)
  const cur = stats.get(k) ?? { played: 0, wins: 0, totalWonUSDC: 0 }
  cur.played += 1
  if (won) {
    cur.wins += 1
    cur.totalWonUSDC += payoutUSDC
  }
  stats.set(k, cur)
}

export function getStats(addr: string): WalletStats {
  return stats.get(key(addr)) ?? { played: 0, wins: 0, totalWonUSDC: 0 }
}

export function allStats(): Map<string, WalletStats> {
  return stats
}
