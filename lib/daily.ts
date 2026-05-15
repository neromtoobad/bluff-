// Per-wallet daily bonus claim ledger. Resets at UTC midnight.

const g = globalThis as unknown as { __bluffDaily?: Map<string, string> }
const claims: Map<string, string> = g.__bluffDaily ?? new Map<string, string>()
if (!g.__bluffDaily) g.__bluffDaily = claims

function key(addr: string): string {
  return addr.toLowerCase()
}

export function todayUTC(): string {
  return new Date().toISOString().slice(0, 10) // YYYY-MM-DD
}

export function hasClaimedToday(addr: string): boolean {
  return claims.get(key(addr)) === todayUTC()
}

export function markClaimed(addr: string) {
  claims.set(key(addr), todayUTC())
}

export const DAILY_AMOUNT = "0.10"
