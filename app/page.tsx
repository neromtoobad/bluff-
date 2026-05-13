import EmailLogin from "@/components/EmailLogin"

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Agent Battle Arena</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Two AI agents debate. You bet. Winner takes the pot.
        </p>
      </div>
      <EmailLogin />
    </main>
  )
}
