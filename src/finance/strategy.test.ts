import { describe, expect, it } from 'vitest'

import { compareStrategies, simulatePayoff, type DebtInput } from './strategy'

const DEBTS: DebtInput[] = [
  { id: 'big', balance: 1000, apr: 0.2, minPayment: 50 },
  { id: 'small', balance: 500, apr: 0.1, minPayment: 50 },
]

describe('simulatePayoff', () => {
  it('snowball clears the smallest balance first', () => {
    const r = simulatePayoff(DEBTS, 200, 'snowball')
    const small = r.perDebt.find((d) => d.id === 'small')!
    const big = r.perDebt.find((d) => d.id === 'big')!
    expect(small.payoffMonth).toBeLessThanOrEqual(big.payoffMonth)
    expect(r.neverPaysOff).toBe(false)
  })

  it('avalanche never costs more interest than snowball', () => {
    const { snowball, avalanche } = compareStrategies(DEBTS, 200)
    expect(avalanche.totalInterest).toBeLessThanOrEqual(snowball.totalInterest)
  })

  it('clears all debts and reports a finite month count', () => {
    const r = simulatePayoff(DEBTS, 200, 'avalanche')
    expect(r.months).toBeGreaterThan(0)
    expect(r.perDebt.every((d) => d.payoffMonth > 0)).toBe(true)
  })

  it('flags an under-funded plan as never paying off', () => {
    const r = simulatePayoff(
      [{ id: 'x', balance: 1000, apr: 0.3, minPayment: 5 }],
      0,
      'snowball',
    )
    expect(r.neverPaysOff).toBe(true)
    expect(r.months).toBe(0)
  })

  it('returns base result when there is nothing owed', () => {
    const r = simulatePayoff([{ id: 'z', balance: 0, apr: 0.1, minPayment: 10 }], 100, 'snowball')
    expect(r.months).toBe(0)
    expect(r.totalInterest).toBe(0)
  })
})
