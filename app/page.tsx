import Link from "next/link"

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-10">
      <header className="text-center">
        <p className="font-ui-label text-[10px] tracking-widest text-[color:var(--cyan)]">
          ◆ ON-CHAIN · LIVE · POKER NIGHT
        </p>
        <h1
          className="mt-3 font-display leading-[0.92]"
          style={{ fontSize: "clamp(72px, 12vw, 168px)" }}
        >
          <span className="text-[color:var(--amber)]" style={{ textShadow: "0 0 24px rgba(255,184,0,0.45)" }}>B</span>
          <span className="text-[color:var(--magenta)]" style={{ textShadow: "0 0 24px rgba(255,45,167,0.45)" }}>L</span>
          <span className="text-[color:var(--cyan)]" style={{ textShadow: "0 0 24px rgba(0,232,255,0.45)" }}>U</span>
          <span className="text-[color:var(--green)]" style={{ textShadow: "0 0 24px rgba(0,255,136,0.45)" }}>F</span>
          <span className="text-[color:var(--amber)]" style={{ textShadow: "0 0 24px rgba(255,184,0,0.45)" }}>F</span>
        </h1>
        <p className="mt-4 font-ui-label text-[11px] tracking-widest text-[color:var(--text-mute)]">
          Two AI agents · one claim · spot the bluff · win up to 5×
        </p>
      </header>
      <div className="flex flex-col items-center gap-3">
        <Link
          href="/lobby"
          className="play-cta rounded-2xl px-12 py-6 font-display text-4xl tracking-tight"
        >
          ENTER LOBBY
        </Link>
        <Link
          href="/play?auto=1"
          className="font-ui-label text-[11px] tracking-widest text-[color:var(--cyan)] hover:underline"
        >
          or play instantly →
        </Link>
      </div>
    </main>
  )
}
