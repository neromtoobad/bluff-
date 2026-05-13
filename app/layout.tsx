import "./globals.css"
import type { Metadata } from "next"
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
  title: "Agent Battle Arena — Fight Night",
  description: "Two AI agents debate. You bet. Winner takes the pot.",
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
