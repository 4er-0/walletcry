/**
 * PLN mock dataset. `buildSeedData()` is a pure function (no IndexedDB) so it
 * can be unit-tested and reused; `seedDatabase()` writes the result through the
 * repository seam. Generation is deterministic (fixed PRNG seed) so reloads and
 * tests see a stable dataset.
 */

import type { DataStore } from './repository'
import type {
  Category,
  Debt,
  IncomeSource,
  MerchantRule,
  Transaction,
  WishlistItem,
} from './types'

export interface SeedData {
  categories: Category[]
  rules: MerchantRule[]
  income: IncomeSource[]
  debts: Debt[]
  wishlist: WishlistItem[]
  transactions: Transaction[]
}

/** Deterministic PRNG (mulberry32) so the mock dataset is reproducible. */
function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const ISO = 'PLN' as const

function isoDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

// ── Static reference data ──────────────────────────────────────────────────

const CATEGORIES: Category[] = [
  { id: 'cat_income', name: 'Income', code: 'INCOME', kind: 'income', icon: 'TrendingUp' },
  { id: 'cat_rent', name: 'Rent', code: 'RENT', kind: 'essential', icon: 'Home' },
  { id: 'cat_groceries', name: 'Groceries', code: 'GROCERIES', kind: 'essential', icon: 'ShoppingCart' },
  { id: 'cat_utilities', name: 'Utilities', code: 'UTILITIES', kind: 'essential', icon: 'Zap' },
  { id: 'cat_transport', name: 'Transport', code: 'TRANSPORT', kind: 'essential', icon: 'Car' },
  { id: 'cat_health', name: 'Health', code: 'HEALTH', kind: 'essential', icon: 'HeartPulse' },
  { id: 'cat_dining', name: 'Dining', code: 'DINING', kind: 'discretionary', icon: 'Utensils' },
  { id: 'cat_shopping', name: 'Shopping', code: 'SHOPPING', kind: 'discretionary', icon: 'ShoppingBag' },
  { id: 'cat_entertainment', name: 'Entertainment', code: 'ENTERTAINMENT', kind: 'discretionary', icon: 'Gamepad2' },
  { id: 'cat_subscriptions', name: 'Subscriptions', code: 'SUBSCRIPTIONS', kind: 'discretionary', icon: 'Repeat' },
  { id: 'cat_uncategorized', name: 'Uncategorized', code: 'UNCATEGORIZED', kind: 'discretionary', icon: 'CircleHelp', isDefault: true },
]

/** Merchant → category, with a typical [min, max] spend range (PLN). */
interface MerchantSpec {
  merchant: string
  categoryId: string
  min: number
  max: number
}

const GROCERIES: MerchantSpec[] = [
  { merchant: 'Biedronka', categoryId: 'cat_groceries', min: 22, max: 190 },
  { merchant: 'Lidl', categoryId: 'cat_groceries', min: 28, max: 210 },
  { merchant: 'Żabka', categoryId: 'cat_groceries', min: 8, max: 55 },
  { merchant: 'Carrefour', categoryId: 'cat_groceries', min: 35, max: 240 },
  { merchant: 'Auchan', categoryId: 'cat_groceries', min: 45, max: 320 },
]

const DINING: MerchantSpec[] = [
  { merchant: 'Pyszne.pl', categoryId: 'cat_dining', min: 32, max: 110 },
  { merchant: 'McDonald’s', categoryId: 'cat_dining', min: 18, max: 58 },
  { merchant: 'Starbucks', categoryId: 'cat_dining', min: 16, max: 42 },
  { merchant: 'Sushi Kushi', categoryId: 'cat_dining', min: 60, max: 180 },
]

const TRANSPORT_SMALL: MerchantSpec[] = [
  { merchant: 'Uber', categoryId: 'cat_transport', min: 12, max: 48 },
  { merchant: 'Bolt', categoryId: 'cat_transport', min: 10, max: 44 },
]

const SHOPPING: MerchantSpec[] = [
  { merchant: 'Allegro', categoryId: 'cat_shopping', min: 35, max: 650 },
  { merchant: 'Rossmann', categoryId: 'cat_shopping', min: 25, max: 180 },
  { merchant: 'Empik', categoryId: 'cat_shopping', min: 30, max: 150 },
  { merchant: 'Zara', categoryId: 'cat_shopping', min: 80, max: 420 },
  { merchant: 'IKEA', categoryId: 'cat_shopping', min: 60, max: 900 },
]

const ENTERTAINMENT: MerchantSpec[] = [
  { merchant: 'Cinema City', categoryId: 'cat_entertainment', min: 30, max: 90 },
  { merchant: 'Steam', categoryId: 'cat_entertainment', min: 25, max: 250 },
]

/** Recurring monthly bills, charged on a fixed day-of-month. */
interface RecurringSpec {
  merchant: string
  description: string
  categoryId: string
  amount: number
  day: number
}

const RECURRING: RecurringSpec[] = [
  { merchant: 'Wynajem', description: 'Czynsz — najem mieszkania', categoryId: 'cat_rent', amount: 2800, day: 1 },
  { merchant: 'Spotify', description: 'Spotify Premium', categoryId: 'cat_subscriptions', amount: 23.99, day: 5 },
  { merchant: 'Zdrofit', description: 'Karnet Zdrofit', categoryId: 'cat_health', amount: 129, day: 8 },
  { merchant: 'Netflix', description: 'Netflix Standard', categoryId: 'cat_subscriptions', amount: 43, day: 12 },
  { merchant: 'Orange', description: 'Orange — abonament', categoryId: 'cat_utilities', amount: 55, day: 18 },
  { merchant: 'Tauron', description: 'Tauron — energia', categoryId: 'cat_utilities', amount: 198, day: 22 },
]

const ACCOUNT = 'mBank ••4417'

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}

function spend(rng: () => number, spec: MerchantSpec): number {
  return round2(spec.min + rng() * (spec.max - spec.min))
}

/**
 * Build the full mock dataset. `today` is injectable for deterministic tests;
 * `days` controls how far back transactions are generated.
 */
export function buildSeedData(today: Date = new Date(), days = 90): SeedData {
  const rng = mulberry32(0x9e3779b1) // fixed seed → reproducible dataset
  const transactions: Transaction[] = []
  let n = 0

  const txn = (
    date: string,
    m: { merchant: string; categoryId: string; description?: string },
    amount: number,
    recurring = false,
  ): void => {
    const description = m.description ?? m.merchant
    transactions.push({
      id: `txn_${String(n++).padStart(4, '0')}`,
      date,
      description,
      merchant: m.merchant,
      amount,
      currency: ISO,
      categoryId: m.categoryId,
      account: ACCOUNT,
      recurring,
      importBatchId: 'seed',
      createdAt: `${date}T08:00:00.000Z`,
    })
  }

  const start = new Date(today)
  start.setDate(start.getDate() - days)

  for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
    const date = isoDate(d)
    const dom = d.getDate()
    const dow = d.getDay()

    // Salary on the 10th.
    if (dom === 10) {
      txn(date, { merchant: 'Wynagrodzenie', description: 'Wynagrodzenie — Pracodawca Sp. z o.o.', categoryId: 'cat_income' }, 8500)
    }
    // Occasional freelance income.
    if (dom === 24 && rng() < 0.6) {
      txn(date, { merchant: 'Freelance', description: 'Faktura — projekt freelance', categoryId: 'cat_income' }, round2(900 + rng() * 1800))
    }
    // Recurring bills.
    for (const r of RECURRING) {
      if (dom === r.day) txn(date, r, -r.amount, true)
    }
    // Groceries — most days.
    if (rng() < 0.5) {
      const g = pick(rng, GROCERIES)
      txn(date, g, -spend(rng, g))
    }
    // Dining — fairly often.
    if (rng() < 0.3) {
      const di = pick(rng, DINING)
      txn(date, di, -spend(rng, di))
    }
    // Small rides.
    if (rng() < 0.2) {
      const tr = pick(rng, TRANSPORT_SMALL)
      txn(date, tr, -spend(rng, tr))
    }
    // Weekend fuel.
    if (dow === 6 && rng() < 0.7) {
      const orlen: MerchantSpec = { merchant: 'Orlen', categoryId: 'cat_transport', min: 160, max: 330 }
      txn(date, orlen, -spend(rng, orlen))
    }
    // Occasional shopping.
    if (rng() < 0.12) {
      const s = pick(rng, SHOPPING)
      txn(date, s, -spend(rng, s))
    }
    // Occasional entertainment.
    if (rng() < 0.1) {
      const e = pick(rng, ENTERTAINMENT)
      txn(date, e, -spend(rng, e))
    }
  }

  const rules: MerchantRule[] = [
    { id: 'rule_biedronka', merchant: 'biedronka', categoryId: 'cat_groceries', createdAt: isoDate(today) },
    { id: 'rule_orlen', merchant: 'orlen', categoryId: 'cat_transport', createdAt: isoDate(today) },
    { id: 'rule_netflix', merchant: 'netflix', categoryId: 'cat_subscriptions', createdAt: isoDate(today) },
  ]

  const income: IncomeSource[] = [
    { id: 'inc_salary', name: 'Salary — Pracodawca', amount: 8500, kind: 'fixed', currency: ISO, createdAt: isoDate(today) },
    { id: 'inc_freelance', name: 'Freelance projects', amount: 1400, kind: 'variable', currency: ISO, createdAt: isoDate(today) },
  ]

  const debts: Debt[] = [
    { id: 'debt_card', name: 'Karta kredytowa mBank', balance: 6850, apr: 0.1899, minPayment: 350, currency: ISO, openedAt: '2024-03-01', createdAt: isoDate(today) },
    { id: 'debt_consumer', name: 'Kredyt gotówkowy', balance: 18400, apr: 0.0989, minPayment: 620, currency: ISO, openedAt: '2023-09-15', createdAt: isoDate(today) },
    { id: 'debt_phone', name: 'Ratalny — iPhone', balance: 2340, apr: 0, minPayment: 195, currency: ISO, openedAt: '2025-01-10', createdAt: isoDate(today) },
  ]

  const wishlist: WishlistItem[] = [
    { id: 'wish_chair', name: 'Herman Miller Aeron', price: 6200, currency: ISO, tier: 'dream', status: 'confirmed', createdAt: isoDate(today) },
    { id: 'wish_monitor', name: 'Dell UltraSharp 4K 32"', price: 3400, currency: ISO, tier: 'want', status: 'confirmed', createdAt: isoDate(today) },
    { id: 'wish_keyboard', name: 'Keychron Q1 Pro', price: 890, currency: ISO, tier: 'want', status: 'confirmed', createdAt: isoDate(today) },
    { id: 'wish_winter', name: 'Winter coat', price: 650, currency: ISO, tier: 'need', status: 'confirmed', createdAt: isoDate(today) },
  ]

  return { categories: CATEGORIES, rules, income, debts, wishlist, transactions }
}

/** Write the mock dataset through the store. Caller guards against re-seeding. */
export async function seedDatabase(store: DataStore, today: Date = new Date()): Promise<void> {
  const data = buildSeedData(today)
  await store.categories.putMany(data.categories)
  await store.rules.putMany(data.rules)
  await store.income.putMany(data.income)
  await store.debts.putMany(data.debts)
  await store.wishlist.putMany(data.wishlist)
  await store.transactions.putMany(data.transactions)
}
