import { describe, expect, it } from 'vitest'

import { formatMoney, formatPercent, round2 } from './money'

describe('round2', () => {
  it('rounds to two places past float error', () => {
    expect(round2(1.005)).toBe(1.01)
    expect(round2(0.1 + 0.2)).toBe(0.3)
    expect(round2(-43.004)).toBe(-43)
  })
})

describe('formatMoney', () => {
  it('formats PLN with the right magnitude', () => {
    expect(formatMoney(43).replace(/\s/g, '')).toContain('43,00')
  })

  it('prefixes positive values with + only when signed', () => {
    expect(formatMoney(43, 'PLN', { signed: true }).startsWith('+')).toBe(true)
    expect(formatMoney(43, 'PLN').startsWith('+')).toBe(false)
  })

  it('keeps the minus sign on negatives without a + prefix', () => {
    const s = formatMoney(-43, 'PLN', { signed: true })
    expect(s).toContain('-')
    expect(s.startsWith('+')).toBe(false)
  })

  it('honors decimals: 0 for whole-figure HUD numbers', () => {
    expect(formatMoney(8500, 'PLN', { decimals: 0 })).not.toContain(',')
  })
})

describe('formatPercent', () => {
  it('renders an APR fraction as a percent', () => {
    expect(formatPercent(0.1899).replace(/\s/g, '')).toContain('18,99%')
  })
})
