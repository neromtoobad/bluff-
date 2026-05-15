import { NextResponse } from "next/server"
import { erc20Abi, formatUnits, getAddress, type Address } from "viem"
import { publicClient } from "@/lib/arc-viem"
import { USDC_ADDRESS, USDC_DECIMALS } from "@/lib/chains"

export const runtime = "nodejs"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const addr = url.searchParams.get("walletAddress")
  if (!addr || !/^0x[a-fA-F0-9]{40}$/.test(addr)) {
    return NextResponse.json({ balance: "0.00" })
  }
  try {
    const raw = (await publicClient.readContract({
      address: USDC_ADDRESS as Address,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [getAddress(addr) as Address],
    })) as bigint
    return NextResponse.json({
      balance: Number(formatUnits(raw, USDC_DECIMALS)).toFixed(2),
    })
  } catch (err: any) {
    return NextResponse.json({
      balance: "0.00",
      error: err?.shortMessage ?? err?.message ?? String(err),
    })
  }
}
