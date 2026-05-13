# BUILD_GUIDE.md — Agent Battle Arena

One AC per session. Commit after each. Never skip ahead.
Claude Code has Arc MCP connected — it will look up docs automatically.

---

## SESSION PROMPTS

### Session 1 — AC1: Email sign-up + smart wallet
```
Read CLAUDE.md. Use Arc MCP if you need to look up anything.
Implement AC1 only.

Build EmailLogin.tsx: email input field, submit button.
On submit → POST /api/auth/init with { email }.
Server calls Circle Wallets API to create user and trigger OTP.
Returns { userId, challengeId }.

Show OTP input field. On submit → POST /api/auth/verify with { userId, otp }.
Server completes wallet initialization.
Returns { walletAddress }.

On success → show WalletBadge.tsx: truncated wallet address + USDC balance.
No MetaMask, no seed phrase, no browser extension needed.
Commit when done.
```

### Session 2 — AC2: Betting panel
```
Read CLAUDE.md. AC1 is done (email login + smart wallet working).
Implement AC2 only.

Build BettingPanel.tsx: two side buttons (Agent A / Agent B),
USDC amount input, Place Bet button.
On bet → POST /api/bet with { walletAddress, side, amount }.
Server stores bet in memory Map.
Show confirmation: "Bet placed: $X on Agent [A/B]".
Disable betting once user has placed a bet.
Commit when done.
```

### Session 3 — AC3: 4-round debate with streaming
```
Read CLAUDE.md. AC1 and AC2 are done.
Implement AC3 only.

Create /api/debate/route.ts.
Agent A argues FOR the topic, Agent B argues AGAINST.
Use Anthropic SDK streaming. 4 rounds total.
Each round: Agent A speaks (stream), then Agent B responds (stream).
Agents are aware of the full debate history each round.

Build AgentFeed.tsx: two columns, one per agent.
Stream text into each column in real time using SSE.
Show round indicator: "Round 1 of 4".
Commit when done.
```

### Session 4 — AC4: Live bet totals
```
Read CLAUDE.md. AC1-AC3 done.
Implement AC4 only.

Build BetTotals.tsx showing:
- Total USDC bet on Agent A
- Total USDC bet on Agent B
- Number of bettors per side
Poll /api/bet/totals every 3 seconds.
Update live without page refresh.
Commit when done.
```

### Session 5 — AC5: Agent x402 research payments
```
Read CLAUDE.md. AC1-AC4 done.
Implement AC5 only.

Create /api/research/route.ts — mock x402 endpoint.
POST returns { insight: "<relevant crypto data>", cost: 0.005 }.
Insights should be relevant to the debate topic.

Wire agents in /api/debate/route.ts to call /api/research
once per round before generating their argument.
Deduct $0.005 from agent wallet balance in debate state.
Each agent starts with $1.00 USDC balance.
Commit when done.
```

### Session 6 — AC6: Agent spending display
```
Read CLAUDE.md. AC1-AC5 done.
Implement AC6 only.

Build ResearchTicker.tsx:
- Agent A wallet: starting $1.00 → current balance
- Agent B wallet: starting $1.00 → current balance
- Live log of each research purchase (round, cost, snippet of insight)
Pull from debate state via /api/debate/state.
Update in real time alongside the debate stream.
Commit when done.
```

### Session 7 — AC7: Judge agent
```
Read CLAUDE.md. AC1-AC6 done.
Implement AC7 only.

Create /api/judge/route.ts.
After round 4, judge receives full debate transcript.
Judge scores each agent on:
- Logic (0-10)
- Evidence quality (0-10)
- Persuasiveness (0-10)
Returns { winner: "A" | "B", scores: {...}, summary: "..." }.

Build ScoreBoard.tsx: show scores per category, winner banner,
judge's one-paragraph verdict summary.
Commit when done.
```

### Session 8 — AC8: USDC settlement
```
Read CLAUDE.md. AC1-AC7 done. Use Arc MCP to verify kit.send() params.
Implement AC8 only.

Create /api/settle/route.ts.
On judge verdict, use Arc App Kit kit.send() to pay each
winning bettor proportional to their bet size.
Log all payout transactions.
Show transaction links on ScoreBoard.tsx after settlement.
Mark settlement logic with: // TODO: replace with ERC-8183 contract
Commit when done.
```

### Session 9 — AC9: Full arena page
```
Read CLAUDE.md. All backend ACs done.
Implement AC9 only.

Wire all components into /app/arena/[id]/page.tsx:
Layout:
- Top bar: WalletBadge (left) + round indicator (center) + BetTotals (right)
- Center: two-column AgentFeed with agent names and streaming text
- Right sidebar: BettingPanel (locks after bet placed)
- Bottom bar: ResearchTicker scrolling left to right
- Overlay on match end: ScoreBoard with winner + payouts

Clean, readable. Dark background. No clutter.
Commit when done.
```

---

## PHASE PROMPTS

Starting a new Claude Code session mid-build:

```
Read CLAUDE.md.
Arc MCP is connected — use it to look up any Arc or Circle API.
Current state:
- Done: [list ACs]
- Now building: AC[N]
- Last commit message: [paste it]
Continue.
```

---

## STUCK PROMPTS

Going in circles:
```
Stop writing code. Tell me in one sentence:
what are you trying to do, and what is blocking you.
```

Rewriting working code:
```
Stop. Revert to last commit.
Implement ONLY [specific thing], touch no other files.
```

Hallucinating an API method:
```
Stop. That method does not exist.
Use Arc MCP to find the correct method, then implement.
```

---

## COMMIT PROMPTS

After each AC:
```
AC[N] is working. Commit with message:
"feat: AC[N] — [one line description]"
Do not commit .env.local or any file with API keys.
```

---

## DEMO CHECKLIST

- [ ] User signs up with email, wallet address appears
- [ ] Bet placed successfully from smart wallet
- [ ] Debate streams live — both agents visible
- [ ] Research purchases visible in ResearchTicker
- [ ] Bet totals update in real time
- [ ] Judge declares winner with scores
- [ ] USDC payout tx visible on Arc testnet explorer
- [ ] Full arena page renders all components simultaneously
- [ ] Works on a fresh browser, no cached state
- [ ] No console errors during a full match

---

## 4 SLIDES

**Slide 1 — Problem**
Web3 UX is broken for normal people.
Seed phrases kill onboarding. Agents can't pay for better information.
Nobody bets on AI arguments because there's no infrastructure to settle it.

**Slide 2 — Solution**
Agent Battle Arena.
Sign up with email. Smart wallet created instantly via Circle.
Two AI agents debate live. They buy better arguments with real USDC.
You bet on who wins. Arc settles the pot.

**Slide 3 — How it works**
Email → Circle smart wallet (ERC-4337, no seed phrase)
→ Betting opens (Arc unified balance, cross-chain)
→ 4-round debate + x402 agent research payments
→ Judge scores → Arc App Kit settles USDC to winners

**Slide 4 — Why Arc + Circle**
Arc: cross-chain USDC, sub-second finality, ERC-8183 job settlement
Circle: email-to-wallet onboarding + x402 per-call agent payments
First arena where agents have real skin in the game
and users don't need a wallet to start.

---

## VIDEO SCRIPT (60 seconds)

[0-5s]
"what if you could bet on AI arguments — and the agents had to earn their wins?"

[5-15s]
user types email. wallet appears. no seed phrase. no MetaMask.

[15-35s]
topic drops. bets placed. debate starts.
agent pauses mid-round, spends $0.005 USDC, pulls live data.
ResearchTicker shows the deduction. crowd shifts bets.

[35-50s]
round 4 ends. judge scores: logic 8, evidence 9, persuasion 7.
winner declared. USDC hits wallets in under a second.
Arc testnet tx appears on screen.

[50-60s]
"agent battle arena.
email sign-up. smart wallets. real stakes.
built on Arc. powered by Circle."
