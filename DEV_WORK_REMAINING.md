# Dev Work Remaining

## What's fully working today

- Storefront (browse, filter, buy via Stripe/USDC/Points)
- Gacha pulls (3 tiers, weighted odds, Framer Motion reveal, daily limits)
- 95% instant buyback system
- Points economy (earn on every purchase, spend on cards/packs, full ledger)
- P2P marketplace (list, buy, dispute flow)
- Leaderboard (weekly/monthly, ranked, prizes, countdown)
- Auth (register, login, JWT, bcrypt, admin gate)
- Stripe checkout (test mode, webhook fulfillment for storefront + bundles)
- Admin stats dashboard
- Seed data (10 users, 150+ cards, 3 packs, bundles, leaderboard prizes)
- Dark theme + rarity animations + polished UI

---

## Solo dev — no complications

### Trivial
- Wire admin inventory save endpoint (UI exists, API stubbed, just connect)
- Wire admin odds editor save endpoint (same — UI done, logic stubbed)
- Wire admin user management endpoint (same pattern)
- Add Google OAuth button to login page (NextAuth config already supports it)
- Error boundaries (React fallback UI)
- Rate limiting on API routes (Next.js middleware)
- Create `.env.example` documenting all required vars
- Link landing page (giftpull-landing) to main app or replace with Next.js route

### Straightforward
- Wire gacha Stripe webhook fulfillment (handler exists at `/api/webhooks/stripe`, gacha engine exists in `gacha-engine.ts`, just connect them)
- Unit tests for `gacha-engine.ts`, `points.ts`, `buyback.ts`, `leaderboard.ts` (pure functions, easy to test with Jest/Vitest)
- Integration tests for API routes (mock Prisma, test request/response)
- CI/CD pipeline (GitHub Actions: lint, typecheck, test, deploy to Vercel)
- Input validation hardening (Zod schemas on all API route inputs)
- Fill remaining loading/skeleton states
- Enable email verification flow (NextAuth infra already there)

### Moderate
- E2E tests with Playwright (register -> buy card -> pull gacha -> buyback -> sell on marketplace)
- Advanced dispute resolution (arbitration flow, admin review panel with resolution UI)
- Admin analytics dashboard (aggregate queries on transactions, pulls, revenue over time)
- Mobile responsiveness pass (layout needs breakpoints, dark theme already works)
- Security audit (CSRF hardening, session edge cases, webhook signature validation)

---

## Needs a backend/contract dev (or careful research)

### Blockchain integration
- **Real USDC transfers on Base** — Currently mocked (DB only). Needs wagmi/viem for actual on-chain USDC sends/receives, wallet connection, transaction signing, confirmation polling
- **Smart contract escrow for P2P marketplace** — Currently DB simulation. Needs Solidity escrow contract that holds USDC during P2P trades and releases on confirm/dispute
- **On-chain payment verification** — Verify USDC deposits actually hit the contract before crediting user balance

### Advanced systems (documented, not required for launch)
- **Autonomous agents** (see `AGENTS_ECOSYSTEM.md`) — Claude-powered agent loops: pricing oracle, EV balancer, fraud sentinel, inventory agent. Ambitious, defer until post-launch
- **KYC/AML compliance** — Jurisdiction-dependent, needs legal consultation for gift card resale
- **Gift card code verification** — Validate user-submitted codes are real and unredeemed before marketplace listing. Requires brand-specific APIs or third-party verification service

---

## Currently stubbed (UI exists, logic missing)

| Feature | What's done | What's missing |
|---------|-------------|----------------|
| Admin inventory management | UI complete, browse works | Bulk add/edit save endpoint |
| Admin odds editor | UI complete, display works | Save/update endpoint |
| Admin user management | UI complete, list works | Points adjustment, ban/unban actions |
| Gacha Stripe webhook | Handler exists, signature verified | Gacha pull fulfillment not wired (storefront works) |
| USDC payments | UI flow complete, DB credits work | Real on-chain transfers |
| P2P escrow | DB simulation, dispute flow works | On-chain escrow contract |
| Google OAuth | NextAuth config ready | Button not on login page |
| Email verification | NextAuth infra exists | Not enabled |

---

## Animation Polish (Nice-to-Have)

Current gacha pull animation is production-grade (841-line multi-stage: pack shake, rarity-scaled burst, 3D card flip, Legendary sparkle grid). These are enhancement items, not blockers.

| Area | Current State | Improvement |
|------|--------------|-------------|
| Purchase success celebration | Clean fade + points counter | Add confetti/particle burst on buy |
| Leaderboard rank changes | Animates on row entry/exit only | Animate actual rank movements (position swap) |
| Card hover effects | Subtle 0.5px lift + border glow | More pronounced scale (1.03x) + rarity-colored glow |
| Background ambience | Static gradients and blurred blobs | Subtle floating ambient particles |
| Loading/skeleton states | Basic `animate-pulse` placeholders | Shimmer wave effect (skeleton screen upgrade) |
| Storefront card reveal | Instant display after purchase | Flip/reveal animation matching gacha style |
| Navbar points badge | Static number | Animate count-up on points earned |
| Marketplace listing sold | No feedback | Flash/pulse sold badge animation |

**Priority:** Add confetti on purchase success (high-impact, low-effort). Rest is post-launch polish.

---

## Not started

| Item | Notes |
|------|-------|
| Tests (unit, integration, E2E) | No test files, no test framework configured |
| CI/CD | No GitHub Actions, manual deploy only |
| Rate limiting | API routes unprotected |
| Production deployment | Local dev only, no staging/prod environment |
| Monitoring / error tracking | No Sentry, no uptime checks |
| Real Stripe keys | Test mode only, need live keys + webhook endpoint |

---

## Recommended build order

1. **Wire the stubs** — Admin endpoints + gacha webhook (quick wins, completes the prototype)
2. **Test suite** — Jest/Vitest for lib functions, Playwright for E2E
3. **Security + validation** — Zod on inputs, rate limiting, error boundaries
4. **CI/CD** — GitHub Actions, deploy to Vercel
5. **Production Stripe** — Switch to live keys, configure production webhook URL
6. **Blockchain** — Real USDC on Base, escrow contract (needs contract dev or careful research)
7. **Polish** — Mobile responsiveness, loading states, Google OAuth
8. **Animation polish** — Confetti on purchase, leaderboard rank animations, hover upgrades, shimmer loaders
9. **Advanced** — Analytics dashboard, autonomous agents, KYC (post-launch)
