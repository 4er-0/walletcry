import { describe, expect, it } from 'vitest'

import { buildSeedData } from './seed'

// Fixed reference date keeps the generated dataset deterministic.
const TODAY = new Date(2026, 5, 7) // 2026-06-07 (local)

describe('buildSeedData', () => {
  it('is deterministic for a given date', () => {
    const a = buildSeedData(TODAY)
    const b = buildSeedData(TODAY)
    expect(a.transactions).toEqual(b.transactions)
  })

  it('produces every reference table with data', () => {
    const data = buildSeedData(TODAY)
    expect(data.categories.length).toBeGreaterThan(0)
    expect(data.income.length).toBeGreaterThan(0)
    expect(data.debts.length).toBeGreaterThan(0)
    expect(data.wishlist.length).toBeGreaterThan(0)
    expect(data.rules.length).toBeGreaterThan(0)
    expect(data.transactions.length).toBeGreaterThan(20)
  })

  it('has exactly one default catch-all category', () => {
    const defaults = buildSeedData(TODAY).categories.filter((c) => c.isDefault)
    expect(defaults).toHaveLength(1)
    expect(defaults[0].id).toBe('cat_uncategorized')
  })

  it('gives every transaction a known category and unique id', () => {
    const data = buildSeedData(TODAY)
    const catIds = new Set(data.categories.map((c) => c.id))
    const ids = new Set<string>()
    for (const t of data.transactions) {
      expect(catIds.has(t.categoryId)).toBe(true)
      expect(ids.has(t.id)).toBe(false)
      ids.add(t.id)
    }
  })

  it('signs amounts correctly (income positive, spend negative)', () => {
    const data = buildSeedData(TODAY)
    for (const t of data.transactions) {
      if (t.categoryId === 'cat_income') expect(t.amount).toBeGreaterThan(0)
      else expect(t.amount).toBeLessThan(0)
    }
  })

  it('keeps transactions within the requested window', () => {
    const data = buildSeedData(TODAY, 90)
    const dates = data.transactions.map((t) => t.date).sort()
    expect(dates[0] >= '2026-03-09').toBe(true)
    expect(dates[dates.length - 1] <= '2026-06-07').toBe(true)
  })

  it('marks recurring bills (rent appears monthly)', () => {
    const rent = buildSeedData(TODAY).transactions.filter((t) => t.categoryId === 'cat_rent')
    expect(rent.length).toBeGreaterThanOrEqual(3)
    expect(rent.every((t) => t.recurring)).toBe(true)
  })
})
