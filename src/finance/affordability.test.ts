import { describe, expect, it } from 'vitest'

import { affordability } from './affordability'

describe('affordability', () => {
  it('reports already-affordable items', () => {
    const a = affordability(100, 500, 100)
    expect(a.affordableNow).toBe(true)
    expect(a.months).toBe(0)
    expect(a.remaining).toBe(0)
  })

  it('rounds months up to the next whole month', () => {
    expect(affordability(1000, 250).months).toBe(4)
    expect(affordability(1000, 300).months).toBe(4) // 3.33 → 4
  })

  it('returns null when surplus is zero or negative', () => {
    expect(affordability(1000, 0).months).toBeNull()
    expect(affordability(1000, -50).months).toBeNull()
  })

  it('subtracts what is already saved', () => {
    const a = affordability(1000, 250, 500)
    expect(a.remaining).toBe(500)
    expect(a.months).toBe(2)
  })
})
