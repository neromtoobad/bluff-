import { NextResponse } from "next/server"
import { CIRCLE_API_BASE } from "@/lib/circle-wallets"
import { circleSessions } from "../../auth/init/route"

// Poll a Circle user-controlled transaction by id. The client calls this
// every ~1.5s after sdk.execute(challengeId) resolves, until state is
// terminal (COMPLETE / FAILED / CANCELLED / DENIED) and txHash is set.
//
// Query: ?userId=...&id=...
// Returns: { state, txHash?, transaction }

export const runtime = "nodejs"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")
  const id = searchParams.get("id")
  if (!userId || !id) {
    return NextResponse.json({ error: "userId + id required" }, { status: 400 })
  }

  const apiKey = process.env.CIRCLE_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "CIRCLE_API_KEY not set" }, { status: 500 })
  }

  const session = circleSessions.get(userId)
  if (!session) {
    return NextResponse.json({ error: "no Circle session for user" }, { status: 400 })
  }

  const res = await fetch(`${CIRCLE_API_BASE}/transactions/${encodeURIComponent(id)}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "X-User-Token": session.userToken,
    },
  })
  if (!res.ok) {
    const detail = await res.text()
    console.error(`[circle/tx] GET /transactions/${id} failed status=${res.status} body=${detail}`)
    return NextResponse.json(
      { error: "Circle getTransaction failed", detail },
      { status: 502 },
    )
  }
  const json = (await res.json()) as {
    data?: { transaction?: { state?: string; txHash?: string; [k: string]: any } }
  }
  const tx = json?.data?.transaction
  return NextResponse.json({
    state: tx?.state ?? "UNKNOWN",
    txHash: tx?.txHash ?? null,
    transaction: tx,
  })
}
