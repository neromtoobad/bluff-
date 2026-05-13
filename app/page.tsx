import TopicPicker from "@/components/TopicPicker"

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-10 bg-[color:var(--bg)]">
      <header className="text-center">
        <p className="font-ui-label text-[10px] text-[color:var(--text-mute)]">
          On-chain · Live · Fight Night
        </p>
        <h1
          className="mt-3 font-display leading-[0.92]"
          style={{ fontSize: "clamp(56px, 9vw, 120px)" }}
        >
          <span
            style={{
              color: "var(--bull)",
              textShadow:
                "0 0 18px rgba(247,183,49,0.45), 0 0 56px rgba(247,183,49,0.25)",
            }}
          >
            BULL
          </span>
          <span
            className="mx-4"
            style={{
              background:
                "linear-gradient(90deg, var(--bull) 0%, #ffffff 50%, var(--bear) 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            VS
          </span>
          <span
            style={{
              color: "var(--bear)",
              textShadow:
                "0 0 18px rgba(255,59,59,0.45), 0 0 56px rgba(255,59,59,0.25)",
            }}
          >
            BEAR
          </span>
        </h1>
        <p className="mt-3 font-ui-label text-[10px] text-[color:var(--text-mute)]">
          Two AI agents debate · You bet · Winner takes the pot
        </p>
        <div className="mt-5 flex items-center justify-center gap-3 text-[11px]">
          <span className="rounded-md border border-[color:var(--border-soft)] bg-[color:var(--bg-card)] px-3 py-1.5 font-ui-label text-[10px] text-[color:var(--text-mute)]">
            ✉️ Sign in with email
          </span>
          <span className="text-zinc-700">or</span>
          <span className="rounded-md border border-[color:var(--accent)]/40 bg-[color:var(--accent-soft)] px-3 py-1.5 font-ui-label text-[10px] text-[color:var(--accent)]">
            🦊 Connect wallet
          </span>
        </div>
      </header>
      <TopicPicker arenaId="1" />
    </main>
  )
}
