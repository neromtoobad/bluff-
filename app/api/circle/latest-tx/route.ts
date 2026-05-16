import { NextResponse } from "next/server"
import { CIRCLE_API_BASE } from "@/lib/circle-wallets"
import { circleSessions } from "@/lib/auth-state"

// Fallback the play page uses when sdk.execute doesn't surface a
// transactionId: list the user's recent transactions and return the
// newest one. Useful right after PIN approval — the just-submitted
// contract execution will be at the top.
//
// Query: ?userId=…&walletId=…(optional, for filter)
// Returns: { id, state, txHash, transaction }

export const runtime = "nodejs"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")
  const walletId = searchParams.get("walletId")
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 })
  }

  const apiKey = process.env.CIRCLE_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "CIRCLE_API_KEY not set" }, { status: 500 })
  }

  const session = circleSessions.get(userId)
  if (!session) {
    return NextResponse.json({ error: "no Circle session for user" }, { status: 400 })
  }

  const qs = new URLSearchParams({ pageSize: "10" })
  if (walletId) qs.set("walletIds", walletId)

  const res = await fetch(`${CIRCLE_API_BASE}/transactions?${qs.toString()}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "X-User-Token": session.userToken,
    },
  })
  if (!res.ok) {
    const detail = await res.text()
    console.error(`[circle/latest-tx] list failed status=${res.status} body=${detail}`)
    return NextResponse.json(
      { error: "Circle listTransactions failed", detail },
      { status: 502 },
    )
  }
  const json = (await res.json()) as {
    data?: {
      transactions?: Array<{
        id?: string
        state?: string
        txHash?: string
        createDate?: string
        firstConfirmDate?: string
      }>
    }
  }
  // Already returned newest-first per Circle convention; defensively sort.
  const txs = [...(json?.data?.transactions ?? [])].sort((a, b) => {
    const ad = a.createDate ?? a.firstConfirmDate ?? ""
    const bd = b.createDate ?? b.firstConfirmDate ?? ""
    return bd.localeCompare(ad)
  })
  const tx = txs[0]
  if (!tx?.id) {
    return NextResponse.json({ error: "no recent transactions", txs: txs.length }, { status: 404 })
  }
  return NextResponse.json({
    id: tx.id,
    state: tx.state ?? "UNKNOWN",
    txHash: tx.txHash ?? null,
    transaction: tx,
  })
}
