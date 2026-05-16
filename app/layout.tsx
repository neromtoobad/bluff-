import "./globals.css"
import type { Metadata, Viewport } from "next"
import { Bebas_Neue, IBM_Plex_Mono, DM_Sans } from "next/font/google"
import SoundController from "@/components/SoundController"

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
})
const plex = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-plex",
  display: "swap",
})
const dm = DM_Sans({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-dm",
  display: "swap",
})

export const metadata: Metadata = {
  title: "BLUFF — Spot the AI lie",
  description: "Two AI agents make a claim. One is lying. Bet USDC, win up to 5×.",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#0e1a14",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${bebas.variable} ${plex.variable} ${dm.variable}`}
    >
      <body className="bg-[color:var(--bg)] text-zinc-100 min-h-screen antialiased font-[var(--font-ui)]">
        {children}
        <SoundController />
      </body>
    </html>
  )
}
