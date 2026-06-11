/**
 * Wishlist affordability: how many months of surplus until an item is within
 * reach. `null` means it's not reachable on the current surplus (e.g. surplus
 * is zero/negative — the UI shows "set income to estimate").
 */

export interface Affordability {
  /** Months until affordable; 0 = already affordable, null = not on current surplus. */
  months: number | null
  /** Remaining amount still to save. */
  remaining: number
  affordableNow: boolean
}

export function affordability(
  price: number,
  monthlySurplus: number,
  alreadySaved = 0,
): Affordability {
  const remaining = Math.max(0, price - alreadySaved)
  if (remaining <= 0) {
    return { months: 0, remaining: 0, affordableNow: true }
  }
  if (monthlySurplus <= 0) {
    return { months: null, remaining, affordableNow: false }
  }
  return {
    months: Math.ceil(remaining / monthlySurplus),
    remaining,
    affordableNow: false,
  }
}
