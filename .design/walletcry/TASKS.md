# Build Tasks: WalletCry

Generated from: `.design/walletcry/DESIGN_BRIEF.md` (+ `INFORMATION_ARCHITECTURE.md`, `DESIGN_TOKENS.css`)
Date: 2026-06-07

Stack: **React + Vite + TypeScript + Tailwind v4 + vite-plugin-pwa**, local-first (IndexedDB).
Every task is a vertical slice (structure + style + interaction) built on **mock data** and the
"Terminal Ledger / Tactical HUD" tokens. Repo is greenfield — only the first task scaffolds.

## Foundation

- [x] **App shell + PWA scaffold + aesthetic baseline**: Scaffold Vite/React/TS/Tailwind/PWA;
  wire `DESIGN_TOKENS.css` + self-hosted JetBrains Mono & Inter; build the responsive shell —
  desktop HUD **icon-rail sidebar** + top status bar, mobile **bottom tab bar with center "+"**,
  safe-area insets — and the **theme (dark/light) + tone (green/amber/cyan/mono) switcher**.
  Add the router with placeholder routes for all IA sections. _Done:_ app installs as a PWA,
  navigates between empty routes, and **visibly establishes the Terminal Ledger / Tactical HUD
  look** (bracket frames, dashed borders, mono labels) so the aesthetic is validated before
  detail work. _New (establishes philosophy). Reuses: DESIGN_TOKENS.css._

- [x] **Local-first data layer + mock dataset**: IndexedDB store (Dexie) behind a **repository
  interface seam** (so a sync/cloud adapter can drop in later) for transactions, categories &
  rules, debts, income sources, and wishlist items. Request `navigator.storage.persist()`. Seed a
  realistic **PLN mock dataset** so every screen has data. _Done:_ repos read/write IndexedDB,
  seed loads on first run, data survives reload. _New (architectural seam per brief)._

- [x] **Finance calculation engine (pure + unit-tested)**: Pure TS functions powering the math:
  monthly **surplus / "Left this month"** (income − essentials − spend), **full amortization**
  schedule + extra-payment recompute, **snowball/avalanche** ordering, wishlist **affordability**
  (months-to-afford from surplus), and **financing** (save-up vs finance, BNPL: APR + term →
  monthly + total interest). Multi-currency-aware formatting (PLN base). _Done:_ unit tests cover
  edge cases (zero/variable income, 0% APR, already-affordable). _Risk-first — build before
  screens consume it. New._

- [x] **HUD component kit**: The shared vocabulary — **bracketed panel**, **stat/number block**
  (mono figure + delta + semantic color), **segmented gauge**, **progress/affordability bar**,
  **category chip + picker**, **activity log feed** (`> [HH:MM:SS]`), and **empty/ASCII state**.
  Each themeable via tokens, in a Storybook-style demo route. _Done:_ all render in dark+light ×
  tones and match the brief's primitives. _New. Reuses: tokens._

- [x] **Hairline data table**: Dense, sortable bordered table that **collapses to stacked
  key/value rows on mobile**; used by Transactions, amortization, and import preview. _Done:_
  sortable headers, tabular mono numbers, responsive collapse, keyboard-navigable, proper
  `<th scope>` semantics. _New (split from kit for complexity). Depends on: HUD component kit._

## Core UI

- [x] **Home / Dashboard**: The 80% view "boot-up readout" — **"Left this month"** hero, cashflow
  gauge, **alerts (only when present)**, debts summary (nearest payoff date), closest wishlist
  item, and recent-activity log. _Done:_ matches IA content hierarchy on mock data; reads calm and
  glanceable. _Visual-priority — build first among screens. Depends on: kit, table, calc engine,
  data layer._
  _Shipped 2026-06-11 incl. trend mini-charts (net position 30d, spend/day 14d), an
  essentials/discretionary split, and a static boot skeleton. Alerts limited to overspend —
  overdraft/missed-payment need account-balance + due-date data the model doesn't have yet
  (see "Tactical warning/alert states")._

- [x] **Transactions**: Ledger using the hairline table — filter/search bar (`?q/category/from/to`),
  signed mono amounts, **inline recategorize** with "apply to all matching <merchant>?" rule-
  learning, and a surfaced "recurring bills detected" rail. _Done:_ filter via URL params,
  recategorize persists + learns a rule. _Depends on: table, category chip, data layer._

- [ ] **CSV import wizard** (`/transactions/import`): Drop/select → detect delimiter+columns →
  **map columns (remembered per bank fingerprint)** → preview with auto-categorization, **dedup**
  of overlapping rows, and **recurring detection** → confirm with ASCII progress. _Done:_ a sample
  bank CSV imports correctly, re-import dedupes, mapping is reused next time. _Risk (parsing/dedup).
  Depends on: table, calc/categorize, data layer._

- [x] **Debts**: List + combined position (total owed, aggregate payoff, total interest); detail
  (`/debts/:id`) with **amortization schedule** + **extra-payment slider** that live-recomputes
  payoff date/interest (numbers tick), plus **snowball vs avalanche** compare. _Done:_ slider
  updates schedule in real time and the payoff date visibly moves. _Depends on: calc engine, table,
  gauge._

- [x] **Wishlist**: **Need/Want/Dream** tier groups; item cards with **affordability bar +
  "affordable in N months"**; **add-via-link** (paste URL → mock fetch-proxy → pending item →
  assign tier → confirm); detail with the **financing calculator** (save-up vs finance, BNPL,
  impact on other goals). _Done:_ paste-link creates a pending→confirmed item; calculator compares
  options correctly. _Depends on: calc engine, kit, data layer. Note: proxy is mocked (per brief)._

- [ ] **Settings**: Income sources (multiple streams, fixed+variable), categories & merchant
  rules, currency & formatting, appearance (theme/tone — reuses shell switcher), and data (CSV
  mappings list, export, **scaffolded sync + bank-link entry points**, disabled/"coming soon").
  _Done:_ editing income/categories updates calculations; scaffold stubs present. _Depends on:
  data layer, calc engine._

- [ ] **Command palette + mobile quick-add**: `Cmd/Ctrl-K` terminal-style palette — fuzzy-jump to
  any screen + run actions (add expense, paste link, import, add debt, toggle theme). Mobile
  **center "+"** opens a quick-add sheet (add expense / paste link / import) and is the **PWA
  share-target** landing (Android/desktop; iOS uses clipboard paste). _Done:_ palette navigates +
  executes by keyboard; "+" sheet works; shared links route to wishlist paste. _Depends on: routes,
  wishlist, import._

## Interactions & States

- [ ] **Onboarding + empty states**: First-run `/onboarding` (ASCII hero, "import to begin" /
  "explore with sample data"); per-view empty states with dotted/pointillist ASCII + one CTA.
  _Done:_ first run guides to first import; empties never feel like dead ends. _Depends on: shell,
  import. Covers: first-run, empty._

- [ ] **ASCII dopamine micro-moments + motion**: Number-tick on value changes, done/reorder
  feedback, dotted/pointillist **loading spinners**, and a wishlist **"now affordable"**
  celebration — minimal, instrument-like, honoring `prefers-reduced-motion`. _Done:_ each moment
  fires correctly and has a static reduced-motion fallback. _Depends on: kit, wishlist, debts.
  Covers: loading, success, transition._

- [ ] **Tactical warning/alert states**: Calm by default; **full-tactical red** treatment only for
  genuine triggers — overdraft, missed/late debt payment, big overspend — on Home alerts and
  inline. _Done:_ alerts appear only when conditions are met and read as urgent-but-earned.
  _Depends on: calc engine, Home. Covers: warning, error, danger._

- [ ] **PWA offline + install**: Service-worker offline shell, **install prompt** (Android/desktop)
  + a one-time **iOS "Add to Home Screen" nudge**, and persisted storage. _Done:_ app loads
  offline, installs on each platform, data persists. _Depends on: shell. Covers: offline, install._

## Responsive & Polish

- [ ] **Responsive pass**: Verify 50/50 phone+desktop — detail views as **drawers on desktop /
  full-screen routes on mobile**, table collapse, sidebar⇄tab-bar, safe-areas. _Done:_ every screen
  correct at 375 / 768 / 1024 / 1280. _Breakpoints: sm/md/lg/xl._

- [ ] **Accessibility pass**: AA contrast (incl. visible dashed hairlines + neon green/red),
  full keyboard nav + visible focus rings, table header semantics, labeled import/form fields,
  semantics never by hue alone (sign+label too), `prefers-reduced-motion`. _Done:_ keyboard-only
  walkthrough of all flows passes; axe checks clean. _Specific checks from brief's a11y section._

## Review

- [ ] **Design review**: Run `/design-review` against the brief.
