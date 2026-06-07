/**
 * "Left this month" — the hero safe-to-spend figure: planned income minus
 * everything spent so far this month. Also breaks spend into essential vs
 * discretionary for the cashflow gauge.
 */

import type { Category, IncomeSource, Transaction } from '@/data'
import { round2 } from './money'

export interface SurplusInput {
  /** Configured income sources (monthly estimates; variable ones included). */
  income: IncomeSource[]
  /** Transactions to consider — caller filters to the month, or pass from/to. */
  transactions: Transaction[]
  /** Category lookup for the essential/discretionary split. */
  categoriesById: Map<string, Category>
  /** Optional inclusive ISO date window applied to `transactions`. */
  from?: string
  to?: string
}

export interface SurplusResult {
  /** Planned monthly income (sum of sources). */
  income: number
  /** Total outflow so far (positive number). */
  spent: number
  /** Outflow in essential categories. */
  essentials: number
  /** Outflow in discretionary categories. */
  discretionary: number
  /** Actual income inflow that has landed this month. */
  incomeReceived: number
  /** income − spent. Negative = over budget. */
  left: number
}

/** Inclusive ISO `{from,to}` bounds for the calendar month containing `date`. */
export function monthBounds(date: Date = new Date()): { from: string; to: string } {
  const y = date.getFullYear()
  const m = date.getMonth()
  const iso = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate(),
    ).padStart(2, '0')}`
  return { from: iso(new Date(y, m, 1)), to: iso(new Date(y, m + 1, 0)) }
}

export function monthlySurplus(input: SurplusInput): SurplusResult {
  const { income, categoriesById, from, to } = input
  const txns = input.transactions.filter(
    (t) => (!from || t.date >= from) && (!to || t.date <= to),
  )

  const plannedIncome = round2(income.reduce((sum, s) => sum + s.amount, 0))

  let spent = 0
  let essentials = 0
  let discretionary = 0
  let incomeReceived = 0

  for (const t of txns) {
    if (t.amount > 0) {
      incomeReceived = round2(incomeReceived + t.amount)
      continue
    }
    const out = -t.amount
    spent = round2(spent + out)
    const kind = categoriesById.get(t.categoryId)?.kind
    if (kind === 'essential') essentials = round2(essentials + out)
    else discretionary = round2(discretionary + out)
  }

  return {
    income: plannedIncome,
    spent,
    essentials,
    discretionary,
    incomeReceived,
    left: round2(plannedIncome - spent),
  }
}
