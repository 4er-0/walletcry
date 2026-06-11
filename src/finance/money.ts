/**
 * Money helpers: precision-safe rounding and locale-aware currency/percent
 * formatting. PLN is the base currency; the formatters are multi-currency
 * aware so other currencies render with the right symbol/grouping.
 */

import type { CurrencyCode } from '@/data'

/** Round to 2 decimal places, nudging past float error (e.g. 1.005 → 1.01). */
export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100
}

const LOCALE: Record<CurrencyCode, string> = {
  PLN: 'pl-PL',
  EUR: 'de-DE',
  USD: 'en-US',
  GBP: 'en-GB',
}

export interface FormatMoneyOptions {
  /** Prefix non-negative values with `+` (for ledger deltas). */
  signed?: boolean
  /** Fraction digits (default 2). Use 0 for whole-PLN HUD figures. */
  decimals?: number
}

/** Format an amount as currency, e.g. `formatMoney(-43, 'PLN')` → `-43,00 zł`. */
export function formatMoney(
  amount: number,
  currency: CurrencyCode = 'PLN',
  opts: FormatMoneyOptions = {},
): string {
  const decimals = opts.decimals ?? 2
  const formatted = new Intl.NumberFormat(LOCALE[currency], {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount)
  return opts.signed && amount > 0 ? `+${formatted}` : formatted
}

/** Format an APR fraction (0.1899) as a percent string (`18,99%`). */
export function formatPercent(rate: number, decimals = 2): string {
  return new Intl.NumberFormat(LOCALE.PLN, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(rate)
}
