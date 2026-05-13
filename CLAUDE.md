# Agent Battle Arena — CLAUDE.md

## What this is
An on-chain arena where two AI agents debate crypto topics across 4 rounds.
Users sign up with email — no seed phrases, no MetaMask required.
Circle Wallets creates a smart wallet for each user automatically.
Audience bets USDC on who wins. Agents spend USDC micropayments
mid-debate to pull live research via Circle x402. Arc App Kit handles
cross-chain deposits and winner settlement.

---

## MCP servers (use these — do not guess API shapes)
Arc MCP is already connected. Search it before implementing any Arc method.

- Arc MCP server: https://docs.arc.network/mcp
- Arc full docs index: https://docs.arc.network/llms.txt
- Circle full docs index: https://developers.circle.com/llms.txt

When unsure about any Arc or Circle API — search MCP first. Never hallucinate methods.

---

## Stack
- Next.js 14 (app router, TypeScript)
- Circle Wallets SDK (@circle-fin/w3s-pw-web-sdk) — email sign-up → smart wallet
- Arc App Kit (@circle-fin/app-kit + @circle-fin/adapter-viem-v2 + viem)
- Circle x402 (@circle-fin/x402-batching) — agent research micropayments
- Anthropic SDK (@anthropic-ai/sdk) — LLM calls for debate agents
- Tailwind CSS only — no other UI libraries

---

## Smart wallet + email sign-up
User enters email → Circle sends OTP → user verifies →
Circle Wallets creates ERC-4337 smart account on Arc testnet →
wallet address shown → user places bets immediately.

No seed phrases. No browser extension. Works on mobile.

```ts
// lib/circle-wallets.ts
import { W3SSdk } from '@circle-fin/w3s-pw-web-sdk'

export const sdk = new W3SSdk({
  appSettings: { appId: process.env.NEXT_PUBLIC_CIRCLE_APP_ID as string }
})

// Server: POST /api/auth/init
// Body: { email }
// Calls Circle API to create user + send OTP
// Returns: { userId, challengeId }

// Server: POST /api/auth/verify
// Body: { userId, otp }
// Completes wallet init
// Returns: { walletAddress }
```

Circle Wallets docs: https://developers.circle.com/wallets
User-controlled wallets: https://developers.circle.com/wallets/user-controlled

---

## Arc App Kit — key methods
```ts
// Cross-chain bet deposit
await kit.unifiedBalance.deposit({
  from: { adapter: viemAdapter, chain: "Base_Sepolia" },
  amount: "1.00",
  token: "USDC",
})

// Payout winner
await kit.unifiedBalance.spend({
  from: { adapter: viemAdapter },
  amountIn: totalPot,
  to: {
    adapter: viemAdapter,
    chain: "Arc_Testnet",
    recipientAddress: winnerAddress,
  },
})

// Direct send (fallback)
await kit.send({
  from: { adapter, chain: "Arc_Testnet" },
  to: "RECIPIENT_ADDRESS",
  amount: "1.00",
  token: "USDC",
})
```

---

## x402 agent research payments
Each agent has a Circle smart wallet with a starting balance of $1.00 USDC.
Mid-debate, agents POST /api/research (gated behind x402). Cost: $0.005/call.
Agent wallet auto-pays. Balance + spending shown live to the audience.

---

## Match flow
1. User enters email → smart wallet created via Circle Wallets
2. Topic drops — Agent A = FOR, Agent B = AGAINST
3. Betting opens — user picks side, deposits USDC from smart wallet
4. 4-round debate — agents stream responses live
5. Agents spend $0.005 USDC per research call mid-round
6. Judge agent scores both sides after round 4
7. Winning side splits pot — Arc App Kit settles USDC

---

## Acceptance criteria (build in this order)
- AC1: email input → OTP → Circle smart wallet created → address shown
- AC2: betting panel — pick side, enter amount, place bet from smart wallet
- AC3: 4-round debate with streaming agent responses via SSE
- AC4: live bet totals per side (poll every 3s)
- AC5: agents call mock x402 research endpoint mid-debate
- AC6: real-time agent wallet balance + spending log
- AC7: judge agent scores round 4, declares winner
- AC8: USDC payout to winners via Arc App Kit kit.send()
- AC9: full arena page — all components live simultaneously

---

## Mocking rules
- x402 research endpoint: POST /api/research → { insight: "...", cost: 0.005 }
- ERC-8183 settlement: use kit.send() — mark clearly as // TODO: ERC-8183
- CyClaw agent hosting: mock as local API route for now
- Agent wallets: Circle Wallets on testnet

---

## Hard rules
- One AC per Claude Code session. Never build two at once.
- Search Arc MCP before implementing any Arc or Circle method.
- Never rewrite working code unless explicitly asked.
- USDC amounts always as strings ("1.00" not 1.00).
- Testnet only until told otherwise.
- Tailwind only — no shadcn, no chakra, no MUI.

---

## File structure
```
agent-battle-arena/
├── CLAUDE.md
├── PHASE_0_CHECKLIST.md
├── BUILD_GUIDE.md
├── .env.local
├── app/
│   ├── page.tsx                       # landing + email sign-up
│   ├── arena/[id]/page.tsx            # live match view
│   └── api/
│       ├── auth/
│       │   ├── init/route.ts          # create Circle user + trigger OTP
│       │   └── verify/route.ts        # verify OTP → return wallet address
│       ├── debate/route.ts            # agent debate logic + SSE streaming
│       ├── bet/route.ts               # place bet, store in memory
│       ├── research/route.ts          # mock x402 research endpoint
│       ├── judge/route.ts             # judge agent scoring
│       └── settle/route.ts            # payout via Arc App Kit
├── components/
│   ├── EmailLogin.tsx                 # email + OTP form
│   ├── WalletBadge.tsx               # address + USDC balance
│   ├── BettingPanel.tsx
│   ├── AgentFeed.tsx                  # streaming debate text
│   ├── ResearchTicker.tsx             # live agent spending
│   ├── BetTotals.tsx                  # live totals per side
│   └── ScoreBoard.tsx                 # judge verdict + scores
└── lib/
    ├── circle-wallets.ts              # Circle Wallets SDK init
    ├── arc.ts                         # Arc App Kit setup
    ├── agents.ts                      # agent system prompts
    └── x402.ts                        # mock x402 client
```
