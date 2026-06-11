/**
 * Domain model for WalletCry. All entities carry a stable local `id` (string)
 * so a future sync/cloud adapter can map them to remote records.
 *
 * Money is stored as a plain number in **major currency units** (e.g. 12.50 PLN).
 * Multi-currency-ready via the per-entity `currency` field; PLN is the base.
 * The finance calc engine (separate task) owns rounding/precision concerns.
 */

export type CurrencyCode = 'PLN' | 'EUR' | 'USD' | 'GBP'

/** A money amount in major units of its entity's `currency`. */
export type Money = number

/** ISO date string, `YYYY-MM-DD`. Stored as text so it sorts lexically. */
export type IsoDate = string

/** How a category participates in the "Left this month" calculation. */
export type CategoryKind = 'essential' | 'discretionary' | 'income'

export interface Category {
  id: string
  /** Human label, e.g. "Groceries". */
  name: string
  /** Mono HUD code, e.g. "GROCERIES" / "RENT". */
  code: string
  kind: CategoryKind
  /** lucide-react icon name; resolved at render time. */
  icon: string
  /** True for the catch-all bucket new imports fall into. */
  isDefault?: boolean
}

/**
 * A learned merchant rule. When a transaction's merchant matches, it is
 * auto-assigned `categoryId`. Created via the "apply to all matching…" prompt.
 */
export interface MerchantRule {
  id: string
  /** Normalised merchant key the rule matches on (lowercased). */
  merchant: string
  categoryId: string
  createdAt: string
}

export interface Transaction {
  id: string
  date: IsoDate
  /** Full description as it appeared on the statement. */
  description: string
  /** Normalised merchant name used for grouping/rules, e.g. "Biedronka". */
  merchant: string
  /** Signed: negative = money out (spend), positive = money in (income). */
  amount: Money
  currency: CurrencyCode
  categoryId: string
  /** Source account label (from import), e.g. "mBank ••1234". */
  account: string
  /** True when detected as part of a recurring bill. */
  recurring?: boolean
  /** Groups rows that arrived in the same import (for dedupe/undo). */
  importBatchId?: string
  createdAt: string
}

export interface Debt {
  id: string
  name: string
  /** Current outstanding balance owed. */
  balance: Money
  /** Annual percentage rate, e.g. 0.1899 for 18.99%. */
  apr: number
  /** Minimum monthly payment. */
  minPayment: Money
  currency: CurrencyCode
  /** When the debt was opened/originated (for amortization context). */
  openedAt?: IsoDate
  createdAt: string
}

export type IncomeKind = 'fixed' | 'variable'

export interface IncomeSource {
  id: string
  name: string
  /** Expected monthly amount (an estimate for `variable`). */
  amount: Money
  kind: IncomeKind
  currency: CurrencyCode
  createdAt: string
}

export type WishlistTier = 'need' | 'want' | 'dream'
export type WishlistStatus = 'pending' | 'confirmed'

export interface WishlistItem {
  id: string
  name: string
  price: Money
  currency: CurrencyCode
  tier: WishlistTier
  status: WishlistStatus
  /** Source URL when added via paste-a-link. */
  url?: string
  imageUrl?: string
  createdAt: string
}
