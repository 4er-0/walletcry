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

- **Philosophy**: **"Terminal Ledger / Tactical HUD"** — a CLI/terminal + command-center
  personality fused with Aino's Swiss hairline grid. Finance data is presented like a precise,
  honest command-line / mission-control readout. Concrete signature primitives (from the user's
  HUD references):
  - **Bracketed corner frames** (`⌐ ¬ L ⌐`) around panels — the HUD container look.
  - **Dashed / dotted borders & rules** (`·····` / `- - - -`) doing the layout work, not
    shadows or fills.
  - **Monospace for ALL data** — numbers, labels, table headers, nav, command bar — with a
    clean grotesque **sans for prose/descriptions** so longer reading stays effortless.
  - **Machine-readable label style**: `SIGNALS_OVER_TIME`, `LAST_14_DAYS`, `// 2 // 3`
    (underscores joining words, `//` separators, indexed pagination).
  - **Segmented / ticked gauges** (`▏▎▍▌▌▌`) instead of smooth progress bars.
  - **Log-feed pattern**: `> [17:48:12] message…` lines — used for import/activity logs.
  - **Thin HUD line charts**, sparklines, and the occasional **radar/spider chart**.
  - **Dotted / pointillist ASCII imagery** for hero art, empty states, and the login screen
    (cf. the ASCII Greek columns and dotted satellite map references).
  - Tables, statements, and amortization schedules become a *feature* — they read like clean
    terminal output.
- **Color & theme**: **Mostly black & white.** Base is near-black bg with white/grey data and
  dashed hairlines (light mode = ink-on-paper peer). **Color is semantic, not decorative**, and
  used boldly: **bold neon green = profit / positive / on-track**, **bold red = debt / negative /
  going-down**; everything else stays white/neutral. Do *not* pull the multi-color palettes from
  the reference screenshots — keep it monochrome + green/red, with at most **one optional
  user-switchable accent tone** (e.g. phosphor green or amber). The token system must therefore
  be **themeable from day one** (CSS variables: dark/light × accent tone), not hardcoded.
- **Tone register**: **Calm & monochrome by default; full-tactical only when warranted.** The HUD
  shell (brackets, gauges, logs, dashed frames) is always present, but it stays quiet day-to-day.
  Genuine warnings — overdraft, missed/late debt payment, big overspend — earn the dramatic
  treatment: bold red, urgent/animated, "alert" energy. Drama is reserved for moments that
  deserve it, so it still means something. Typography stays **restrained, not oversized** (no
  giant 247PLUS wordmarks) — *but* the hero financial figures carry **weight + semantic color**.
- **Motion & ASCII (the dopamine layer)**: ASCII is **not** big decorative art in the chrome —
  it lives in **small micro-moments**: marking something done, moving/reordering an item,
  **loading screens & empty states** (dotted/pointillist ASCII animations/spinners), a wishlist
  item crossing into "affordable," and ASCII-flavored transitions (numbers ticking, dotted lines
  drawing, tiny ASCII↔HD morphs). Minimal visual rewards that "feed the brain dopamine" without
  clutter. Everything else stays calm and still. Respects `prefers-reduced-motion`.
- **Reference points**: the user's HUD/terminal references — a tactical "control interface"
  dashboard (bracketed panels, mission tables, `> [timestamp]` activity logs, segmented gauges);
  a satellite-telemetry HUD (wireframe + leader-line labels, thin charts, phosphor green); a
  dark login with **ASCII/pointillist column art**; a black-&-white cyber-security dashboard
  (bracketed frames, `RECORDS 35.51m`, `//`-separated labels, radar chart). Plus Aino Agency
  (hairline grids, mono labels, ASCII motifs), Linear (calm restraint), and real cmd/linux
  terminals as the core metaphor.
- **Anti-references**: Mint (cluttered, ad-heavy, overwhelming); typical bank apps (boxy,
  shadowed, generic blue); gamified neobanks with confetti and vivid multi-color gradients;
  glassmorphism, heavy drop-shadows, rounded pastel "cards floating in space"; oversized loud
  wordmarks; and pulling lots of decorative colors from the HUD refs. Dopamine here is
  *structural and earned* (terminal micro-feedback), not loud.

## Existing Patterns

Empty repository — greenfield. No tokens, components, or conventions to honor yet.
This brief and the tokens phase establish the vocabulary from scratch.

- Typography: _none yet_ → plan: a monospace for ALL data (numbers, labels, table headers,
  nav, command bar) + a clean grotesque sans for prose/descriptions (the Terminal Ledger split).
- Colors: _none yet_ → plan: **mostly black & white** (near-black dark default + light ink-on-
  paper peer), color used **semantically not decoratively** — bold neon green = profit/positive,
  bold red = debt/negative, white/grey = neutral data; at most one optional switchable accent
  tone. Themeable via CSS variables (dark/light × tone). Never rely on hue alone (sign + label too).
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
- **Feedback character**: State changes use quick, precise motion plus tiny **ASCII micro-
  moments** — marking done, reordering, loading/empty states, an item crossing into
  "affordable" (dotted lines drawing, numbers ticking, small ASCII↔HD morphs). Instrument-
  like and rewarding, never bouncy/confetti. Respects `prefers-reduced-motion`.

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

## Platform Support

Target platforms: **Windows, macOS, Android, and iOS** — one installable PWA across all four.
Known iOS/Safari PWA caveats to design around (they affect specific features):

- **Install**: iOS has no `beforeinstallprompt` — installation is a manual "Add to Home Screen"
  via the Share sheet. Provide a one-time, dismissible instructional nudge for iOS users;
  Android/desktop use the native install prompt.
- **Share-target**: the Web Share Target API (share a link straight into the wishlist) works on
  Android + desktop but **not iOS Safari**. iOS fallback: paste-from-clipboard in the command
  bar / quick-add sheet — same outcome, different entry point.
- **Notifications**: web push works on iOS only for an *installed* PWA on **iOS 16.4+**. Reminder
  features are gated/progressive-enhanced accordingly.
- **Storage**: Safari may evict IndexedDB under storage pressure → request `navigator.storage.persist()`.
- **Layout**: honor `env(safe-area-inset-*)` for the notch/home indicator; touch targets ≥44px.
- The `Cmd/Ctrl-K` command palette is a desktop affordance (physical keyboard); on mobile the
  same actions live behind the center "+". No feature is iOS-exclusive or iOS-excluded beyond the above.

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
