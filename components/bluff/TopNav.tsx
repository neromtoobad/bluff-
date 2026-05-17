"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
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
  const [open, setOpen] = useState(false)

  // Close the drawer on route change.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  return (
    <nav className="relative z-30 flex items-center justify-between gap-2 px-4 py-3 sm:px-6 sm:py-4">
      <Link
        href="/"
        className="group flex min-w-0 items-center gap-2 sm:gap-3"
        aria-label="BLUFF home"
      >
        <span
          className={`jackpot-title font-display tracking-wide leading-none ${
            compact
              ? "text-[26px] sm:text-3xl md:text-4xl"
              : "text-[30px] sm:text-4xl md:text-6xl"
          }`}
        >
          BL<span
            className="text-[color:var(--arc-blue)]"
            style={{ WebkitTextStroke: "0", textShadow: "0 0 22px rgba(78,161,255,0.85)" }}
          >◯</span>FF
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
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[color:var(--border-soft)] bg-[color:var(--surface)]/85 text-[color:var(--text)] md:hidden"
        >
          <svg
            width="18"
            height="14"
            viewBox="0 0 18 14"
            fill="none"
            aria-hidden
          >
            {open ? (
              <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="3" x2="15" y2="11" />
                <line x1="15" y1="3" x2="3" y2="11" />
              </g>
            ) : (
              <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="2" y1="3" x2="16" y2="3" />
                <line x1="2" y1="7" x2="16" y2="7" />
                <line x1="2" y1="11" x2="16" y2="11" />
              </g>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            aria-hidden
          />
          <div className="fixed inset-x-3 top-20 z-50 rounded-2xl border-2 border-[color:var(--border-soft)] bg-[color:var(--surface-2)]/95 p-3 shadow-[0_24px_70px_-20px_rgba(0,0,0,0.8)] backdrop-blur md:hidden">
            <ul className="space-y-2">
              <li>
                <a
                  href="https://faucet.circle.com/"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setOpen(false)}
                  className="block w-full rounded-xl border border-[color:var(--gold-2)]/50 bg-[color:var(--gold-2)]/10 px-4 py-3 text-center font-display text-lg tracking-tight text-[color:var(--gold-1)]"
                >
                  💧 GET TEST USDC
                </a>
              </li>
              {NAV.map((item) => {
                const active = isActive(pathname, item.href)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={
                        item.primary
                          ? "lime-cta block w-full rounded-xl px-4 py-3 text-center font-display text-xl tracking-wide"
                          : `block w-full rounded-xl border border-[color:var(--border)] bg-black/30 px-4 py-3 text-center font-display text-lg tracking-tight transition ${
                              active
                                ? "text-[color:var(--gold-1)]"
                                : "text-[color:var(--text)]"
                            }`
                      }
                    >
                      {item.label.toUpperCase()}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </>
      )}
      <div className="arc-ribbon absolute inset-x-0 bottom-0" aria-hidden />
    </nav>
  )
}
