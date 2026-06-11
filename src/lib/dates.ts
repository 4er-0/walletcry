/** Date → `YYYY-MM` (the "free by" payoff month shown across screens). */
export function isoMonth(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
