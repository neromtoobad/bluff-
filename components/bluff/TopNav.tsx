"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import ConnectButton from "./ConnectButton"

type NavItem = { href: string; label: string; primary?: boolean }

const NAV: NavItem[] = [
  { href: "/play?auto=1", label: "Play", primary: true },
  { href: "/leaders", label: "Leaders" },
  { href: "/rules", label: "Rules" },
  { href: "/faq", label: "FAQ" },
]

function isActive(pathname: string, href: string) {
  const path = href.split("?")[0]
  if (path === "/") return pathname === "/"
  return pathname === path || pathname.startsWith(path + "/")
}

export default function TopNav({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname() || "/"

  return (
    <nav className="relative z-30 flex items-center justify-between gap-4 px-6 py-4">
      <Link
        href="/"
        className="group flex items-center gap-3"
        aria-label="BLUFF home"
      >
        <span
          className={`jackpot-title font-display tracking-wide leading-none ${
            compact ? "text-3xl md:text-4xl" : "text-4xl md:text-6xl"
          }`}
        >
          BL<span className="text-[color:var(--lime)]" style={{ WebkitTextStroke: "0", textShadow: "0 0 20px rgba(124,214,36,0.7)" }}>◯</span>FF
        </span>
        <span className="arc-live-pill hidden items-center gap-2 rounded-full border border-[color:var(--lime)]/50 bg-[color:var(--lime)]/10 px-3 py-1 font-ui-label text-[10px] tracking-widest text-[color:var(--lime)] md:inline-flex">
          <span className="arc-live-dot" /> LIVE ON ARC TESTNET
        </span>
      </Link>

      <div className="hidden items-center gap-2 md:flex">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href)
          if (item.primary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="lime-cta rounded-xl px-5 py-2 font-display text-base tracking-wide"
              >
                {item.label.toUpperCase()}
              </Link>
            )
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-3 py-1.5 font-ui-label text-[11px] tracking-widest transition ${
                active
                  ? "bg-[color:var(--gold-2)]/20 text-[color:var(--gold-1)]"
                  : "text-[color:var(--text-mute)] hover:text-[color:var(--text)]"
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </div>

      <div className="flex items-center gap-2">
        <ConnectButton />
      </div>
    </nav>
  )
}
