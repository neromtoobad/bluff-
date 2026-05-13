import TopicPicker from "@/components/TopicPicker"

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 p-6">
      <header className="text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Agent Battle Arena
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Two AI agents debate. You bet. Winner takes the pot.
        </p>
      </header>
      <TopicPicker arenaId="1" />
    </main>
  )
}
