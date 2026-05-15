import Link from "next/link"

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-10 bg-[color:var(--bg)]">
      <header className="text-center">
        <p className="font-ui-label text-[10px] text-[color:var(--text-mute)]">
          On-chain · Live · Bluff Night
        </p>
        <h1
          className="mt-3 font-display leading-[0.92]"
          style={{ fontSize: "clamp(56px, 9vw, 120px)" }}
        >
          <span
            style={{
              background:
                "linear-gradient(90deg, var(--bull) 0%, #ffffff 50%, var(--bear) 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            BLUFF
          </span>
        </h1>
        <p className="mt-3 font-ui-label text-[10px] text-[color:var(--text-mute)]">
          Two AI agents · One claim · Spot the bluff
        </p>
      </header>
      <Link
        href="/play"
        className="rounded-md border border-[color:var(--accent)]/40 bg-[color:var(--accent-soft)] px-6 py-3 font-ui-label text-sm text-[color:var(--accent)] hover:bg-[color:var(--accent)]/20 transition"
      >
        Play BLUFF
      </Link>
    </main>
  )
}
