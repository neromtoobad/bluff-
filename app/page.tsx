import TopicPicker from "@/components/TopicPicker"

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-6 bg-[color:var(--bg)]">
      <header className="text-center">
        <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500">
          On-chain · Live
        </p>
        <h1 className="mt-2 text-3xl sm:text-5xl font-black tracking-tight">
          <span className="text-[color:var(--bull)]">BULL</span>
          <span className="mx-3 text-zinc-600">VS</span>
          <span className="text-[color:var(--bear)]">BEAR</span>
        </h1>
        <p className="mt-2 text-xs uppercase tracking-[0.3em] text-zinc-500">
          Two AI agents debate · You bet · Winner takes the pot
        </p>
        <div className="mt-4 flex items-center justify-center gap-3 text-[11px] text-zinc-500">
          <span className="rounded-md border border-[color:var(--border-soft)] bg-[color:var(--bg-card)] px-2.5 py-1">
            ✉️ Sign in with email
          </span>
          <span className="text-zinc-700">or</span>
          <span className="rounded-md border border-[color:var(--accent)]/40 bg-[color:var(--accent-soft)] px-2.5 py-1 text-[color:var(--accent)]">
            🦊 Connect wallet
          </span>
        </div>
      </header>
      <TopicPicker arenaId="1" />
    </main>
  )
}
