import { describe, expect, it } from 'vitest'

import type { Category, IncomeSource, Transaction } from '@/data'
import { monthBounds, monthlySurplus } from './surplus'

const categories = new Map<string, Category>([
  ['ess', { id: 'ess', name: 'Rent', code: 'RENT', kind: 'essential', icon: 'Home' }],
  ['disc', { id: 'disc', name: 'Dining', code: 'DINING', kind: 'discretionary', icon: 'Utensils' }],
  ['inc', { id: 'inc', name: 'Income', code: 'INCOME', kind: 'income', icon: 'TrendingUp' }],
])

function txn(amount: number, categoryId: string, date = '2026-06-10'): Transaction {
  return {
    id: `t${amount}${categoryId}${date}`,
    date,
    description: 'x',
    merchant: 'x',
    amount,
    currency: 'PLN',
    categoryId,
    account: 'acct',
    createdAt: `${date}T08:00:00.000Z`,
  }
}

function income(amount: number, kind: IncomeSource['kind'] = 'fixed'): IncomeSource {
  return { id: `i${amount}`, name: 'src', amount, kind, currency: 'PLN', createdAt: '2026-06-01' }
}

describe('monthlySurplus', () => {
  it('computes left = planned income − spend, split by kind', () => {
    const r = monthlySurplus({
      income: [income(6000)],
      transactions: [txn(5000, 'inc'), txn(-2000, 'ess'), txn(-800, 'disc')],
      categoriesById: categories,
    })
    expect(r.income).toBe(6000)
    expect(r.essentials).toBe(2000)
    expect(r.discretionary).toBe(800)
    expect(r.spent).toBe(2800)
    expect(r.incomeReceived).toBe(5000)
    expect(r.left).toBe(3200)
  })

  it('handles zero income (goes negative)', () => {
    const r = monthlySurplus({
      income: [],
      transactions: [txn(-500, 'disc')],
      categoriesById: categories,
    })
    expect(r.income).toBe(0)
    expect(r.left).toBe(-500)
  })

  it('sums variable income sources as estimates', () => {
    const r = monthlySurplus({
      income: [income(5000, 'fixed'), income(1500, 'variable')],
      transactions: [],
      categoriesById: categories,
    })
    expect(r.income).toBe(6500)
    expect(r.left).toBe(6500)
  })

  it('applies the from/to window', () => {
    const r = monthlySurplus({
      income: [income(1000)],
      transactions: [txn(-100, 'disc', '2026-05-31'), txn(-200, 'disc', '2026-06-15')],
      categoriesById: categories,
      from: '2026-06-01',
      to: '2026-06-30',
    })
    expect(r.spent).toBe(200)
  })
})

describe('monthBounds', () => {
  it('returns the first and last day of the month', () => {
    const b = monthBounds(new Date(2026, 1, 15)) // Feb 2026
    expect(b.from).toBe('2026-02-01')
    expect(b.to).toBe('2026-02-28')
  })
})
