/**
 * Multi-debt payoff strategies. Both methods pay every debt's minimum each
 * month, then throw all spare budget at one target debt; when it clears, its
 * freed-up payment rolls into the next target (the "snowball" effect).
 *
 *   - snowball  → target the smallest balance first (fast wins, motivation)
 *   - avalanche → target the highest APR first (least total interest)
 */

import { round2 } from './money'

export type PayoffStrategy = 'snowball' | 'avalanche'

export interface DebtInput {
  id: string
  balance: number
  apr: number
  minPayment: number
}

export interface DebtPayoff {
  id: string
  /** Month index (1-based) this debt reached zero. */
  payoffMonth: number
  interestPaid: number
}

export interface StrategyResult {
  strategy: PayoffStrategy
  /** Months until every debt is clear. */
  months: number
  totalInterest: number
  totalPaid: number
  perDebt: DebtPayoff[]
  /** Budget didn't clear the debts within the cap (under-funded). */
  neverPaysOff: boolean
}

function orderDebts(debts: DebtInput[], strategy: PayoffStrategy): DebtInput[] {
  const sorted = [...debts]
  if (strategy === 'snowball') {
    sorted.sort((a, b) => a.balance - b.balance)
  } else {
    sorted.sort((a, b) => b.apr - a.apr)
  }
  return sorted
}

/**
 * Simulate paying down `debts` with `extraPerMonth` on top of the combined
 * minimums, using the given `strategy`. Returns months, interest, and the
 * payoff month per debt.
 */
export function simulatePayoff(
  debts: DebtInput[],
  extraPerMonth: number,
  strategy: PayoffStrategy,
  opts: { maxMonths?: number } = {},
): StrategyResult {
  const maxMonths = opts.maxMonths ?? 1200
  const order = orderDebts(debts, strategy)

  // Mutable per-debt state, kept in strategy order.
  const state = order.map((d) => ({
    id: d.id,
    balance: round2(d.balance),
    apr: d.apr,
    minPayment: d.minPayment,
    interestPaid: 0,
    payoffMonth: 0,
  }))

  const base: StrategyResult = {
    strategy,
    months: 0,
    totalInterest: 0,
    totalPaid: 0,
    perDebt: [],
    neverPaysOff: false,
  }

  if (state.every((d) => d.balance <= 0)) return base

  let totalInterest = 0
  let totalPaid = 0
  let month = 0

  while (state.some((d) => d.balance > 0) && month < maxMonths) {
    month++
    // Spare budget = the fixed extra + minimums freed by already-cleared debts.
    let extra =
      extraPerMonth +
      state.reduce((sum, d) => (d.balance <= 0 ? sum + d.minPayment : sum), 0)

    // 1) Accrue interest + pay minimums on all active debts.
    for (const d of state) {
      if (d.balance <= 0) continue
      const interest = round2(d.balance * (d.apr / 12))
      d.interestPaid = round2(d.interestPaid + interest)
      totalInterest = round2(totalInterest + interest)
      const pay = round2(Math.min(d.minPayment, d.balance + interest))
      d.balance = round2(d.balance + interest - pay)
      totalPaid = round2(totalPaid + pay)
      if (d.balance <= 0) d.payoffMonth = month
    }

    // 2) Funnel all spare budget into the first active (target) debt, rolling
    //    overflow to the next once one clears within the same month.
    for (const d of state) {
      if (extra <= 0) break
      if (d.balance <= 0) continue
      const pay = round2(Math.min(extra, d.balance))
      d.balance = round2(d.balance - pay)
      totalPaid = round2(totalPaid + pay)
      extra = round2(extra - pay)
      if (d.balance <= 0 && d.payoffMonth === 0) d.payoffMonth = month
    }
  }

  const neverPaysOff = state.some((d) => d.balance > 0)
  return {
    strategy,
    months: neverPaysOff ? 0 : month,
    totalInterest,
    totalPaid,
    perDebt: state.map((d) => ({
      id: d.id,
      payoffMonth: d.payoffMonth,
      interestPaid: d.interestPaid,
    })),
    neverPaysOff,
  }
}

/** Run both strategies for side-by-side comparison. */
export function compareStrategies(
  debts: DebtInput[],
  extraPerMonth: number,
  opts: { maxMonths?: number } = {},
): { snowball: StrategyResult; avalanche: StrategyResult } {
  return {
    snowball: simulatePayoff(debts, extraPerMonth, 'snowball', opts),
    avalanche: simulatePayoff(debts, extraPerMonth, 'avalanche', opts),
  }
}
