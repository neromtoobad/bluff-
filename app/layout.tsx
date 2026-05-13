import "./globals.css"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Agent Battle Arena",
  description: "On-chain AI debate arena",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-zinc-100 min-h-screen antialiased">{children}</body>
    </html>
  )
}
