import { NextResponse } from "next/server"
import { createPublicClient, http, erc20Abi, formatUnits, getAddress } from "viem"

export const runtime = "nodejs"

const USDC_ADDRESS = process.env.NEXT_PUBLIC_ARC_USDC_ADDRESS
const RPC_URL = process.env.NEXT_PUBLIC_ARC_RPC_URL

export async function GET(req: Request) {
  const url = new URL(req.url)
  const addr = url.searchParams.get("walletAddress")
  if (!addr || !/^0x[a-fA-F0-9]{40}$/.test(addr)) {
    return NextResponse.json({ balance: "0.00" })
  }
  if (!USDC_ADDRESS || !RPC_URL) {
    // Env not configured — return mocked zero so the UI doesn't break.
    return NextResponse.json({ balance: "0.00", mock: true })
  }
  try {
    const client = createPublicClient({ transport: http(RPC_URL) })
    const raw = (await client.readContract({
      address: getAddress(USDC_ADDRESS),
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [getAddress(addr)],
    })) as bigint
    return NextResponse.json({ balance: Number(formatUnits(raw, 6)).toFixed(2) })
  } catch (err: any) {
    return NextResponse.json({ balance: "0.00", error: String(err?.message ?? err) })
  }
}
