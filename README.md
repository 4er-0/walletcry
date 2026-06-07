# WalletCry

A local-first, installable PWA for personal finance — **spending, debts, income,
and a "when can I afford it" wishlist** — designed to be genuinely usable for an
ADHD brain: low-friction entry, calm one-answer-per-screen views, and progress as
the reward.

## Status

🌱 **Greenfield / design phase.** No application code yet. The current work lives in
[`.design/walletcry/`](.design/walletcry/) — design brief, and (incoming) information
architecture, design tokens, and a build task list produced via the design-flow process.

## Vision

- **CSV-first entry** — import a bank statement, auto-categorize, detect recurring
  bills, dedupe re-imports. (Later: live EU/PSD2 open-banking feed — scaffolded only.)
- **Full-amortization debt tracking** — payoff timelines, extra-payment modeling,
  total interest.
- **Multiple income sources**, base currency **PLN**, multi-currency-ready.
- **Wishlist** with Need / Want / Dream tiers — paste a link → pending item, see
  "affordable in N months", and compare **save-up vs. finance** (incl. BNPL).
- **Local-first** (IndexedDB, offline) with a clean data-layer seam for future
  Google sign-in + cross-device sync.

## Aesthetic

**"Terminal Ledger / Tactical HUD"** — a CLI/terminal + command-center personality fused with
Aino's Swiss hairline grid. Bracketed corner frames, dashed/dotted borders, segmented gauges,
`> [timestamp]` log feeds, and `//`/`_` machine-readable labels. Mostly **black & white**:
color is semantic only — bold neon green = profit, bold red = debt/danger. Dark-first with a
light mode and a switchable accent tone. Monospace for all data + clean sans for prose; calm by
default, full-tactical only for genuine warnings. Dotted/pointillist ASCII for hero/empty/login
art, plus tiny ASCII dopamine micro-moments on state changes. Ordered density, not clutter.

## Tech (planned)

PWA built with a React + Vite + Tailwind stack, local-first data, installable on mobile.

---

_Built with the `/design-flow` workflow. See [`.design/walletcry/`](.design/walletcry/) for the full design record._
