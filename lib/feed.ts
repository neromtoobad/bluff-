// In-memory winners feed. Settle writes here; SSE in /api/feed reads from
// here AND seeds fake events so the marquee always feels alive.

export type FeedEvent = {
  id: string
  ts: number
  walletAddress: string
  amountUSDC: number
  streak: number
  multiplier: number
}

const g = globalThis as unknown as {
  __bluffFeed?: FeedEvent[]
  __bluffFeedSubs?: Set<(e: FeedEvent) => void>
}
const feed: FeedEvent[] = g.__bluffFeed ?? []
const subs: Set<(e: FeedEvent) => void> = g.__bluffFeedSubs ?? new Set()
if (!g.__bluffFeed) g.__bluffFeed = feed
if (!g.__bluffFeedSubs) g.__bluffFeedSubs = subs

const MAX = 200

export function pushEvent(e: Omit<FeedEvent, "id" | "ts">) {
  const full: FeedEvent = {
    ...e,
    id: Math.random().toString(36).slice(2, 10),
    ts: Date.now(),
  }
  feed.push(full)
  if (feed.length > MAX) feed.shift()
  for (const fn of subs) {
    try { fn(full) } catch {}
  }
  return full
}

export function recentFeed(limit = 50): FeedEvent[] {
  return feed.slice(-limit)
}

export function subscribe(fn: (e: FeedEvent) => void): () => void {
  subs.add(fn)
  return () => { subs.delete(fn) }
}

// --- fake events generator ---
// Runs once per process. Emits ~3 events/minute so the marquee never empties.

const SAMPLE_WALLETS = [
  "0x9a17b2e0bee4f5e3f0d4a5d0b3aef21d1f9d2a44",
  "0x4f2c8d1e9a07c4b3e1d5f6a8b2c9e0d7f1a3b4c5",
  "0xbeefcafebabe1234567890deadbeef1234567890",
  "0x1234567890abcdef1234567890abcdef12345678",
  "0xa1b2c3d4e5f60718293a4b5c6d7e8f9012345678",
  "0xfeedfacefeedfacefeedfacefeedfacefeedface",
]

function pickWallet() {
  return SAMPLE_WALLETS[Math.floor(Math.random() * SAMPLE_WALLETS.length)]
}

function fakeEvent() {
  const streak = Math.floor(Math.random() * 12)
  const multiplier =
    streak >= 10 ? 5 : streak >= 5 ? 3 : streak >= 3 ? 2.5 : 1.9
  const bet = [0.1, 0.5, 1, 2, 5][Math.floor(Math.random() * 5)]
  const amountUSDC = Number((bet * multiplier).toFixed(2))
  pushEvent({
    walletAddress: pickWallet(),
    amountUSDC,
    streak,
    multiplier,
  })
}

if (!(globalThis as any).__bluffFakeFeedStarted) {
  ;(globalThis as any).__bluffFakeFeedStarted = true
  // First few right away so the ticker has something to show immediately.
  for (let i = 0; i < 5; i++) fakeEvent()
  setInterval(() => {
    // ~3 events per minute = one every 20s, with jitter
    if (Math.random() < 0.5) fakeEvent()
  }, 10_000)
}
