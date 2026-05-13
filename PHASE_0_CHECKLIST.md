# PHASE_0_CHECKLIST.md — Agent Battle Arena

Complete every item before writing a single line of code.

---

## 1. MCP setup (do this first)

- [ ] Add Arc MCP to Claude Code:
  ```bash
  claude mcp add --transport http arc-docs https://docs.arc.network/mcp
  ```
- [ ] Verify it works — open claude and ask:
  "What smart contract standards does Arc support?"
  It should return content from Arc docs, not a guess.
- [ ] Arc MCP gives Claude Code live access to Arc + App Kit docs.
  It will use this instead of hallucinating API shapes.

---

## 2. Environment

- [ ] Node.js 18+ (`node --version`)
- [ ] Claude Code installed (`npm install -g @anthropic-ai/claude-code`)
- [ ] Anthropic API key set (`export ANTHROPIC_API_KEY=sk-ant-...`)
- [ ] Git initialized (`git init`)

---

## 3. Circle setup

- [ ] Circle developer account — https://console.circle.com
- [ ] Create a new app → get App ID
- [ ] Enable user-controlled wallets
- [ ] Get API key for server-side wallet creation
- [ ] Get testnet USDC (Circle testnet faucet)
- [ ] Get Kit Key from Circle Console for Arc App Kit

---

## 4. Arc Network setup

- [ ] Arc testnet wallet created — https://arc.network
- [ ] Arc testnet USDC funded
- [ ] Note your Arc RPC URL

---

## 5. .env.local (create this, never commit it)

```env
# Circle Wallets
NEXT_PUBLIC_CIRCLE_APP_ID=your_app_id
CIRCLE_API_KEY=your_api_key

# Arc App Kit
NEXT_PUBLIC_KIT_KEY=your_kit_key
NEXT_PUBLIC_ARC_RPC_URL=https://rpc.arc.network/testnet

# Anthropic (for debate agents)
ANTHROPIC_API_KEY=sk-ant-...
```

---

## 6. Project scaffold

- [ ] `mkdir agent-battle-arena && cd agent-battle-arena`
- [ ] Drop CLAUDE.md, PHASE_0_CHECKLIST.md, BUILD_GUIDE.md in root
- [ ] Create .env.local with all keys above
- [ ] Add .env.local to .gitignore

---

## 7. Install dependencies

```bash
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir
npm install @circle-fin/w3s-pw-web-sdk
npm install @circle-fin/app-kit @circle-fin/adapter-viem-v2 viem
npm install @circle-fin/x402-batching
npm install @anthropic-ai/sdk
```

---

## 8. Confirm before starting

- [ ] `npm run dev` — loads at localhost:3000 with no errors
- [ ] `claude` — Claude Code opens in project root
- [ ] Claude Code can read CLAUDE.md (ask it to summarize it)
- [ ] Arc MCP is responding (ask about Arc App Kit methods)

---

## 9. First Claude Code session prompt

Once all boxes above are checked, paste this:

```
Read CLAUDE.md fully.
Use the Arc MCP server to look up Circle Wallets
integration with Arc if needed.
Implement AC1 only: EmailLogin.tsx component with
email input and OTP verification flow, connected to
POST /api/auth/init and POST /api/auth/verify.
On success, show WalletBadge.tsx with the user's
Arc testnet wallet address and USDC balance.
No other features. Commit when done.
```
