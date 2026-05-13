// Circle Wallets SDK init (client-side).
// Server-side wallet creation + OTP is handled in /api/auth/* routes.
import { W3SSdk } from "@circle-fin/w3s-pw-web-sdk"

let _sdk: W3SSdk | null = null

export function getCircleSdk(): W3SSdk {
  if (typeof window === "undefined") {
    throw new Error("Circle Wallets SDK is client-only")
  }
  if (!_sdk) {
    _sdk = new W3SSdk({
      appSettings: { appId: process.env.NEXT_PUBLIC_CIRCLE_APP_ID as string },
    })
  }
  return _sdk
}

export const CIRCLE_API_BASE = "https://api.circle.com/v1/w3s"
