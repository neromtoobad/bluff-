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
      </header>
      <TopicPicker arenaId="1" />
    </main>
  )
}
