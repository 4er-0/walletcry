# Information Architecture: WalletCry

> Structural skeleton for the WalletCry PWA. Sits between `DESIGN_BRIEF.md` and the
> build. Greenfield — no existing routing to honor. Navigation is intentionally shallow
> (max 2 levels) because "easy to move around" is the #1 product mandate.

## Site Map

```
- Home / Dashboard                      /
- Transactions                          /transactions
  - Import wizard (flow, modal route)   /transactions/import
  - Transaction detail (drawer)         /transactions/:id
- Debts                                 /debts
  - Debt detail + amortization          /debts/:id
  - Add / edit debt                     /debts/new · /debts/:id/edit
- Wishlist                              /wishlist
  - Item detail + financing calculator  /wishlist/:id
  - Add item (incl. paste-a-link)       /wishlist/new
- Settings                              /settings
  - Income sources                      /settings/income
  - Categories & rules                  /settings/categories
  - Currency & formatting               /settings/currency
  - Appearance (theme / tone)           /settings/appearance
  - Data (CSV mappings · export · sync/bank scaffold)  /settings/data
- Onboarding (first run only)           /onboarding
- Command palette (overlay, no URL)     Cmd/Ctrl-K — global
```

Everything reachable in ≤2 taps from a primary tab. Detail views open as **drawers/panels**
on desktop (keep context) and **full-screen routes** on mobile.

## Navigation Model

- **Primary navigation (4 core):** Home · Transactions · Debts · Wishlist.
  - **Desktop:** persistent **left icon-rail sidebar** (icon + label), HUD-style with a
    bracketed active indicator. Top bar shows sync/import status, currency, a `⌘K` hint, and
    the theme/tone toggle.
  - **Mobile:** **bottom tab bar** with a prominent **center "+" quick-add** →
    `[ Home · Transactions · (+) · Debts · Wishlist ]`. 44px+ targets.
- **Secondary navigation:** within Settings (left sub-list on desktop, stacked list on mobile);
  within Debts/Wishlist, detail opens contextually. Transactions uses an inline filter/search
  bar, not sub-nav.
- **Utility navigation:** Settings (gear/avatar in the top bar on desktop; reached via the
  command palette or a header entry on mobile — deliberately NOT a primary tab, it's set-once).
  Sync/account status indicator lives in the top bar.
- **Command palette (`Cmd/Ctrl-K`):** the power surface and the terminal signature. Fuzzy-jump
  to any screen + run actions: *add transaction, paste wishlist link, import CSV, add debt,
  toggle theme, quick affordability check*. On mobile it is reachable from the center "+".
- **Quick-add ("+"):** opens a sheet with three entries — **Add expense · Paste wishlist link ·
  Import CSV**. Also the **share-target** landing when a link is shared into the installed PWA.

## Content Hierarchy

### Home / Dashboard (the 80% view — a calm "boot-up readout")
1. **"Left this month" / safe-to-spend** — the single biggest number (income − essentials −
   spent so far). The one thing you came to see. Bold, mono, semantic color.
2. **Cashflow strip** — money in vs out this month as a segmented HUD gauge. One-glance health.
3. **Alerts** — *only render if present*: overdraft, missed/late debt payment, big overspend.
   Full-tactical red treatment. Absent (and silent) when all is well.
4. **Debts summary** — total owed + the nearest payoff date (the number that moves = dopamine).
5. **Wishlist — closest item** — the item you're nearest affording, with its progress bar +
   "affordable in N months."
6. **Recent activity** — last imports/edits as a `> [HH:MM:SS]` terminal log feed.

### Transactions (the ledger)
1. **Filter/search bar** — query, category, date range, account. Persistent, mono.
2. **Transaction table** — date · description · category chip · signed amount. Hairline rows,
   tabular mono numbers; inline quick-recategorize.
3. **Import + recurring** — entry to the import wizard; a surfaced "recurring bills detected" rail.

### Debts
1. **Combined position** — total debt + aggregate payoff timeline + total interest.
2. **Debt cards** — per debt: balance, APR, min payment, payoff date, strategy tag.
3. **Detail** (`/debts/:id`): amortization schedule table + **extra-payment slider** (live payoff
   date/interest recalculation) + snowball/avalanche comparison.

### Wishlist
1. **Tier groups** — Need / Want / Dream sections (Needs weighted first in affordability).
2. **Item rows/cards** — name, price, **affordability bar + "affordable in N months."**
3. **Add via link** — paste a URL → pending item (proxy-fetched title/price/image) → confirm.
4. **Detail** (`/wishlist/:id`): **financing calculator** — save-up vs finance, BNPL breakdown,
   and impact on other goals/debt payoff.

### Settings
Set-once configuration: income sources (multiple streams, fixed + variable), categories & merchant
rules, currency & formatting, appearance (dark/light × accent tone), data (CSV column mappings per
bank, export, and the scaffolded sync/bank-link entry points).

## User Flows

### First run (onboarding)
1. User installs/opens the PWA → `/onboarding`.
2. Sees a one-screen, terminal-styled welcome (ASCII hero) explaining: *import a statement to begin*.
3. Action: **Import CSV** (primary) or **Skip & explore with sample data**.
   - If import → CSV wizard (below), then land on Home populated.
   - If skip → Home with empty states (ASCII "no data yet") + a persistent "Import" nudge.
4. Optional: set up income sources (can be deferred; affordability shows "set income to estimate").

### CSV import
1. From Transactions, quick-add "+", command palette, or onboarding → `/transactions/import`.
2. **Drop/select file** → app detects delimiter + columns.
3. **Map columns** (Date / Amount / Description / [optional] account, balance) — *remembered per
   bank fingerprint*, so step is skipped on future imports from the same bank.
4. **Preview** — table with auto-categorization applied, duplicates flagged, recurring charges
   surfaced as suggested bills.
   - If overlap with existing data → silently dedupe, show count skipped.
   - If unknown merchants → leave "Uncategorized," learnable later.
5. **Confirm** → import runs (ASCII progress) → land on Transactions with new rows + a log entry.

### Recategorize a transaction
1. On Transactions, tap a row's **category chip**.
2. Quick picker (searchable, mono).
3. Choose category → app offers **"apply to all matching <merchant> going forward?"**
   - If yes → saves a rule (silent learning), recategorizes matching rows.
   - If no → changes just this one.

### Add wishlist item via link
1. Paste a URL (command palette, quick-add, Wishlist "+", or **share-target** from another app).
2. App calls the fetch-proxy → bottom sheet shows **pending** item (title, price, image).
3. User assigns **Need / Want / Dream** + confirms (edit price/name if needed).
4. Item joins the list with a live affordability bar; "affordable in N months" computes from surplus.

### Debt payoff exploration
1. Debts → open a debt (`/debts/:id`).
2. See amortization schedule + current payoff date/total interest.
3. Drag the **extra-payment slider** → payoff date and interest **recalc live** (numbers tick,
   date moves closer = the honest dopamine).
4. Optionally compare **snowball vs avalanche** across all debts.

### Command palette (any screen)
1. `Cmd/Ctrl-K` (or mobile "+") → palette opens.
2. Type → fuzzy results across **navigation** (go to any screen) and **actions** (add expense,
   paste link, import, add debt, toggle theme).
3. Enter → executes/navigates. Pure-keyboard, terminal-feel.

## Naming Conventions

| Concept | Label in UI | Notes |
|---|---|---|
| A single money movement | **Transaction** | Not "entry"/"record". |
| Spending bucket | **Category** | Auto-assigned, user-correctable. |
| Auto-detected repeating charge | **Recurring bill** | Surfaced from import. |
| Income − essentials − spend | **Left this month** | The hero safe-to-spend figure; concept = "surplus." |
| Money owed | **Debt** | Per-debt; aggregate = "Total owed." |
| Date a debt hits zero | **Payoff date** | The motivating number; "free by." |
| Wishlist tiers | **Need / Want / Dream** | Fixed three; Needs weighted in affordability. |
| Time until affordable | **Affordable in N months** | Derived from surplus. |
| A source of income | **Income source** | Multiple, fixed or variable. |
| Bringing in a statement | **Import** | The CSV flow; later "Connect bank." |
| Keyboard action surface | **Command bar** | `⌘K`; terminal palette. |
| Base currency | **PLN** (default) | Multi-currency-ready; "Currency" in settings. |

## Component Reuse Map

| Component | Used on | Behavior differences |
|---|---|---|
| App shell (sidebar ⇄ bottom-tab) | All routes | Sidebar on desktop; bottom tab + center "+" on mobile. |
| Top status bar | All (desktop), header (mobile) | Sync/import status, currency, `⌘K`, theme toggle. |
| Bracketed HUD panel | Home, Debts, Wishlist, Settings | Corner-frame container; title in mono `//` label style. |
| Stat / number block | Home, Debts, Wishlist, Transactions | Mono figure + delta + semantic color; size varies by prominence. |
| Hairline data table | Transactions, amortization, import preview | Dense, sortable; mobile collapses to stacked key/value rows. |
| Category chip / picker | Transactions, import preview | Inline quick-edit + rule-learning prompt. |
| Segmented gauge | Home cashflow, debt progress, affordability | Ticked bar; color by semantic state. |
| Progress / affordability bar | Wishlist, Home "closest item" | Fills toward target; "affordable in N" caption. |
| Activity log feed | Home, import result | `> [HH:MM:SS]` mono lines. |
| Command palette | Global overlay | Same everywhere; mobile entry via "+". |
| Quick-add sheet | Mobile (+ button), share-target | Add expense / paste link / import. |
| Empty / ASCII state | Any data view pre-data | Dotted/pointillist ASCII + a single CTA. |

## Content Growth Plan

- **Transactions** grow unbounded → handled by **filter + search + date-range + pagination/virtual
  scroll**, plus an **archive by month** view. The ledger is the scaling concern.
- **Categories & rules** grow as merchants are learned → managed list in Settings with merge/edit.
- **Debts / Income sources / Wishlist** stay small (handfuls) → no pagination; simple lists.
- **Bank mappings** accumulate one-per-bank → list in Settings/Data.
- Future **Insights/Trends** can graduate to its own top-level section if analytics deepen
  (currently embedded as mini-charts on Home + per-section); the 4-tab model leaves room for a 5th.

## URL Strategy

- **Pattern:** flat, REST-ish, lowercase kebab-case — `/section`, `/section/:id`, `/section/new`,
  `/section/:id/edit`. Settings nests one level: `/settings/:area`.
- **Dynamic segments:** `:id` for transactions, debts, wishlist items (stable local IDs).
- **Query parameters (Transactions):** `?q=` search, `?category=`, `?from=&to=` date range,
  `?account=`, `?page=` / cursor. Filters are URL-encoded so a filtered ledger is shareable/bookmarkable.
- **Overlays without URLs:** command palette and quick-add sheet are ephemeral overlays (no route);
  the import wizard *does* get `/transactions/import` so it survives refresh mid-flow.
- **PWA share-target:** registered to route shared URLs into the wishlist paste flow.
