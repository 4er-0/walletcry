/**
 * Chart-data series: turn a transaction list into per-day arrays for the HUD
 * mini-charts (spend-by-day bars, net-position trend line). One value per
 * calendar day across the window, gap-filled with the appropriate identity, so
 * charts always receive a dense oldest→newest series.
 *
 * Note: the app has no real account-balance feed, so the "trend" is the
 * cumulative net of transactions inside the window — a relative net position,
 * not a bank balance.
 */

import type { Transaction } from '@/data'
import { round2 } from './money'

/** Inclusive ISO date window, oldest (`from`) to newest (`to`). */
export interface SeriesWindow {
  from: string
  to: string
}

/** Inclusive ISO `{from,to}` covering the `n` days ending at `today`. */
export function lastNDays(n: number, today: Date = new Date()): SeriesWindow {
  const iso = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate(),
    ).padStart(2, '0')}`
  const start = new Date(today)
  start.setDate(start.getDate() - (n - 1))
  return { from: iso(start), to: iso(today) }
}

/** Enumerate every ISO date in the window, oldest → newest. */
function enumerateDays({ from, to }: SeriesWindow): string[] {
  const [fy, fm, fd] = from.split('-').map(Number)
  const [ty, tm, td] = to.split('-').map(Number)
  const days: string[] = []
  const d = new Date(fy, fm - 1, fd)
  const end = new Date(ty, tm - 1, td)
  while (d <= end) {
    days.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate(),
      ).padStart(2, '0')}`,
    )
    d.setDate(d.getDate() + 1)
  }
  return days
}

/** Sum per-day signed amounts inside the window, keyed by ISO date. */
function netByDay(transactions: Transaction[], window: SeriesWindow): Map<string, number> {
  const byDay = new Map<string, number>()
  for (const t of transactions) {
    if (t.date < window.from || t.date > window.to) continue
    byDay.set(t.date, round2((byDay.get(t.date) ?? 0) + t.amount))
  }
  return byDay
}

/**
 * Total outflow (positive PLN) per calendar day across the window — one entry
 * per day, 0 for days with no spend. Inflows are ignored.
 */
export function spendByDay(transactions: Transaction[], window: SeriesWindow): number[] {
  const byDay = new Map<string, number>()
  for (const t of transactions) {
    if (t.amount >= 0 || t.date < window.from || t.date > window.to) continue
    byDay.set(t.date, round2((byDay.get(t.date) ?? 0) - t.amount))
  }
  return enumerateDays(window).map((day) => byDay.get(day) ?? 0)
}

/**
 * Cumulative net of signed amounts per day across the window (relative net
 * position, starting from 0 on the first day's opening). Flat (carried value)
 * on days without transactions.
 */
export function netPositionTrend(transactions: Transaction[], window: SeriesWindow): number[] {
  const byDay = netByDay(transactions, window)
  let running = 0
  return enumerateDays(window).map((day) => {
    running = round2(running + (byDay.get(day) ?? 0))
    return running
  })
}
