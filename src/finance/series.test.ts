import { describe, expect, it } from 'vitest'

import type { Transaction } from '@/data'
import { lastNDays, netPositionTrend, spendByDay } from './series'

function txn(amount: number, date: string): Transaction {
  return {
    id: `t${amount}${date}`,
    date,
    description: 'x',
    merchant: 'x',
    amount,
    currency: 'PLN',
    categoryId: 'cat',
    account: 'acct',
    createdAt: `${date}T08:00:00.000Z`,
  }
}

const WINDOW = { from: '2026-06-01', to: '2026-06-05' }

describe('spendByDay', () => {
  it('returns all zeros for empty input (one slot per day)', () => {
    expect(spendByDay([], WINDOW)).toEqual([0, 0, 0, 0, 0])
  })

  it('sums outflow per day as positive values, gap-filling quiet days', () => {
    const r = spendByDay(
      [txn(-20, '2026-06-01'), txn(-15.5, '2026-06-01'), txn(-40, '2026-06-04')],
      WINDOW,
    )
    expect(r).toEqual([35.5, 0, 0, 40, 0])
  })

  it('ignores inflows', () => {
    const r = spendByDay([txn(5000, '2026-06-02'), txn(-100, '2026-06-02')], WINDOW)
    expect(r).toEqual([0, 100, 0, 0, 0])
  })

  it('excludes transactions outside the window', () => {
    const r = spendByDay([txn(-99, '2026-05-31'), txn(-50, '2026-06-03'), txn(-99, '2026-06-06')], WINDOW)
    expect(r).toEqual([0, 0, 50, 0, 0])
  })

  it('handles a single-day window', () => {
    expect(spendByDay([txn(-10, '2026-06-01')], { from: '2026-06-01', to: '2026-06-01' })).toEqual([10])
  })
})

describe('netPositionTrend', () => {
  it('returns flat zeros for empty input', () => {
    expect(netPositionTrend([], WINDOW)).toEqual([0, 0, 0, 0, 0])
  })

  it('accumulates signed amounts and carries flat through quiet days', () => {
    const r = netPositionTrend(
      [txn(1000, '2026-06-01'), txn(-200, '2026-06-02'), txn(-300, '2026-06-04')],
      WINDOW,
    )
    expect(r).toEqual([1000, 800, 800, 500, 500])
  })

  it('mixes income and spend on the same day', () => {
    const r = netPositionTrend([txn(500, '2026-06-03'), txn(-120.25, '2026-06-03')], WINDOW)
    expect(r).toEqual([0, 0, 379.75, 379.75, 379.75])
  })

  it('excludes transactions outside the window', () => {
    const r = netPositionTrend([txn(9999, '2026-05-31'), txn(100, '2026-06-05')], WINDOW)
    expect(r).toEqual([0, 0, 0, 0, 100])
  })
})

describe('lastNDays', () => {
  it('covers n days ending today, inclusive', () => {
    const w = lastNDays(14, new Date(2026, 5, 11)) // 2026-06-11
    expect(w).toEqual({ from: '2026-05-29', to: '2026-06-11' })
  })

  it('handles n=1 as a single-day window', () => {
    expect(lastNDays(1, new Date(2026, 5, 11))).toEqual({ from: '2026-06-11', to: '2026-06-11' })
  })

  it('crosses month and year boundaries', () => {
    expect(lastNDays(31, new Date(2026, 0, 15))).toEqual({ from: '2025-12-16', to: '2026-01-15' })
  })
})
