# Design Brief: WalletCry — Personal Finance, ADHD-First

> A local-first, installable PWA for tracking spending, debts, income, and a
> "when can I afford it" wishlist — built so an ADHD brain actually keeps using it.

## Problem

Managing money is a working-memory tax, and existing finance apps make it worse.
They demand tedious manual entry, bury the one number you came to see under
cluttered dashboards, give no reward for showing up, and are genuinely hard to
*move around in*. So you open them once, feel overwhelmed, and never return — and
the not-knowing quietly becomes anxiety. On top of that, when you *want* something,
there's no honest answer to the only question that matters: "can I actually afford
this, and when?" — so purchases happen on impulse or guilt.

## Solution

WalletCry turns a bank CSV (later, a live bank feed) into a calm, glanceable picture
of where you stand, and answers one question at a time. You import a statement, it
auto-categorizes and finds your recurring bills, and the home screen shows the few
numbers that matter — what's left, what's owed, what's coming. Debts get honest
amortization timelines. And the wishlist is the dopamine engine: paste a link, it
becomes a pending item, and the app tells you *"affordable in 3 months"* — or lets
you compare saving up vs. financing it now, with the real cost of impatience shown
in plain numbers. Nothing nags, nothing clutters; progress is the reward.

## Experience Principles

1. **Friction kills adherence — automate the boring** — Every recurring task (entry,
   categorization, bill detection, dedup, link→item) is the app's job, not yours.
   The only manual acts are *decisions*, never *data shuffling*.

2. **One clear answer per screen over a wall of data** — Each view resolves a single
   question ("where do I stand?", "when can I afford this?", "when am I debt-free?").
   Density is allowed — this is a ledger — but it's *ordered* density, never noise.
   Detail is reachable, not upfront.

3. **Reward progress, not engagement** — Dopamine comes from seeing a payoff date move
   closer, a wishlist bar fill, a surplus grow — calm, earned, honest. No streaks-for-
   streaks'-sake, no manipulative nudges, no fake urgency.

## Aesthetic Direction

- **Philosophy**: **"Technical Ledger"** — Swiss-modernist / engineered. Finance data is
  treated as precise, tabular, and honest. The interface looks like a beautifully drafted
  technical document: a visible structural grid, **hairline borders and dividers** doing
  the layout work (not shadows or fills), **monospaced type for all numbers and labels**,
  generous whitespace framing dense data, and restrained near-monochrome color with one
  or two sharp accents. Borders and lines are the signature — they organize, separate, and
  make density legible. Tables, statements, and amortization schedules become a *feature*,
  not an eyesore.
- **Tone**: Composed, exact, quietly confident. Reads as *engineered* — between "calm"
  (spacious, unhurried) and "premium" (refined, high-contrast), but never soft/rounded/
  cutesy and never cold/intimidating. Trustworthy like graph paper.
- **Reference points**: Aino Agency (the user's reference — hairline grids, mono labels,
  ASCII/technical motifs, editorial structure); Linear (calm precision, restraint);
  technical drawings / engineering ledgers / financial statements as visual language;
  a touch of Teenage Engineering's labeled, instrument-like clarity.
- **Anti-references**: Mint (cluttered, ad-heavy, overwhelming); typical bank apps (boxy,
  shadowed, generic blue); gamified neobanks that shout with confetti and vivid gradients;
  anything with heavy drop-shadows, glassmorphism, or rounded pastel "cards floating in
  space." Dopamine here is *structural and earned*, not loud.

## Existing Patterns

Empty repository — greenfield. No tokens, components, or conventions to honor yet.
This brief and the tokens phase establish the vocabulary from scratch.

- Typography: _none yet_ → plan: a clean grotesque sans for UI text + a monospace for all
  numerics/labels (the Technical Ledger signature).
- Colors: _none yet_ → plan: near-monochrome ink-on-paper, light + dark, one sharp accent
  + semantic up/down (income/expense) colors.
- Spacing: _none yet_ → plan: strict modular grid scale.
- Components: _none yet_ → see inventory below; all New.

## Component Inventory

| Component | Status | Notes |
| --- | --- | --- |
| App shell + nav (responsive: tab bar mobile / sidebar desktop) | New | Truly 50/50; easy navigation is the #1 UX mandate |
| Stat / number block (mono, with delta) | New | The atomic unit of the ledger aesthetic |
| Hairline data table | New | Transactions, schedules — bordered, dense, legible |
| Balance / "what's left" hero | New | Home-screen single-answer summary |
| CSV import wizard (drop → map columns → preview → confirm) | New | Remembers mapping per bank; dedup + recurring detection |
| Category chip / editor | New | Auto-assigned, user-correctable; rules learned |
| Transaction list + quick-edit | New | Low-friction recategorize, split, flag |
| Debt card + amortization schedule view | New | Full amortization; payoff timeline; extra-payment modeling |
| Income source manager | New | Multiple streams, fixed + variable |
| Surplus / cashflow summary | New | income − essentials − avg spend → monthly surplus |
| Wishlist item card (Need/Want/Dream) | New | Affordability bar + "affordable in N months" |
| Link-import sheet (paste URL → pending item) | New | Calls fetch-proxy for title/price/image; user confirms |
| Financing calculator (save-up vs finance; BNPL) | New | APR + term → monthly + total interest; cost-of-impatience |
| Progress bar / goal meter | New | The dopamine surface — calm fill, payoff dates moving |
| Empty / onboarding states | New | First-run: import a CSV; gentle, not a wall |
| Settings (currency, categories, future: sync/bank link) | New | Scaffold sync + aggregator entry points |

## Key Interactions

- **CSV import**: User drops a file → app detects delimiter/columns, asks user to map
  Date / Amount / Description *once* (remembered per bank fingerprint) → preview table with
  auto-categorization and flagged duplicates → user confirms. Re-importing an overlapping
  statement silently dedupes. Recurring charges surface as suggested "bills."
- **Recategorize**: Tap a transaction's category chip → quick picker → app offers to apply
  the same rule to all matching merchants going forward (learns silently).
- **Wishlist link-import**: User pastes/share-targets a URL → bottom sheet shows fetched
  title, price, image (from proxy) in a *pending* state → user assigns Need/Want/Dream and
  confirms → item joins list with a live affordability bar.
- **Affordability readout**: Each wishlist item shows "affordable in N months" derived from
  current monthly surplus; tapping opens the financing calculator to compare *wait & pay
  cash* vs *finance now* (monthly payment, total interest, and how it delays other goals).
- **Debt payoff**: Adjusting an extra-payment slider animates the payoff date and total-
  interest figures in real time — the honest, calm dopamine of watching the date move closer.
- **Feedback character**: State changes use quick, precise motion (lines drawing, numbers
  ticking, bars filling) — instrument-like, never bouncy/confetti.

## Responsive Behavior

Truly responsive, 50/50 phone+desktop — no "mobile afterthought."
- **Mobile (installed PWA)**: bottom tab bar (Home / Transactions / Debts / Wishlist / More),
  single-column stacked blocks, large touch targets, tables become horizontally scrollable
  or collapse to stacked key/value rows. Share-target intent feeds the link-import sheet.
- **Desktop**: persistent left sidebar nav, multi-column grid (e.g. summary + detail side by
  side), full-width hairline tables, hover affordances and keyboard nav. CSV import and review
  feel "sit down at a desk" comfortable.
- The structural grid + hairline system scales between both without changing identity.

## Accessibility Requirements

- WCAG AA contrast minimum (≥4.5:1 text, ≥3:1 UI/borders) — hairlines must stay visible in
  both light and dark themes (use sufficient-contrast border tokens, not faint greys).
- Full keyboard navigation; visible focus rings consistent with the technical aesthetic.
- Touch targets ≥44px on mobile.
- Numbers/data not conveyed by color alone (income/expense also signed and labeled) — important
  for the semantic up/down palette.
- Respect `prefers-reduced-motion` (the ticking/drawing animations have static fallbacks).
- Screen-reader-correct tables (proper headers/scope) and labeled form fields in import/mapping.

## Out of Scope (this build)

- **Live bank API / aggregator integration** — only *scaffolded* (entry points, data-layer
  seam, settings stub). EU/PSD2 provider chosen later; no real connection built now.
- **Cloud sync & Google sign-in** — architecture leaves a clean seam; not implemented this round.
- **The fetch-proxy backend** for link-import — interface and contract defined; a stub/mock is
  acceptable for the build, real deployment later.
- **Multi-currency FX conversion logic** — base currency PLN with currency *field* and formatting
  flexibility; live exchange-rate conversion is later.
- **Real bank data** — build runs on mock/sample CSV + seeded data.
- **Investments, budgeting envelopes, tax, shared/household accounts** — not in v1.
