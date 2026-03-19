GIFTPULL — AUTONOMOUS AGENT ECOSYSTEM
======================================
Status: Planning / Future Implementation
Last updated: March 2026

This document outlines the autonomous agents that can operate on the
GiftPull platform. These agents span three categories: platform-side
(operated by us), user-facing (built into the product), and market-making
(creating liquidity). None of these are being implemented in the current
prototype — this is a reference for future development.


1. PLATFORM-SIDE AGENTS (We Operate These)
-------------------------------------------

1.1 PRICING ORACLE AGENT

Purpose: Real-time gift card market price monitoring and automatic
storefront price adjustment.

What it does:
- Monitors external gift card market prices across sources like eBay sold
  listings, CardCash, Raise, and CardPool.
- Auto-adjusts storefront pricing to undercut or match competitors. If
  Steam $50 cards sell at 8% discount on Raise, our price reflects that.
- Feeds fair market value (FMV) into the buyback system. If a brand's
  secondary market price drops, the buyback FMV adjusts so we don't
  overpay at the 95% rate.
- Without this agent, pricing is blind and the 95% buyback guarantee
  becomes a financial liability.

Data inputs: External marketplace APIs, competitor scraping, wholesale
supplier pricing feeds.

Output: Updated FMV per brand/denomination, storefront price adjustments,
buyback rate overrides.


1.2 EV BALANCER AGENT

Purpose: Keeps gacha pack expected value within target range to maintain
both user trust and platform margin.

What it does:
- Watches the gacha engine's actual outcomes over rolling windows (last
  100 pulls, last 1,000 pulls, all-time).
- Compares real EV against target EV per pack tier.
- If the Standard pack target is +7% EV but actuals run at +15% (too
  generous, bleeding margin) or -3% (negative EV, users churn), the agent
  auto-adjusts probability weights or flags an admin alert.
- Think of it as the house pit boss — keeps the math honest.
- Courtyard and Collector Crypt both run this internally. It is what makes
  the gacha model sustainable long-term.

Data inputs: Pull result logs, probability tables, card pool composition.

Output: Adjusted probability weights, admin alerts, EV dashboard metrics.


1.3 FRAUD SENTINEL AGENT

Purpose: Transaction monitoring and anomaly detection across all three
workstreams.

What it does:
- Detects accounts opening packs at machine speed (bot behavior).
- Identifies coordinated buyback patterns — someone systematically pulling
  and selling back to drain the USDC treasury.
- Flags P2P listings with potentially stolen codes.
- Catches velocity spikes from single IPs or device fingerprints.
- Detects referral abuse rings (coordinated fake signups farming the 100pt
  referral bonus).
- Can auto-throttle (reduce daily limits for suspicious accounts),
  auto-freeze (pause USDC withdrawals pending review), and auto-quarantine
  (hold P2P listings from new accounts).
- Critical because the 95% buyback rate means fraud on the gacha side is
  the single biggest financial risk to the platform.

Data inputs: All transaction streams, user session data, IP/device
fingerprints, behavioral patterns.

Output: Risk scores per user, auto-throttle actions, frozen withdrawals,
admin escalation queue.


1.4 INVENTORY AGENT

Purpose: Autonomous gacha pool and storefront inventory management.

What it does:
- When available cards at a certain denomination/brand drop below a
  threshold, auto-triggers a procurement order from the gift card API (or
  flags admin for manual restock).
- Handles card recycling — when buyback cards re-enter the pool, decides
  whether they go back into gacha (to maintain pool depth) or onto the
  storefront (if that brand is understocked there).
- Balances inventory across all three workstreams so the gacha never runs
  dry on a rarity tier.
- Monitors pool composition to prevent over-concentration in a single
  brand, which would make pulls feel repetitive.

Data inputs: Card inventory status, pull velocity per tier, storefront
sales velocity, buyback volume, procurement API availability.

Output: Procurement orders, pool rebalancing actions, inventory alerts.


2. USER-FACING AGENTS (Built Into the Product)
-----------------------------------------------

2.1 PULL ADVISOR AGENT

Purpose: AI-powered recommendation layer that helps users make informed
pull decisions.

What it does:
- Before a pull, tells users about current pool state: "Based on the
  current Standard pack pool, there are 14 Epic-tier cards remaining out
  of 200 total. Your odds of pulling Epic are slightly above baseline
  right now."
- Suggests which pack tier has the best EV at this moment based on pool
  composition.
- Provides streak context: "You've pulled 8 Common-tier cards in a row —
  statistically, your next 5 pulls have a 34% chance of hitting Rare or
  above."
- Creates informed engagement rather than blind gambling. More ethical and
  more sticky — users feel like they have an edge.

User interaction: Opt-in feature. Displayed as a small advisory panel on
the gacha page before pull confirmation.


2.2 SMART BUYER AGENT

Purpose: Background agent that watches the platform on the user's behalf
and acts on preconfigured preferences.

What it does:
- Users configure preferences like "I want Xbox $25 cards under $22" or
  "Alert me when a Legendary-tier card appears in the P2P marketplace
  under $80."
- Watches storefront and marketplace listings in real-time.
- Sends push/email notifications when conditions are met.
- Can optionally auto-purchase if the user pre-authorizes a budget.
- Similar to Collector Crypt's eBay-style sniper/bid tool.
- Also watches for flash sales, limited-time bundles, or points multiplier
  events.

User interaction: Settings page where users define watch rules and budgets.
Notification center for triggered alerts.


2.3 POINTS OPTIMIZER AGENT

Purpose: Helps users maximize the value of their points balance.

What it does:
- Analyzes transaction history and recommends the most efficient
  redemption path: "You have 3,200 points. Redeeming for a Standard gacha
  pack (1,200 pts) gives you $16.05 expected value vs. redeeming for a
  $10 gift card (1,000 pts). The pack is 33% more efficient per point."
- Suggests earning strategies: "You've been buying via Stripe. Switching
  to USDC for your next 5 purchases would earn you 25% more points due to
  the multiplier."
- Identifies upcoming multiplier events and recommends timing purchases
  accordingly.
- Makes the points economy feel alive and rewards system engagement.

User interaction: Widget on the wallet page. Optional notification nudges.


3. MARKET-MAKING AGENTS (Create Liquidity)
--------------------------------------------

3.1 ARBITRAGE AGENT

Purpose: Monitors price differentials between workstreams and external
markets to capture or flag opportunities.

What it does:
- Watches price gaps across the three workstreams. Example: someone lists
  a $25 Steam card on P2P for $18 (28% below face), while gacha buyback
  pays $23.75 (95% of $25). That is $5.75 arbitrage.
- Can operate as a platform-owned agent that buys underpriced P2P listings
  and recycles them into the gacha pool.
- Monitors external markets — if cards on our platform are priced lower
  than CardCash or Raise, flags the opportunity to adjust pricing or
  restrict listings to prevent value leakage.
- Can also alert users to arbitrage opportunities as a premium feature.

Data inputs: P2P listing prices, storefront prices, buyback rates,
external market feeds.

Output: Auto-purchase actions on underpriced listings, pricing alerts,
value leakage reports.


3.2 MARKET MAKER AGENT

Purpose: Liquidity backstop for the P2P marketplace, ensuring it never
feels empty.

What it does:
- Automatically lists platform-owned inventory at competitive prices so
  buyers always find cards when browsing.
- Automatically makes buy offers on user listings priced within 5% of FMV
  to ensure sellers can always exit a position.
- This is exactly what Courtyard does with their 90% buyback — they are
  the market maker. Our agent extends that concept from gacha buyback to
  the full P2P marketplace.
- Ensures the marketplace never feels empty, which is the death spiral for
  any two-sided market in its early days.
- As organic volume grows, the market maker agent dials back its activity
  to avoid crowding out real users.

Data inputs: Marketplace listing volume, buy-side demand signals, platform
inventory levels, time-on-listing metrics.

Output: Auto-listings, auto-buy-offers, liquidity health dashboard.


4. THE COMPOUND FLYWHEEL
--------------------------

The agents above are individually useful, but the compound effect is what
makes the system powerful. Here is how they chain together:

1. Pricing oracle detects Nintendo eShop cards trading at 12% discount
   externally.
2. Inventory agent procures a batch at wholesale.
3. EV balancer adjusts gacha odds to include more Nintendo cards at
   favorable weights.
4. Pull advisor tells users "Nintendo cards are running hot in Premium
   packs right now."
5. Users pull more packs.
6. Some users sell back via buyback.
7. Market maker agent lists the recycled cards on the P2P marketplace at
   5% below the storefront price.
8. Smart buyer agent notifies bargain hunters who have set Nintendo
   alerts.
9. Marketplace velocity increases.
10. The whole flywheel accelerates.

Every agent feeds the next one. The system gets smarter and more liquid
with each cycle. Fraud sentinel watches the entire loop for abuse.


5. IMPLEMENTATION PRIORITY (WHEN WE BUILD THESE)
--------------------------------------------------

Phase 1 (post-prototype): Fraud sentinel, EV balancer
  - These protect the business. Ship before scaling.

Phase 2 (growth stage): Pricing oracle, inventory agent
  - These optimize margin and prevent stockouts.

Phase 3 (product maturity): Market maker, smart buyer agent
  - These drive marketplace liquidity and user retention.

Phase 4 (differentiation): Pull advisor, points optimizer, arbitrage agent
  - These are premium features that deepen engagement.


---
End of document.
