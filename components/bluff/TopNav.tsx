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
    <header className="relative flex items-center justify-between px-6 py-4">

      {/* LEFT GROUP — logo + status */}
      <div className="z-10 flex items-center gap-4">
        <Link
          href="/"
          className="group flex min-w-0 shrink-0 items-center gap-2 sm:gap-3"
          aria-label="BLUFF home"
        >
          <span
            className={`jackpot-title font-display tracking-wide leading-none ${
              compact
                ? "text-[24px] sm:text-2xl md:text-3xl"
                : "text-[26px] sm:text-3xl md:text-4xl"
            }`}
          >
            BL<span
              className="text-[color:var(--arc-blue)]"
              style={{ WebkitTextStroke: "0", textShadow: "0 0 10px rgba(78,161,255,0.7)" }}
            >◯</span>FF
          </span>
        </Link>

        <span className="arc-live-pill hidden items-center gap-2 whitespace-nowrap rounded-full border border-[color:var(--arc-blue)]/50 bg-[color:var(--arc-blue)]/10 px-3 py-1 font-ui-label text-[10px] tracking-widest text-[color:var(--arc-blue)] lg:inline-flex">
          <span className="arc-live-dot shrink-0" /> LIVE ON ARC TESTNET
        </span>
      </div>

      {/* CENTER — absolutely positioned, stays centered always */}
      <div className="absolute left-1/2 top-1/2 z-0 hidden -translate-x-1/2 -translate-y-1/2 lg:block">
        <a
          href="https://faucet.circle.com/"
          target="_blank"
          rel="noreferrer"
          title="Get free test USDC from Circle for Arc Testnet"
          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-[color:var(--gold-2)]/50 bg-[color:var(--gold-2)]/10 px-3 py-1 font-ui-label text-[10px] tracking-widest text-[color:var(--gold-1)] transition hover:bg-[color:var(--gold-2)]/20"
        >
          💧 GET TEST USDC
        </a>
      </div>

      {/* RIGHT GROUP — nav + wallet */}
      <div className="z-10 flex items-center gap-3">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href)
          if (item.primary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="lime-cta hidden rounded-xl px-5 py-2 font-display text-base tracking-wide md:inline-flex"
              >
                {item.label.toUpperCase()}
              </Link>
            )
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`hidden rounded-full px-3 py-1.5 font-ui-label text-[11px] tracking-widest transition md:inline-flex ${
                active
                  ? "bg-[color:var(--gold-2)]/20 text-[color:var(--gold-1)]"
                  : "text-[color:var(--text-mute)] hover:text-[color:var(--text)]"
              }`}
            >
              {item.label.toUpperCase()}
            </Link>
          )
        })}
        <div className="flex items-center gap-2 md:ml-6">
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
    </header>
  )
}
