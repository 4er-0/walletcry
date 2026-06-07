/**
 * Amortization: turn a balance + APR + monthly payment into a full payoff
 * schedule. Interest accrues monthly on the rounded balance (cents), matching
 * how a lender computes it, so totals are reproducible.
 */

import { round2 } from './money'

export interface AmortizationRow {
  /** 1-based payment number. */
  month: number
  payment: number
  interest: number
  principal: number
  /** Remaining balance after this payment. */
  balance: number
}

export interface AmortizationResult {
  rows: AmortizationRow[]
  /** Number of payments to clear the debt (0 if already clear). */
  months: number
  totalInterest: number
  totalPaid: number
  /** Payment can't cover monthly interest → balance never reaches zero. */
  neverPaysOff: boolean
}

const EMPTY: AmortizationResult = {
  rows: [],
  months: 0,
  totalInterest: 0,
  totalPaid: 0,
  neverPaysOff: false,
}

/**
 * Build the amortization schedule for `balance` at annual `apr`, paying
 * `monthlyPayment` each month. Pass extra via the payment (min + extra).
 * Caps at `maxMonths` (default 1200 = 100y); hitting the cap means the
 * payment doesn't make progress → `neverPaysOff`.
 */
export function amortize(
  balance: number,
  apr: number,
  monthlyPayment: number,
  opts: { maxMonths?: number } = {},
): AmortizationResult {
  const maxMonths = opts.maxMonths ?? 1200
  let remaining = round2(balance)
  if (remaining <= 0) return EMPTY
  if (monthlyPayment <= 0) return { ...EMPTY, neverPaysOff: true }

  const monthlyRate = apr / 12
  // A payment that can't even cover the first month's interest never pays off.
  if (monthlyRate > 0 && monthlyPayment <= round2(remaining * monthlyRate)) {
    return { ...EMPTY, neverPaysOff: true }
  }

  const rows: AmortizationRow[] = []
  let totalInterest = 0
  let totalPaid = 0

  for (let month = 1; month <= maxMonths && remaining > 0; month++) {
    const interest = round2(remaining * monthlyRate)
    // Final payment only takes what's left (don't overpay).
    const payment = round2(Math.min(monthlyPayment, remaining + interest))
    const principal = round2(payment - interest)
    remaining = round2(remaining - principal)
    totalInterest = round2(totalInterest + interest)
    totalPaid = round2(totalPaid + payment)
    rows.push({ month, payment, interest, principal, balance: remaining })
  }

  if (remaining > 0) return { ...EMPTY, neverPaysOff: true }

  return {
    rows,
    months: rows.length,
    totalInterest,
    totalPaid,
    neverPaysOff: false,
  }
}

/** Add whole months to a date, returning a new Date (clamps overflow days). */
export function addMonths(start: Date, months: number): Date {
  const d = new Date(start)
  const targetMonth = d.getMonth() + months
  d.setDate(1)
  d.setMonth(targetMonth)
  return d
}
