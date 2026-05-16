import { recentFeed, subscribe } from "@/lib/feed"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
// SSE feed — heartbeat every 25s, no natural end. Cap at 5min so it
// reopens periodically instead of hitting Vercel's lambda timeout mid-event.
export const maxDuration = 300

export async function GET() {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    start(controller) {
      const send = (event: string, data: unknown) => {
        try {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
          )
        } catch {}
      }
      // Seed the marquee immediately.
      send("snapshot", recentFeed(20))

      const unsub = subscribe((e) => send("win", e))
      // Heartbeat keeps the connection warm through proxies.
      const hb = setInterval(() => send("ping", { t: Date.now() }), 25_000)

      const close = () => {
        clearInterval(hb)
        unsub()
        try { controller.close() } catch {}
      }
      ;(controller as any)._close = close
    },
    cancel() {
      const close = (this as any)?._close
      if (typeof close === "function") close()
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  })
}
