// Per-wallet win streak. Increments on a correct bet; resets on a wrong bet.

const g = globalThis as unknown as { __bluffStreaks?: Map<string, number> }
const streaks: Map<string, number> = g.__bluffStreaks ?? new Map<string, number>()
if (!g.__bluffStreaks) g.__bluffStreaks = streaks

function key(addr: string): string {
  return addr.toLowerCase()
}

export function getStreak(addr: string): number {
  return streaks.get(key(addr)) ?? 0
}

export function applyResult(addr: string, won: boolean): number {
  const k = key(addr)
  const next = won ? (streaks.get(k) ?? 0) + 1 : 0
  streaks.set(k, next)
  return next
}

// Multiplier applied to the bet at payout time, indexed by the streak the
// user is *about to* win at (i.e. streakAfter when they win this round).
export function multiplierFor(streakAfter: number): number {
  if (streakAfter >= 10) return 5
  if (streakAfter >= 5) return 3
  if (streakAfter >= 3) return 2.5
  return 1.9
}
