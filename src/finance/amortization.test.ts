import { describe, expect, it } from 'vitest'

import { addMonths, amortize } from './amortization'

describe('amortize', () => {
  it('handles 0% APR as equal principal payments', () => {
    const r = amortize(1200, 0, 100)
    expect(r.months).toBe(12)
    expect(r.totalInterest).toBe(0)
    expect(r.totalPaid).toBe(1200)
    expect(r.rows.at(-1)?.balance).toBe(0)
  })

  it('amortizes an interest-bearing balance to zero', () => {
    const r = amortize(1000, 0.12, 100)
    expect(r.neverPaysOff).toBe(false)
    expect(r.rows.at(-1)?.balance).toBe(0)
    expect(r.totalInterest).toBeGreaterThan(0)
    // Total paid is principal plus the interest charged.
    expect(r.totalPaid).toBeCloseTo(1000 + r.totalInterest, 2)
  })

  it('never overpays — principal sums back to the original balance', () => {
    const r = amortize(1000, 0.12, 100)
    const principal = r.rows.reduce((s, row) => s + row.principal, 0)
    expect(Math.round(principal)).toBe(1000)
  })

  it('flags payments that cannot cover interest', () => {
    const r = amortize(1000, 0.12, 5) // interest is 10/mo
    expect(r.neverPaysOff).toBe(true)
    expect(r.rows).toHaveLength(0)
  })

  it('treats a cleared balance as nothing to do', () => {
    expect(amortize(0, 0.2, 100).months).toBe(0)
    expect(amortize(-50, 0.2, 100).months).toBe(0)
  })

  it('pays off faster with extra payment', () => {
    const base = amortize(5000, 0.18, 200)
    const extra = amortize(5000, 0.18, 400)
    expect(extra.months).toBeLessThan(base.months)
    expect(extra.totalInterest).toBeLessThan(base.totalInterest)
  })
})

describe('addMonths', () => {
  it('advances by whole months', () => {
    const d = addMonths(new Date(2026, 0, 15), 3) // Jan → Apr
    expect(d.getFullYear()).toBe(2026)
    expect(d.getMonth()).toBe(3)
  })

  it('rolls over the year boundary', () => {
    const d = addMonths(new Date(2026, 10, 1), 3) // Nov 2026 → Feb 2027
    expect(d.getFullYear()).toBe(2027)
    expect(d.getMonth()).toBe(1)
  })
})
