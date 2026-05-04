# AgentExchange — Consumer-first Redesign

**Date:** 2026-05-04
**Author:** Rovin (with Claude)
**Context:** Portfolio piece for a Product Manager interview. The site must demonstrate PM range — strategy, user empathy, prioritization, growth thinking, narrative craft — not just visual polish.

---

## 1. Goal

Show a hiring manager that the candidate thinks in **user journeys and growth loops**, makes **ruthless cuts**, and sweats the **details that affect real users**. The site must read as the work of a product person — not a marketer or a designer.

The demo target: a cold visitor lands → understands the wedge in 30 seconds → watches a personified AI agent win them a hotel → leaves with the impulse to share. Every screen must hold up without verbal narration.

## 2. Non-goals

- Building a real, functional product (no auth, no real auctions, no payments)
- Covering both sides of the marketplace equally — the supplier side (Hotels) is intentionally demoted
- Adding feature breadth for its own sake — every addition must defend itself against being cut

## 3. Audience

Primary: one person — the hiring manager. Demo viewed live or shared as a URL.

Secondary: anyone the hiring manager forwards it to. The site must work cold, without the candidate present.

## 4. Product positioning

**Tagline:** "AI agents that fight hotels for your bedtime."

**Wedge:** Hotels burn ~30% of inventory after 6pm. Travelers don't have time to chase deals. AgentExchange deploys a personified AI agent on the traveler's behalf to negotiate against the hotel's revenue management system in real time, with a hard price ceiling.

## 5. Information architecture

### Top nav (consumer-first)
1. **Home** (was *Exchange*) — hero + embedded story + social proof + CTA
2. **Deploy** — commissioning flow
3. **Live** *(new)* — auction visualization (the centerpiece)
4. **Tonight** (was *Midnight*) — last-minute deal hunting

### Demoted
- **Hotels** (was *Supplier*) — moved to a small footer link: *For hotels →*. Kept reachable; not in primary nav.

### Top-right
- **PM view** toggle (off by default)

---

## 6. Screen-level design

### 6.1 Home (was Exchange)

**Purpose:** Land the wedge in 10 seconds. Drive to Deploy or Live.

**Above the fold**
- Globe (kept — it's the visual signature)
- Headline: *"AI agents that fight hotels for your bedtime."*
- Subhead: live counter — *"1,247 agents bidding right now · 34% avg savings · 47 markets"*
- Single CTA: *Deploy your first agent →*

**Below the fold — embedded story (3 acts)**
1. **The waste** — micro-chart: ~30% of hotel rooms unsold at 6pm. *"Hotels would rather discount than leave it empty. They just won't admit it in public."*
2. **The bet** — 3 short cards: *Hotels run revenue bots. Travelers don't. We give travelers a bot.*
3. **The proof** — recent wins (anonymized), testimonial-style snippets, total saved counter.

**Cuts:** the marquee ticker (low signal), the existing 6-card matches grid (replaced by the Proof act).

**Copy direction:** specific over generic. *"Sarah's agent saved $312 in 4 minutes"* beats *"Save big with AI."*

### 6.2 Deploy

**Purpose:** Frictionless commissioning. Inspire trust.

**Reframe:** Header changes from *"Deploy agent"* to *"Commission your agent."* The micro-difference matters — *commission* implies trust + delegation, not configuration.

**New blocks**
- **Agent personality picker** — three named characters with avatars:
  - **Hawk** (aggressive) — bids fast, wins more, pays slightly higher
  - **Sage** (balanced) — optimizes price vs. speed
  - **Owl** (patient) — waits for the floor, smaller win rate
- **Trust block** — directly under the budget ceiling:
  - *"Hard cap. Your agent will never bid above this. If it overpays by $1, we eat the difference."*
  - *"Cancel free up to 24h before check-in."*

**Submit behavior:** No more static *"Agent deployed — negotiating..."* button. Submitting transitions the user directly into the Live Auction screen with the chosen agent + parameters.

**Empty state:** Before any agent is configured, a personality avatar idles with a one-liner. *"Hawk is awake. Where are you sending him?"*

### 6.3 Live *(new — the centerpiece)*

**Purpose:** Visualize the actual product magic. Make the demo unforgettable.

**Layout (desktop)**
- **Center:** the bid ladder — your agent's bid versus 3–5 rival agents, with each agent's name and avatar. New bids slide in from the bottom. Heartbeat pulse on the page background tied to live activity.
- **Top:** target hotel card (Marriott Downtown · Las Vegas · 3 rooms left), with shrinking countdown.
- **Right rail:** agents' "thoughts" streaming as one-liners. *"Hawk: rival 7x3k just bid $148, holding firm at $142."* *"4f8r: dropped out (cap reached)."*
- **Bottom:** mono ticker of bid events — `19:42:11 · hawk → $142 · accepted`.

**Win moment**
- Bid ladder freezes, your agent pulses, hotel card flips into a receipt.
- Savings number animates from $0 → final savings.
- Two CTAs surface: *Share this win* / *Refer a friend, both get $10*.
- No standalone "Won" screen — this is the climax of Live.

**Loss path**
- Graceful, not punishing. *"Sage held the line. The room went for $171, $11 above your cap. Want me to try Tonight's drops instead?"*
- Single CTA: *Try Tonight* → handoff to /tonight.

**Demo-friendly affordances**
- Anyone can hit /live without configuring an agent first — defaults to a scripted setup so the demo loop works cold.
- Optional audio (off by default, opt-in via small `?` button) — subtle heartbeat. Heightens the demo without ambushing the user.
- Loop time: ~30 seconds end to end.

### 6.4 Tonight (was Midnight)

**Purpose:** Capture last-minute, high-urgency demand. Tie back to Live.

**Changes from current**
- Sharper urgency: *"Agents already deployed for tonight: 247"*; per-deal *"3 agents bidding"* counters.
- Geographic filter (city pill row).
- Clicking a deal card opens the Live Auction simulation pre-loaded with that hotel.
- Push-style nudge: *"Wake me when a great deal drops"* — opens a tiny opt-in (no real backend; localStorage flag, framed in PM-view as "the retention hook").

**Kept:** the countdown clock, the deal grid, the savings framing.

### 6.5 Hotels (demoted)

**Change:** Removed from primary nav. Reachable via a small footer link: *For hotels →*. The existing screen content stays (still useful for completeness if the boss clicks through), but it's deliberately not part of the primary tour.

**Rationale visible in PM-view:** *"Two-sided marketplaces start one side at a time. Demand is the harder side here. We're investing 80% of our build in demand and shipping a minimal supplier surface that signals we know the other side exists."*

---

## 7. PM-view toggle

**Surface:** small pill in the top-right of the nav, label *"PM view"*. Off by default.

**Behavior:** When on, every consumer screen reveals contextual annotation chips. Each chip has up to four facets:
- **Why** — the user job this exists to serve
- **Tracking** — the metric this is measured by
- **Tradeoff** — what was cut and why
- **V2** — the next bet on this surface

**Examples**

Home → headline chip:
> **Why:** First-impression test — does the wedge land in 10s?
> **Tracking:** % visitors who scroll past act 1 (target: >60%)
> **Tradeoff:** Replaced the live ticker — high motion, low comprehension
> **V2:** A/B test headline framing (job-to-be-done vs. savings-led)

Deploy → trust block:
> **Why:** Trust is the #1 abandonment driver in money-flow products
> **Tracking:** Conversion through Deploy step
> **Tradeoff:** Could ship without the price-cap guarantee, but ARPU lift won't matter if nobody clicks Deploy
> **V2:** Underwrite the guarantee with an insurance partner; surface the badge throughout the funnel

Live → win moment:
> **Why:** Activation = first win. Memorable wins drive sharing.
> **Tracking:** Share-rate post-win (target: 18%); D7 retention conditional on first win
> **Tradeoff:** Confetti is a cliche but earned here
> **V2:** Generate a shareable image card (OG-style) instead of a generic share dialog

Tonight → wake-me opt-in:
> **Why:** Retention loop — push permission is the cheapest re-acquisition channel
> **Tracking:** Push opt-in rate, D1 return-via-push
> **Tradeoff:** No real backend in this demo; localStorage flag stands in
> **V2:** Geo + budget-aware push; predictive nudge ("a deal you'd like is dropping in 2h")

**Visual treatment:** Annotation chips are inset cards with a subtle outline and a small *"PM"* tag. They appear inline near the thing they annotate, not as a separate panel. They never block content.

**Dismissal:** Toggle off restores the live data view exactly. State persists in localStorage.

---

## 8. Considered details (the craft layer)

- **Honest copy** — no SaaS clichés ("revolutionizing"), no lorem, no fake-precise numbers. Specific and human.
- **Empty states with personality** — *"Hawk is awake. Where are you sending him?"* / *"No deals yet. Refresh in 12 minutes."*
- **Loading & transition states** — Deploy → Live is a real animated transition, not a JS flip.
- **Mobile actually works** — single-column layouts, touch targets ≥44px, the auction ladder collapses to a stacked feed.
- **Keyboard nav + visible focus rings** — the toggle, strategy picker, deal cards.
- **Audio is opt-in** — never plays without a click.
- **First-visit prompt** — small banner: *"See a 30-second demo →"* drops the visitor into Live with a scripted setup. Boss-friendly entry point.
- **Performance** — defer the globe load; lazy-load the Live Auction's heavier bits.
- **Accessible color contrast** — verify accent on dark passes WCAG AA for body and large text.

## 9. Visual / brand direction

- **Keep:** dark base (`#0C0A09`), Inter, mono accents, `#F97066` accent, current spacing rhythm.
- **Adjust:** introduce one editorial serif (e.g., Instrument Serif) for the Home story headlines only — adds a magazine-y feel that signals craft.
- **Motion:** every screen has at least one ambient motion (globe; live ladder; countdown; deal-grid hover). Nothing distracting.
- **Iconography:** lucide (already in deps), consistent stroke + size. Avatars for the three agents are simple geometric marks (no AI-generated faces).

## 10. Tradeoffs visible to the boss

- Live Auction uses **scripted/simulated data**. PM-view annotation explains how V1 would work for real (matching engine + WebSocket stream).
- **No auth.** Replaced with a `localStorage` "your agent" memory. PM-view annotation calls this out as the activation insight: most users abandon at signup; a remembered agent removes that friction for the demo.
- **Hotels intentionally minimal.** Shows prioritization, not omission.

## 11. Risks

- **Scope risk** — five new things plus polish is a lot. Mitigation: Live Auction is the only mandatory new screen; PM-view is a layer, not a screen; Story is embedded into Home, not standalone.
- **"PM view feels gimmicky"** — risk that it reads as a stunt. Mitigation: keep annotations earnest, specific, and short. No fluff. If a chip can't say something concrete, cut it.
- **Live Auction reads as fake** — if the simulation feels canned, it backfires. Mitigation: vary scripts, randomize bid timing within bounds, and put the annotation in PM view so the artifice is owned.

## 12. Out of scope (explicitly cut)

- Standalone Won / Lost screens — folded into Live's climax
- My Agent dashboard — hinted at via badges only
- Standalone Story page — embedded in Home
- Full referral system — one CTA after a win, no flow
- Auth, settings, billing, real notifications — all PM-view-annotated as V2
- Polishing the Hotels surface — kept as-is, demoted to footer

## 13. Success criteria

The hiring manager, after a 5–10 minute browse:
1. Can repeat the wedge back in one sentence.
2. Names at least one specific PM decision they noticed without prompting (from PM view OR from craft).
3. Says some version of *"this person thinks like a PM, not just a designer."*

## 14. Build order (informs the plan)

1. Nav + footer — demote Hotels, add PM-view toggle, restructure routes (or keep state-based if simpler)
2. Home — story acts, headline, social proof, CTA
3. Deploy — reframe, personalities, trust block, transition to Live
4. **Live Auction (centerpiece)**
5. Tonight — sharpen, link to Live, wake-me opt-in
6. PM-view annotation system + content for each surface
7. Polish pass — copy, empty states, mobile, focus, motion, perf
