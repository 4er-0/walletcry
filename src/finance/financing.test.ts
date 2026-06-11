import { describe, expect, it } from 'vitest'

import { bnpl, compareFinancing } from './financing'

describe('bnpl', () => {
  it('splits a 0% plan into equal interest-free payments', () => {
    const r = bnpl(1200, 0, 12)
    expect(r.monthlyPayment).toBe(100)
    expect(r.totalInterest).toBe(0)
    expect(r.totalPaid).toBe(1200)
  })

  it('applies the annuity formula for an interest-bearing plan', () => {
    const r = bnpl(1000, 0.12, 12)
    expect(r.monthlyPayment).toBeGreaterThan(88)
    expect(r.monthlyPayment).toBeLessThan(89)
    expect(r.totalInterest).toBeGreaterThan(0)
    expect(r.totalInterest).toBeLessThan(80)
  })

  it('returns zeros for degenerate inputs', () => {
    expect(bnpl(0, 0.1, 12).monthlyPayment).toBe(0)
    expect(bnpl(1000, 0.1, 0).monthlyPayment).toBe(0)
  })
})

describe('compareFinancing', () => {
  it('contrasts saving up against financing now', () => {
    const c = compareFinancing({ price: 1200, apr: 0.12, termMonths: 12, monthlySurplus: 300 })
    expect(c.saveUp.months).toBe(4) // 1200 / 300
    expect(c.saveUp.interestCost).toBe(0)
    expect(c.interestPremium).toBe(c.finance.totalInterest)
    expect(c.finance.totalInterest).toBeGreaterThan(0)
  })

  it('reports null save-up months when surplus is zero', () => {
    const c = compareFinancing({ price: 1200, apr: 0, termMonths: 12, monthlySurplus: 0 })
    expect(c.saveUp.months).toBeNull()
    expect(c.finance.totalInterest).toBe(0)
  })
})
